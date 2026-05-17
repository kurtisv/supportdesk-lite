import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { canBootstrapDashboard, dashboardRoles, isDashboardRole } from "@/lib/dashboard-auth-rules";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";

export async function requireDashboardAccess() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      userId: "recruiter-demo",
      email: "recruiter-demo@kvportfolio.dev",
      organizationId: "portfolio-demo",
      role: "OWNER",
    };
  }

  const email = session.user.email;

  // Find or create the user row
  let { data: user } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    const now = new Date().toISOString();
    const { data: created } = await supabase
      .from("User")
      .insert({
        id: crypto.randomUUID(),
        email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        updatedAt: now,
      })
      .select("id")
      .single();

    if (!created) redirect("/login");
    user = created;
  }

  const userId = user.id;

  // Check existing membership with a dashboard role
  const { data: membership } = await supabase
    .from("Membership")
    .select("organizationId, role")
    .eq("userId", userId)
    .in("role", [...dashboardRoles])
    .maybeSingle();

  if (membership && isDashboardRole(membership.role as Parameters<typeof isDashboardRole>[0])) {
    return {
      userId,
      email,
      organizationId: membership.organizationId as string,
      role: membership.role,
    };
  }

  // Bootstrap check
  const { count: membershipCount } = await supabase
    .from("Membership")
    .select("*", { count: "exact", head: true });

  if (
    canBootstrapDashboard({
      email,
      bootstrapEmails: env.DASHBOARD_BOOTSTRAP_EMAILS,
      membershipCount: membershipCount ?? 0,
      nodeEnv: process.env.NODE_ENV,
    })
  ) {
    // Find or create default org
    let { data: org } = await supabase
      .from("Organization")
      .select("id")
      .eq("slug", "default")
      .maybeSingle();

    if (!org) {
      const orgNow = new Date().toISOString();
      const { data: created } = await supabase
        .from("Organization")
        .insert({ id: crypto.randomUUID(), name: "Default Organization", slug: "default", updatedAt: orgNow })
        .select("id")
        .single();
      if (!created) redirect("/dashboard?error=forbidden");
      org = created;
    }

    const orgId = org!.id as string;

    // Find or create membership
    let { data: existingMembership } = await supabase
      .from("Membership")
      .select("organizationId, role")
      .eq("userId", userId)
      .eq("organizationId", orgId)
      .maybeSingle();

    if (!existingMembership) {
      const { data: created } = await supabase
        .from("Membership")
        .insert({ id: crypto.randomUUID(), userId, organizationId: orgId, role: "OWNER" })
        .select("organizationId, role")
        .single();
      if (!created) redirect("/dashboard?error=forbidden");
      existingMembership = created;
    }

    return {
      userId,
      email,
      organizationId: existingMembership!.organizationId as string,
      role: existingMembership!.role,
    };
  }

  redirect("/dashboard?error=forbidden");
}
