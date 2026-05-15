import Link from "next/link";
import { ArrowRight, CheckCircle, MessageSquare, Tag, Zap } from "lucide-react";

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
        <div className="border-b bg-foreground text-background">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-sm font-medium">{h.demoBanner}</p>
            <div className="flex shrink-0 items-center gap-3 text-xs opacity-80 font-mono">
              {h.demoCredentials}
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
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

            <div className="border bg-card p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {h.techStack}
              </p>
              <div className="grid gap-2">
                {stack.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-foreground/40" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t pt-4">
                <Link
                  href="/case-study"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {h.viewCaseStudy}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Try the demo */}
        <section className="border-t border-b bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {h.demoSectionLabel}
            </p>
            <h2 className="text-2xl font-semibold">{h.demoSectionTitle}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border bg-background p-6">
                <div className="mb-4 flex h-8 w-8 items-center justify-center border text-sm font-semibold">1</div>
                <h3 className="font-medium">{h.step1Title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{h.step1Desc}</p>
                <Link href="/support" className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                  {h.step1Cta} <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="border bg-background p-6">
                <div className="mb-4 flex h-8 w-8 items-center justify-center border text-sm font-semibold">2</div>
                <h3 className="font-medium">{h.step2Title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{h.step2Desc}</p>
                <div className="mt-4 border bg-muted/60 p-3 font-mono text-xs leading-6">
                  <p>admin@example.com</p>
                  <p>password123</p>
                </div>
              </div>

              <div className="border bg-background p-6">
                <div className="mb-4 flex h-8 w-8 items-center justify-center border text-sm font-semibold">3</div>
                <h3 className="font-medium">{h.step3Title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{h.step3Desc}</p>
                <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                  {h.step3Cta} <ArrowRight className="size-3.5" />
                </Link>
              </div>
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
                <div key={f.title} className="border bg-background p-5">
                  <f.icon className="mb-4 size-5 text-muted-foreground" />
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
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
