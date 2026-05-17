import { NextResponse } from "next/server";
import { z } from "zod";

import { publishEcosystemEvent } from "@/lib/ecosystem";

const eventSchema = z.object({
  flowId: z.string().min(3),
  sourceApp: z.string().min(2),
  eventType: z.string().min(2),
  entityType: z.string().min(2),
  entityId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  payload: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  actionLabel: z.string().optional().nullable(),
  actionUrl: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid ecosystem event" }, { status: 400 });
  }

  const event = await publishEcosystemEvent({
    ...parsed.data,
    targetApps: ["supportdesk-lite"],
    description: parsed.data.description ?? undefined,
    entityId: parsed.data.entityId ?? undefined,
    customerName: parsed.data.customerName ?? undefined,
    customerEmail: parsed.data.customerEmail ?? undefined,
    actionLabel: parsed.data.actionLabel ?? "Continuer",
    actionUrl: parsed.data.actionUrl ?? "/dashboard",
    priority: parsed.data.priority ?? "NORMAL",
  });

  return NextResponse.json({ ok: Boolean(event), eventId: event?.id, flowId: event?.flowId }, { status: event ? 200 : 500 });
}
