import Link from "next/link";

import { createTicket } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import { getT } from "@/lib/i18n";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const t = await getT();
  const s = t.support;
  const params = await searchParams;

  const categories = [
    { value: "TECHNICAL", label: s.categories.TECHNICAL },
    { value: "BILLING",   label: s.categories.BILLING },
    { value: "ACCOUNT",   label: s.categories.ACCOUNT },
    { value: "FEATURE_REQUEST", label: s.categories.FEATURE_REQUEST },
    { value: "OTHER",     label: s.categories.OTHER },
  ];

  const priorities = [
    { value: "LOW",    label: s.priorities.LOW },
    { value: "MEDIUM", label: s.priorities.MEDIUM },
    { value: "HIGH",   label: s.priorities.HIGH },
    { value: "URGENT", label: s.priorities.URGENT },
  ];

  return (
    <MarketingPageShell>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {s.label}
        </p>
        <h1 className="text-3xl font-semibold">{s.title}</h1>
        <p className="mt-3 text-muted-foreground">{s.subtitle}</p>

        {params.success ? (
          <div className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {s.successMsg}{" "}
            <Link href="/" className="underline">{s.backHome}</Link>
          </div>
        ) : params.error ? (
          <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {s.errorMsg}
          </div>
        ) : null}

        <form action={createTicket} className="mt-8 grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="requesterName">{s.nameLabel}</Label>
            <Input id="requesterName" name="requesterName" required placeholder={s.namePlaceholder} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="requesterEmail">{s.emailLabel}</Label>
            <Input id="requesterEmail" name="requesterEmail" type="email" required placeholder={s.emailPlaceholder} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="subject">{s.subjectLabel}</Label>
            <Input id="subject" name="subject" required placeholder={s.subjectPlaceholder} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">{s.descLabel}</Label>
            <Textarea id="description" name="description" required rows={6} placeholder={s.descPlaceholder} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="category">{s.categoryLabel}</Label>
              <select
                id="category"
                name="category"
                defaultValue="OTHER"
                className="flex h-10 w-full border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="priority">{s.priorityLabel}</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="flex h-10 w-full border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            {s.submit}
          </Button>
        </form>
      </main>
    </MarketingPageShell>
  );
}
