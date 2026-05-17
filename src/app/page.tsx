import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle, Clock3, Inbox, MessageSquare, ShieldCheck, Tag, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import { getT } from "@/lib/i18n";

const stack = [
  "Next.js 16 App Router",
  "TypeScript strict",
  "Supabase + PostgreSQL",
  "Auth.js v5",
  "Resend + React Email",
  "Tailwind CSS v4",
  "Zod",
  "Vitest + Playwright",
];

const queue = [
  { client: "Camille Moreau", company: "Studio Moreau", origin: "CommerceKit CK-2026-0001", issue: "Launch kit access and final QA handoff", sla: "1h 12m", priority: "High" },
  { client: "Elliot Moore", company: "Atelier Boutique", origin: "EventPass Design Ops Night", issue: "Workshop material pickup confirmation", sla: "3h 40m", priority: "Medium" },
  { client: "Nadia Fortin", company: "Riverside Condo", origin: "ReserveFlow review", issue: "Post-consultation finish notes", sla: "5h 10m", priority: "Low" },
];

const supportStats = [
  { label: "SLA at risk", value: "2", icon: AlertTriangle },
  { label: "Active queue", value: "18", icon: Inbox },
  { label: "Resolved today", value: "11", icon: CheckCircle },
  { label: "Avg first reply", value: "42m", icon: Clock3 },
];

export default async function Home() {
  const t = await getT();
  const h = t.home;

  const features = [
    { icon: MessageSquare, title: h.feature1Title, description: h.feature1Desc },
    { icon: Tag,           title: h.feature2Title, description: h.feature2Desc },
    { icon: CheckCircle,   title: h.feature3Title, description: h.feature3Desc },
    { icon: Zap,           title: h.feature4Title, description: h.feature4Desc },
  ];

  return (
    <MarketingPageShell>
      <main>
        {/* Demo banner */}
        <div className="border-b bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-sm font-medium">{h.demoBanner}</p>
            <div className="flex shrink-0 items-center gap-3 text-xs opacity-80 font-mono">
              {h.demoCredentials}
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b bg-[linear-gradient(135deg,#f8fbff_0%,#eef4f8_52%,#f8f0e8_100%)]">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-primary">
                {h.heroLabel}
              </p>
              <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-6xl">
                {h.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {h.heroDesc}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/support">
                    {h.submitRequest} <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/dashboard">{h.adminDashboard}</Link>
                </Button>
              </div>
            </div>

            <div className="border bg-[#101820] p-4 text-white shadow-2xl shadow-slate-900/15">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                    {h.adminDashboard}
                  </p>
                  <p className="mt-1 text-xl font-semibold">Support command center</p>
                </div>
                <ShieldCheck className="size-6 text-emerald-300" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {supportStats.map((stat) => (
                  <div key={stat.label} className="border border-white/10 bg-white/[0.06] p-4">
                    <stat.icon className="size-4 text-sky-200" />
                    <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-white/55">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {queue.map((ticket) => (
                  <div key={ticket.origin} className="border border-white/10 bg-white/[0.06] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{ticket.client}</p>
                      <span className="bg-white/10 px-2 py-0.5 text-[11px] text-sky-100">{ticket.sla}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/50">{ticket.company} - {ticket.origin}</p>
                    <p className="mt-2 text-sm text-white/75">{ticket.issue}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                  {h.techStack}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stack.slice(0, 6).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/68">
                      <span className="size-1.5 rounded-full bg-sky-200" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Try the demo */}
        <section className="border-b bg-muted/60">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {h.demoSectionLabel}
            </p>
            <h2 className="text-2xl font-semibold">{h.demoSectionTitle}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary-soft text-sm font-semibold text-primary">1</div>
                <h3 className="font-medium">{h.step1Title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{h.step1Desc}</p>
                <Link href="/support" className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                  {h.step1Cta} <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="rounded-md border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary-soft text-sm font-semibold text-primary">2</div>
                <h3 className="font-medium">{h.step2Title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{h.step2Desc}</p>
                <div className="mt-4 rounded-md border bg-accent-soft p-3 font-mono text-xs leading-6">
                  <p>admin@example.com</p>
                  <p>password123</p>
                </div>
              </div>

              <div className="rounded-md border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary-soft text-sm font-semibold text-primary">3</div>
                <h3 className="font-medium">{h.step3Title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{h.step3Desc}</p>
                <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                  {h.step3Cta} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                KV Portfolio ecosystem
              </p>
              <h2 className="text-3xl font-semibold tracking-normal text-balance">
                {t.lang === "fr" ? "Les tickets ne sont pas generiques: ils viennent des autres modules." : "Tickets are not generic: they come from the other modules."}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {t.lang === "fr"
                  ? "CommerceKit, ReserveFlow, EventPass et ClientHub alimentent la file avec le meme client, la meme commande et le meme contexte."
                  : "CommerceKit, ReserveFlow, EventPass, and ClientHub feed the queue with the same client, order, and context."}
              </p>
            </div>
            <div className="grid gap-3">
              {queue.map((ticket) => (
                <article key={ticket.client} className="grid gap-4 border bg-background p-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="font-semibold">{ticket.issue}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{ticket.client} - {ticket.company}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{ticket.origin}</p>
                  </div>
                  <div className="grid min-w-32 gap-2 text-sm">
                    <span className="border bg-card px-3 py-2">{ticket.priority}</span>
                    <span className="border bg-card px-3 py-2">SLA {ticket.sla}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-background">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {h.featuresLabel}
            </p>
            <h2 className="text-2xl font-semibold">{h.featuresTitle}</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-md border bg-card p-5 shadow-sm">
                  <div className="mb-4 grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-card">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{h.ctaTitle}</h2>
              <p className="mt-1 text-muted-foreground">{h.ctaDesc}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/support">{h.ctaSubmit}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/case-study">{h.ctaCaseStudy}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingPageShell>
  );
}
