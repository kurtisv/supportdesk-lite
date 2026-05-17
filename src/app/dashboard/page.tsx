import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getT } from "@/lib/i18n";
import { EcosystemNotificationPanel } from "@/components/ecosystem/notification-panel";
import { getIncomingEcosystemEvents } from "@/lib/ecosystem";

export default async function DashboardPage() {
  const [t, ecosystemTickets, [
    { count: total },
    { count: open },
    { count: inProgress },
    { count: resolved },
    { count: urgent },
  ]] = await Promise.all([
    getT(),
    getIncomingEcosystemEvents("supportdesk-lite", undefined, 8),
    Promise.all([
      supabase.from("Ticket").select("*", { count: "exact", head: true }),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("status", "OPEN"),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("status", "RESOLVED"),
      supabase.from("Ticket").select("*", { count: "exact", head: true }).eq("priority", "URGENT"),
    ]),
  ]);

  const d = t.dashboard;

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
    <main className="px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {d.overviewLabel}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{d.overview}</h1>
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

        <section className="mt-10 rounded-md border bg-card shadow-sm">
          <div className="border-b p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Nouveautes de l'ecosysteme
            </p>
            <h2 className="mt-2 font-semibold">Tickets recus de l'ecosysteme</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ReserveFlow, CommerceKit, EventPass et ClientHub transmettent le contexte complet du client.
            </p>
          </div>
          <div className="divide-y">
            {ecosystemTickets.map((event) => (
              <article key={event.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border bg-background px-2 py-1 text-xs font-semibold">{event.sourceApp}</span>
                    <span className="font-mono text-xs text-muted-foreground">{event.flowId}</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{event.customerName ?? "Client ecosysteme"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{event.description ?? event.title}</p>
                </div>
                <span className="self-center rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold">
                  {event.eventType}
                </span>
              </article>
            ))}
            {ecosystemTickets.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                Aucun ticket entrant pour l'instant. Une commande, un evenement ou un projet alimentera cette file.
              </p>
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
