import { getT } from "@/lib/i18n";

export default async function DashboardSettingsPage() {
  const t = await getT();
  const s = t.settings;

  return (
    <main className="px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          {s.label}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{s.title}</h1>
        <p className="mt-3 text-muted-foreground">{s.subtitle}</p>

        <div className="mt-10 rounded-md border bg-accent-soft p-6">
          <p className="text-sm font-semibold">{s.demoTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground leading-6">{s.demoDesc}</p>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-md border bg-card p-5 opacity-60 pointer-events-none shadow-sm">
            <p className="text-sm font-medium">{s.orgName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.orgNameValue}</p>
          </div>
          <div className="rounded-md border bg-card p-5 opacity-60 pointer-events-none shadow-sm">
            <p className="text-sm font-medium">{s.notifEmail}</p>
            <p className="mt-1 text-sm text-muted-foreground">noreply@example.com</p>
          </div>
          <div className="rounded-md border bg-card p-5 opacity-60 pointer-events-none shadow-sm">
            <p className="text-sm font-medium">{s.teamMembers}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.teamMembersValue}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
