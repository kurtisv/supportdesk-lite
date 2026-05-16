import Link from "next/link";

import { getLang } from "@/lib/i18n";
import { translations } from "@/lib/i18n/translations";

export async function Footer() {
  const lang = await getLang();
  const t = translations[lang].footer;

  return (
    <footer className="border-t bg-accent-soft/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-primary">SupportDesk Lite</p>
          <p className="mt-2 max-w-xs">{t.description}</p>
        </div>
        <div className="grid gap-2">
          <p className="font-medium text-foreground">{t.demoCol}</p>
          <Link href="/support" className="hover:text-foreground">{t.submitRequest}</Link>
          <Link href="/dashboard" className="hover:text-foreground">{t.adminDashboard}</Link>
          <Link href="/login" className="hover:text-foreground">{t.adminLogin}</Link>
        </div>
        <div className="grid gap-2">
          <p className="font-medium text-foreground">{t.projectCol}</p>
          <Link href="/case-study" className="hover:text-foreground">{t.caseStudy}</Link>
          <Link href="/pricing" className="hover:text-foreground">{t.pricing}</Link>
        </div>
        <div className="grid gap-2">
          <p className="font-medium text-foreground">{t.portfolioCol}</p>
          <p>{t.portfolioProject}</p>
          <p>{t.boilerplate}</p>
        </div>
      </div>
    </footer>
  );
}
