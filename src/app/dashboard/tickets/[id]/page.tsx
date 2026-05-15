import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addTicketComment,
  updateTicketPriority,
  updateTicketStatus,
} from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, t] = await Promise.all([params, getT()]);
  const td = t.ticketDetail;

  const [{ data: ticketRow }, { data: commentsRaw }] = await Promise.all([
    supabase.from("Ticket").select("*").eq("id", id).maybeSingle(),
    supabase.from("TicketComment").select("*").eq("ticketId", id).order("createdAt", { ascending: true }),
  ]);

  if (!ticketRow) notFound();

  type CommentRow = { id: string; authorName: string; isInternal: boolean; createdAt: string; body: string };
  const comments = (commentsRaw ?? []) as CommentRow[];
  const ticket = { ...ticketRow, comments };
  const ref = ticket.id.slice(-8).toUpperCase();
  const locale = t.lang === "fr" ? "fr-CA" : "en-CA";

  return (
    <main className="px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/tickets" className="hover:underline">{td.backLabel}</Link>
          <span>/</span>
          <span>#{ref}</span>
        </div>
        <h1 className="text-2xl font-semibold">{ticket.subject}</h1>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${statusStyles[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
            {td.statusLabels[ticket.status as keyof typeof td.statusLabels] ?? ticket.status}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority] ?? "bg-gray-100 text-gray-600"}`}>
            {td.priorityLabels[ticket.priority as keyof typeof td.priorityLabels] ?? ticket.priority}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
            {td.categoryLabels[ticket.category as keyof typeof td.categoryLabels] ?? ticket.category}
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-8">
            {/* Description */}
            <section className="border bg-background p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">{ticket.requesterName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleString(locale)}
                </p>
              </div>
              <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </section>

            {/* Comments */}
            {comments.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {td.commentsTitle}
                </h2>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`border p-4 ${comment.isInternal ? "border-dashed bg-muted/40" : "bg-background"}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{comment.authorName}</p>
                        {comment.isInternal && (
                          <span className="text-xs text-muted-foreground">{td.internalNote}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString(locale)}
                      </p>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {/* Add comment */}
            <section className="border bg-background p-5">
              <h2 className="mb-4 text-sm font-semibold">{td.addCommentTitle}</h2>
              <form action={addTicketComment} className="space-y-4">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <div className="grid gap-1.5">
                  <Label htmlFor="body">{td.commentLabel}</Label>
                  <Textarea id="body" name="body" required rows={4} placeholder={td.commentPlaceholder} />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="isInternal" value="true" />
                    {td.internalCheck}
                  </label>
                  <Button type="submit" size="sm">{td.addCommentBtn}</Button>
                </div>
              </form>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Requester info */}
            <div className="border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {td.requesterTitle}
              </p>
              <p className="text-sm font-medium">{ticket.requesterName}</p>
              <p className="text-sm text-muted-foreground">{ticket.requesterEmail}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {td.submittedLabel} {new Date(ticket.createdAt).toLocaleDateString(locale)}
              </p>
            </div>

            {/* Update status */}
            <div className="border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {td.statusTitle}
              </p>
              <form action={updateTicketStatus} className="space-y-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <select
                  name="status"
                  defaultValue={ticket.status}
                  className="flex h-9 w-full border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {td.statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="secondary" className="w-full">
                  {td.updateStatus}
                </Button>
              </form>
            </div>

            {/* Update priority */}
            <div className="border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {td.priorityTitle}
              </p>
              <form action={updateTicketPriority} className="space-y-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <select
                  name="priority"
                  defaultValue={ticket.priority}
                  className="flex h-9 w-full border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {td.priorityOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="secondary" className="w-full">
                  {td.updatePriority}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
