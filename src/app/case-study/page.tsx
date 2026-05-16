import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import { getT } from "@/lib/i18n";

const techStack = [
  { name: "Next.js 16 App Router", note: "Server components, server actions, file-based routing — no API layer needed." },
  { name: "TypeScript strict",     note: "End-to-end type safety from database to UI." },
  { name: "Supabase + PostgreSQL", note: "Managed Postgres accessed via REST API. Bypasses pgBouncer TCP issues entirely." },
  { name: "Auth.js v5",            note: "JWT sessions with Credentials provider. No database adapter calls during auth." },
  { name: "Resend + React Email",  note: "Transactional emails rendered as React components. Graceful fallback in dev." },
  { name: "Tailwind CSS v4",       note: "Utility-first styling with a consistent shadcn-inspired component set." },
  { name: "Zod",                   note: "Runtime validation on every server action input — the only trust boundary in the app." },
  { name: "Vitest + Playwright",   note: "Unit tests for business logic, E2E smoke tests for the critical paths." },
];

export default async function CaseStudyPage() {
  const t = await getT();
  const c = t.caseStudy;

  return (
    <MarketingPageShell>
      <main>
        <section className="border-b bg-[linear-gradient(135deg,#fbfaf7_0%,#f7efe2_56%,#f3e6e9_100%)]">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-primary">
              {c.label}
            </p>
            <h1 className="text-4xl font-semibold">SupportDesk Lite</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{c.subtitle}</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-14">
        <section>
          <h2 className="text-xl font-semibold">{c.problemTitle}</h2>
          <p className="mt-3 text-muted-foreground leading-7">{c.problemDesc}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{c.solutionTitle}</h2>
          <p className="mt-3 text-muted-foreground leading-7">{c.solutionDesc}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{c.featuresTitle}</h2>
          <ul className="mt-4 grid gap-2">
            {c.features.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{c.stackTitle}</h2>
          <div className="mt-4 grid gap-3">
            {techStack.map((tech) => (
              <div key={tech.name} className="rounded-md border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-primary">{tech.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{tech.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{c.demonstratesTitle}</h2>
          <ul className="mt-4 grid gap-2">
            {c.demonstrates.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-md border bg-accent-soft p-6">
          <h2 className="font-semibold">{c.boilerplateTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-6">
            {c.boilerplateDesc.split("kv-web-starter").map((part, i) =>
              i === 0 ? (
                part
              ) : (
                <span key={i}>
                  <span className="font-medium text-foreground">kv-web-starter</span>
                  {part}
                </span>
              )
            )}
          </p>
        </section>

        <div className="mt-12 flex gap-3">
          <Button asChild>
            <Link href="/support">{c.tryIt}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">{c.adminDashboard}</Link>
          </Button>
        </div>
        </div>
      </main>
    </MarketingPageShell>
  );
}
