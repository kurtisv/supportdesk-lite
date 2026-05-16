import Link from "next/link";

import { MarketingPageShell } from "@/components/marketing/page-shell";
import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getT } from "@/lib/i18n";

export default async function PricingPage() {
  const t = await getT();
  const p = t.pricing;

  const plans = [
    { name: "Starter", price: "$0", planKey: "starter" as const, plan: null },
    { name: "Pro",     price: "$49", planKey: "pro" as const,     plan: "PRO" },
    { name: "Business",price: "$149", planKey: "business" as const, plan: "BUSINESS" },
  ];

  return (
    <MarketingPageShell>
      <Section className="bg-[linear-gradient(135deg,#fbfaf7_0%,#f7efe2_58%,#fbfaf7_100%)]">
        <h1 className="text-4xl font-semibold text-primary">{p.title}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{p.subtitle}</p>
        <p className="mt-2 inline-block rounded-md border bg-accent-soft px-3 py-2 text-sm text-accent-foreground">
          {p.demoNotice}{" "}
          <Link href="/case-study" className="underline underline-offset-4">
            {p.readCaseStudy}
          </Link>
          .
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.name === "Pro" ? <Badge className="border-primary/20 bg-primary-soft text-primary">{p.popular}</Badge> : null}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">{p.perMonth}</span>
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{p.plans[plan.planKey].desc}</p>
                <ul className="mt-4 grid gap-1.5">
                  {p.plans[plan.planKey].features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant="secondary" disabled>
                  {plan.plan ? p.notAvailable : p.currentPlan}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </MarketingPageShell>
  );
}
