import Link from "next/link";
import { LayoutDashboard, Settings, Ticket } from "lucide-react";

import { signOutCurrentUser } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getLang } from "@/lib/i18n";
import { translations } from "@/lib/i18n/translations";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  const t = translations[lang].dashboard;

  const navItems = [
    { href: "/dashboard",          label: t.navOverview,  icon: LayoutDashboard },
    { href: "/dashboard/tickets",  label: t.navTickets,   icon: Ticket },
    { href: "/dashboard/settings", label: t.navSettings,  icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-2 px-2 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            SD
          </span>
          <span>SupportDesk Lite</span>
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-primary-soft hover:text-primary"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div>
            <p className="text-sm font-medium">{session?.user?.name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={lang} />
            <form action={signOutCurrentUser}>
              <Button type="submit" variant="secondary">{t.signOut}</Button>
            </form>
          </div>
        </header>
        <div className="border-b bg-accent-soft px-6 py-2 text-xs text-accent-foreground flex items-center gap-4">
          <span>{t.demoBar}</span>
          <Link href="/support" className="font-medium text-primary underline-offset-4 hover:underline shrink-0">
            {t.publicForm}
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
