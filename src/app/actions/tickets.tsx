"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { TicketCreatedEmail } from "@/emails/ticket-created";
import { TicketStatusUpdatedEmail } from "@/emails/ticket-status-updated";
import { TicketCategory, TicketPriority, TicketStatus } from "@/lib/ticket-types";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { linkEcosystemEntities, publishEcosystemEvent } from "@/lib/ecosystem";
import { supabase } from "@/lib/supabase";
import { sendTransactionalEmail } from "@/lib/email/resend";

const createTicketSchema = z.object({
  requesterName: z.string().min(1).max(100),
  requesterEmail: z.string().email(),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
});

function payloadOf(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createTicket(formData: FormData) {
  const parsed = createTicketSchema.safeParse({
    requesterName: formData.get("requesterName"),
    requesterEmail: formData.get("requesterEmail"),
    subject: formData.get("subject"),
    description: formData.get("description"),
    category: formData.get("category"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    redirect("/support?error=invalid");
  }

  const now = new Date().toISOString();
  const { data: ticket, error } = await supabase
    .from("Ticket")
    .insert({
      id: crypto.randomUUID(),
      requesterName: parsed.data.requesterName,
      requesterEmail: parsed.data.requesterEmail,
      subject: parsed.data.subject,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority,
      status: TicketStatus.OPEN,
      updatedAt: now,
    })
    .select()
    .single();

  if (error || !ticket) {
    redirect("/support?error=invalid");
  }

  await sendTransactionalEmail({
    to: ticket.requesterEmail,
    subject: `Support request received: ${ticket.subject}`,
    react: (
      <TicketCreatedEmail
        requesterName={ticket.requesterName}
        ticketId={ticket.id}
        subject={ticket.subject}
      />
    ),
  });

  await publishEcosystemEvent({
    sourceApp: "supportdesk-lite",
    targetApps: ["clienthub", "api-meter"],
    eventType: "ticket.created",
    entityType: "ticket",
    entityId: ticket.id,
    customerName: ticket.requesterName,
    customerEmail: ticket.requesterEmail,
    title: "Ticket ouvert dans SupportDesk Lite",
    description: `${ticket.requesterName} a ouvert le ticket: ${ticket.subject}.`,
    payload: {
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
    },
    priority: ticket.priority === TicketPriority.URGENT ? "URGENT" : ticket.priority === TicketPriority.HIGH ? "HIGH" : "NORMAL",
    actionLabel: "Voir le ticket",
    actionUrl: `/dashboard/tickets/${ticket.id}`,
  });

  revalidatePath("/dashboard/tickets");
  redirect("/support?success=1");
}

export async function createTicketFromEcosystemEvent(formData: FormData) {
  await requireDashboardAccess();

  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) return;

  const { data: event, error: eventError } = await supabase
    .from("EcosystemEvent")
    .select("id, flowId, sourceApp, eventType, entityType, entityId, customerName, customerEmail, title, description, payload")
    .eq("id", eventId)
    .single();

  if (eventError || !event) return;

  const payload = payloadOf(event.payload);
  const requesterName = event.customerName || text(payload.customerName) || "Client ecosysteme";
  const requesterEmail = event.customerEmail || text(payload.customerEmail) || "client@ecosystem.local";
  const subject = `Suivi ${event.sourceApp}: ${event.title}`.slice(0, 200);
  const linkedEntityType = event.entityType ?? event.eventType;
  const linkedEntityId = event.entityId ?? event.id;
  const now = new Date().toISOString();

  const { data: ticket, error } = await supabase
    .from("Ticket")
    .insert({
      id: crypto.randomUUID(),
      requesterName,
      requesterEmail,
      subject,
      description: [
        event.description ?? event.title,
        `Source: ${event.sourceApp} / ${event.eventType}`,
        `Flow: ${event.flowId}`,
      ].join("\n"),
      category: TicketCategory.OTHER,
      priority: event.eventType.includes("ticket") ? TicketPriority.HIGH : TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      flowId: event.flowId,
      sourceApp: event.sourceApp,
      sourceEventId: event.id,
      linkedEntityType,
      linkedEntityId,
      contextJson: {
        sourceEvent: event,
        payload,
      },
      updatedAt: now,
    })
    .select()
    .single();

  if (error || !ticket) return;

  await linkEcosystemEntities({
    flowId: event.flowId,
    fromApp: event.sourceApp,
    fromEntityType: event.entityType,
    fromEntityId: event.entityId ?? event.id,
    toApp: "supportdesk-lite",
    toEntityType: "ticket",
    toEntityId: ticket.id,
  });

  await publishEcosystemEvent({
    flowId: event.flowId,
    sourceApp: "supportdesk-lite",
    targetApps: ["clienthub", "api-meter"],
    eventType: "ticket.created",
    entityType: "ticket",
    entityId: ticket.id,
    customerName: ticket.requesterName,
    customerEmail: ticket.requesterEmail,
    title: "Ticket SupportDesk cree depuis le parcours reel",
    description: `${ticket.requesterName} a un ticket lie a ${event.sourceApp}: ${event.title}.`,
    payload: {
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      linkedEntityType,
      linkedEntityId,
      sourceApp: event.sourceApp,
      sourceEventId: event.id,
      flowId: event.flowId,
    },
    priority: ticket.priority === TicketPriority.URGENT ? "URGENT" : ticket.priority === TicketPriority.HIGH ? "HIGH" : "NORMAL",
    actionLabel: "Voir le ticket",
    actionUrl: `/dashboard/tickets/${ticket.id}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tickets");
  redirect(`/dashboard/tickets/${ticket.id}`);
}

const updateStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.nativeEnum(TicketStatus),
});

export async function updateTicketStatus(formData: FormData) {
  await requireDashboardAccess();

  const parsed = updateStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  const { data: ticket, error } = await supabase
    .from("Ticket")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.ticketId)
    .select()
    .single();

  if (error || !ticket) return;

  if (parsed.data.status === TicketStatus.RESOLVED) {
    await publishEcosystemEvent({
      flowId: ticket.flowId ?? undefined,
      sourceApp: "supportdesk-lite",
      targetApps: ["clienthub", "api-meter"],
      eventType: "ticket.resolved",
      entityType: "ticket",
      entityId: ticket.id,
      customerName: ticket.requesterName,
      customerEmail: ticket.requesterEmail,
      title: "Ticket resolu dans SupportDesk Lite",
      description: `${ticket.requesterName} a un ticket resolu: ${ticket.subject}.`,
      payload: {
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        linkedEntityType: ticket.linkedEntityType,
        linkedEntityId: ticket.linkedEntityId,
        flowId: ticket.flowId,
      },
      priority: "NORMAL",
      actionLabel: "Voir l'activite",
      actionUrl: "/dashboard",
    });
  }

  await sendTransactionalEmail({
    to: ticket.requesterEmail,
    subject: `Your ticket status has been updated`,
    react: (
      <TicketStatusUpdatedEmail
        requesterName={ticket.requesterName}
        ticketId={ticket.id}
        subject={ticket.subject}
        newStatus={parsed.data.status}
      />
    ),
  });

  revalidatePath(`/dashboard/tickets/${parsed.data.ticketId}`);
  revalidatePath("/dashboard/tickets");
  revalidatePath("/dashboard");
}

const updatePrioritySchema = z.object({
  ticketId: z.string().min(1),
  priority: z.nativeEnum(TicketPriority),
});

export async function updateTicketPriority(formData: FormData) {
  await requireDashboardAccess();

  const parsed = updatePrioritySchema.safeParse({
    ticketId: formData.get("ticketId"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) return;

  await supabase
    .from("Ticket")
    .update({ priority: parsed.data.priority })
    .eq("id", parsed.data.ticketId);

  revalidatePath(`/dashboard/tickets/${parsed.data.ticketId}`);
  revalidatePath("/dashboard/tickets");
}

const addCommentSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1).max(5000),
  isInternal: z.coerce.boolean(),
});

export async function addTicketComment(formData: FormData) {
  await requireDashboardAccess();

  const session = await import("@/lib/auth").then((m) => m.auth());

  const parsed = addCommentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
    isInternal: formData.get("isInternal") === "true",
  });

  if (!parsed.success) return;

  await supabase.from("TicketComment").insert({
    id: crypto.randomUUID(),
    ticketId: parsed.data.ticketId,
    authorName: session?.user?.name ?? "Admin",
    authorEmail: session?.user?.email ?? null,
    body: parsed.data.body,
    isInternal: parsed.data.isInternal,
  });

  revalidatePath(`/dashboard/tickets/${parsed.data.ticketId}`);
}
