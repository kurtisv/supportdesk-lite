import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getT } from "@/lib/i18n";

export default async function DashboardPage() {
  const [t, [
    { count: total },
    { count: open },
    { count: inProgress },
    { count: resolved },
    { count: urgent },
  ]] = await Promise.all([
    getT(),
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
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-purple-100 text-purple-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-600",
  };
  const priorityStyles: Record<string, string> = {
    URGENT: "bg-red-100 text-red-700",
    HIGH: "bg-orange-100 text-orange-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-gray-100 text-gray-600",
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
            <section key={label} className="border bg-card p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
            </section>
          ))}
        </div>

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
          <div className="border bg-background">
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
                    <tr key={ticket.id} className="border-b last:border-b-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline">
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{ticket.requesterName}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority] ?? "bg-gray-100 text-gray-600"}`}>
                          {t.tickets.priorityLabels[ticket.priority as keyof typeof t.tickets.priorityLabels] ?? ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${statusStyles[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
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
