import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getT } from "@/lib/i18n";
import { EcosystemNotificationPanel } from "@/components/ecosystem/notification-panel";
import { createTicketFromEcosystemEvent, updateTicketStatus } from "@/app/actions/tickets";
import { getIncomingEcosystemEvents } from "@/lib/ecosystem";
import { TicketStatus } from "@/lib/ticket-types";

const timeline = ["Luma Studio", "QuotePilot", "ReserveFlow", "ClientHub", "CommerceKit", "EventPass", "SupportDesk Lite", "API Meter"];

const triageLanes = [
  {
    badge: "OPEN",
    fr: ["Nouveaux", "Tickets entrants a qualifier"],
    en: ["New", "Incoming tickets to triage"],
  },
  {
    badge: "HIGH",
    fr: ["Surveillance SLA", "Priorite et delai de premiere reponse"],
    en: ["SLA watch", "Priority and first-response deadline"],
  },
  {
    badge: "RESOLVED",
    fr: ["Resolus", "Signal ticket.resolved vers API Meter"],
    en: ["Resolved", "ticket.resolved signal to API Meter"],
  },
];

export default async function DashboardPage() {
  const [t, ecosystemEvents, [
    { count: total },
    { count: open },
    { count: inProgress },
    { count: resolved },
    { count: urgent },
  ]] = await Promise.all([
    getT(),
    getIncomingEcosystemEvents("supportdesk-lite", undefined, 12),
    Promise.all([
      supabase.from("Ticket").select("*", { count: "exact", head: true }),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("status", "OPEN"),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("status", "RESOLVED"),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("priority", "URGENT"),
    ]),
  ]);

  const d = t.dashboard;
  const supportedEventTypes = new Set([
    "support.context.created",
    "order.created",
    "event.ticket.created",
    "event.checkin.completed",
  ]);
  const ecosystemTickets = ecosystemEvents.filter((event) => supportedEventTypes.has(event.eventType));
  const locale = t.lang;
  const copy = locale === "fr"
    ? {
        productLabel: `${d.overviewLabel} / operations support`,
        title: "Bureau de triage support",
        intro:
          "SupportDesk Lite demontre une interface SaaS de tickets: source du probleme, priorite, SLA, contexte client, statut et resolution.",
        testTitle: "Ce que tu peux tester ici",
        receives: "Recoit",
        receivesText: "rendez-vous, commandes, evenements ou problemes client.",
        sends: "Transmet",
        sendsText: "ticket.created et ticket.resolved vers API Meter.",
        boilerplate: "Boilerplate",
        boilerplateText: "Supabase, server actions, email-ready et statut workflow.",
        timeline: "Timeline du parcours",
        sla: "SLA cible: 1h premiere reponse",
        news: "Nouveautes de l'ecosysteme",
        ticketsTitle: "Tickets recus de l'ecosysteme",
        ticketsIntro: "ReserveFlow, CommerceKit, EventPass et ClientHub transmettent le contexte complet du client.",
        receivedName: "Nom recu du formulaire",
        createTicket: "Creer le ticket lie",
        empty:
          "Aucun element recu pour l'instant. Creez d'abord un rendez-vous dans ReserveFlow, puis laissez ClientHub, CommerceKit ou EventPass transmettre le contexte support.",
        action: "Action",
        resolve: "Resoudre",
        complete: "Complete",
      }
    : {
        productLabel: `${d.overviewLabel} / support operations`,
        title: "Support triage desk",
        intro:
          "SupportDesk Lite demonstrates a SaaS ticket interface: issue source, priority, SLA, customer context, status, and resolution.",
        testTitle: "What you can test here",
        receives: "Receives",
        receivesText: "bookings, orders, events, or customer issues.",
        sends: "Sends",
        sendsText: "ticket.created and ticket.resolved to API Meter.",
        boilerplate: "Boilerplate",
        boilerplateText: "Supabase, server actions, email-ready flow, and status workflow.",
        timeline: "Journey timeline",
        sla: "Target SLA: 1h first response",
        news: "Ecosystem updates",
        ticketsTitle: "Tickets received from the ecosystem",
        ticketsIntro: "ReserveFlow, CommerceKit, EventPass, and ClientHub send the complete customer context.",
        receivedName: "Name received from the form",
        createTicket: "Create linked ticket",
        empty:
          "No item received yet. Create a ReserveFlow meeting first, then let ClientHub, CommerceKit, or EventPass send support context.",
        action: "Action",
        resolve: "Resolve",
        complete: "Complete",
      };

  const { data: recentRaw } = await supabase
    .from("Ticket")
    .select("id, subject, requesterName, status, priority, createdAt")
    .order("createdAt", { ascending: false })
    .limit(5);
  const recent = recentRaw ?? [];

  const stats = [
    { label: d.totalTickets, value: total },
    { label: d.open,         value: open },
    { label: d.inProgress,   value: inProgress },
    { label: d.resolved,     value: resolved },
    { label: d.urgent,       value: urgent },
  ];

  const statusStyles: Record<string, string> = {
    OPEN: "bg-primary-soft text-primary",
    IN_PROGRESS: "bg-accent-soft text-accent-foreground",
    RESOLVED: "bg-success-soft text-success",
    CLOSED: "bg-muted text-muted-foreground",
  };
  const priorityStyles: Record<string, string> = {
    URGENT: "bg-destructive-soft text-destructive",
    HIGH: "bg-warning-soft text-warning",
    MEDIUM: "bg-accent-soft text-accent-foreground",
    LOW: "bg-muted text-muted-foreground",
  };

  return (
    <main className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_48%,#ffffff_100%)] px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
          <p className="inline-flex rounded-md border bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            KV Portfolio Ecosystem - Demo Mode
          </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {copy.productLabel}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.intro}
            </p>
          </div>
          <section className="rounded-md border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.testTitle}
            </p>
            <div className="mt-3 grid gap-2 text-sm">
              <p><span className="font-semibold">{copy.receives}:</span> {copy.receivesText}</p>
              <p><span className="font-semibold">{copy.sends}:</span> {copy.sendsText}</p>
              <p><span className="font-semibold">{copy.boilerplate}:</span> {copy.boilerplateText}</p>
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(({ label, value }) => (
            <section key={label} className="rounded-md border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <EcosystemNotificationPanel appKey="supportdesk-lite" />
        </div>

        <section className="mt-10 rounded-md border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{copy.timeline}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {timeline.map((item, index) => (
              <span key={item} className={index === 6 ? "rounded-md bg-primary px-3 py-2 text-primary-foreground" : "rounded-md border bg-background px-3 py-2"}>
                {String(index + 1).padStart(2, "0")} {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {triageLanes.map((lane) => {
            const [title, detail] = lane[locale];
            return (
            <article key={lane.badge} className="rounded-md border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{title}</h2>
                <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {lane.badge}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {copy.sla}
              </p>
            </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-md border bg-card shadow-sm">
          <div className="border-b p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.news}
            </p>
            <h2 className="mt-2 font-semibold">{copy.ticketsTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy.ticketsIntro}
            </p>
          </div>
          <div className="divide-y">
            {ecosystemTickets.map((event) => {
              const payload = typeof event.payload === "object" && event.payload !== null
                ? event.payload as Record<string, unknown>
                : {};
              return (
              <article key={event.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border bg-background px-2 py-1 text-xs font-semibold">{event.sourceApp}</span>
                    <span className="font-mono text-xs text-muted-foreground">{event.flowId}</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{event.customerName ?? copy.receivedName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{event.description ?? event.title}</p>
                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                    <span className="rounded-md border bg-background px-3 py-2">Projet: {String(payload.projectName ?? payload.projectType ?? "-")}</span>
                    <span className="rounded-md border bg-background px-3 py-2">Commande: {String(payload.orderNumber ?? "-")}</span>
                    <span className="rounded-md border bg-background px-3 py-2">Evenement: {String(payload.eventName ?? "-")}</span>
                    <span className="rounded-md border bg-background px-3 py-2">Priorite: {event.eventType.includes("order") ? "HIGH" : "MEDIUM"}</span>
                    <span className="rounded-md border bg-background px-3 py-2">Statut: NEW</span>
                    <span className="rounded-md border bg-background px-3 py-2">Source: {event.sourceApp}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 self-center md:items-end">
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold">
                    {event.eventType}
                  </span>
                  <form action={createTicketFromEcosystemEvent}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <button className="rounded-md border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent-soft">
                      {copy.createTicket}
                    </button>
                  </form>
                </div>
              </article>
              );
            })}
            {ecosystemTickets.length === 0 ? (
              <div className="p-5">
                <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                  {copy.empty}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{d.recentTickets}</h2>
            <Link
              href="/dashboard/tickets"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {d.viewAll} <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border bg-card shadow-sm">
            {recent.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                {d.noTickets}{" "}
                <Link href="/support" className="underline">{d.submitOne}</Link>.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">{d.colSubject}</th>
                    <th className="px-5 py-3 text-left font-medium">{d.colRequester}</th>
                    <th className="px-5 py-3 text-left font-medium">{d.colPriority}</th>
                    <th className="px-5 py-3 text-left font-medium">{d.colStatus}</th>
                    <th className="px-5 py-3 text-right font-medium">{copy.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((ticket) => (
                    <tr key={ticket.id} className="border-b last:border-b-0 hover:bg-accent-soft/50">
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline">
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{ticket.requesterName}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority] ?? "bg-muted text-muted-foreground"}`}>
                          {t.tickets.priorityLabels[ticket.priority as keyof typeof t.tickets.priorityLabels] ?? ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[ticket.status] ?? "bg-muted text-muted-foreground"}`}>
                          {t.tickets.statusLabels[ticket.status as keyof typeof t.tickets.statusLabels] ?? ticket.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {ticket.status !== TicketStatus.RESOLVED ? (
                          <form action={updateTicketStatus}>
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <input type="hidden" name="status" value={TicketStatus.RESOLVED} />
                            <button className="rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent-soft">
                              {copy.resolve}
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground">{copy.complete}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
