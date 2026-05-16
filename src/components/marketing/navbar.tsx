import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { getLang } from "@/lib/i18n";
import { translations } from "@/lib/i18n/translations";

export async function Navbar() {
  const lang = await getLang();
  const t = translations[lang].nav;

  const navItems = [
    { href: "/support", label: t.support },
    { href: "/case-study", label: t.caseStudy },
    { href: "/pricing", label: t.pricing },
  ];

  return (
    <header className="border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            SD
          </span>
          <span>SupportDesk Lite</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher current={lang} />
          <Button asChild size="sm">
            <Link href="/login">{t.adminLogin}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
