import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { getT } from "@/lib/i18n";

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

export default async function TicketsPage() {
  const [t, { data: ticketsRaw }] = await Promise.all([
    getT(),
    supabase
      .from("Ticket")
      .select("id, subject, requesterName, requesterEmail, status, priority, category, createdAt")
      .order("createdAt", { ascending: false }),
  ]);

  const tk = t.tickets;
  const tickets = ticketsRaw ?? [];

  return (
    <main className="px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {tk.label}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{tk.title}</h1>
          </div>
          <Link href="/support" className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline">
            {tk.publicForm}
          </Link>
        </div>

        <div className="border bg-background">
          {tickets.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">{tk.noTickets}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">{tk.colSubject}</th>
                  <th className="px-5 py-3 text-left font-medium">{tk.colRequester}</th>
                  <th className="hidden px-5 py-3 text-left font-medium lg:table-cell">{tk.colCategory}</th>
                  <th className="px-5 py-3 text-left font-medium">{tk.colPriority}</th>
                  <th className="px-5 py-3 text-left font-medium">{tk.colStatus}</th>
                  <th className="hidden px-5 py-3 text-left font-medium md:table-cell">{tk.colCreated}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-b-0 hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{ticket.subject}</td>
                    <td className="px-5 py-3">
                      <p className="text-foreground">{ticket.requesterName}</p>
                      <p className="text-xs text-muted-foreground">{ticket.requesterEmail}</p>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">
                      {tk.categoryLabels[ticket.category as keyof typeof tk.categoryLabels] ?? ticket.category}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority] ?? "bg-gray-100 text-gray-600"}`}>
                        {tk.priorityLabels[ticket.priority as keyof typeof tk.priorityLabels] ?? ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${statusStyles[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {tk.statusLabels[ticket.status as keyof typeof tk.statusLabels] ?? ticket.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                      {new Date(ticket.createdAt).toLocaleDateString(t.lang === "fr" ? "fr-CA" : "en-CA")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                        {tk.view}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
