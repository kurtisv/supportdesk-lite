"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { stripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db";
import { buildCheckoutMetadata, checkoutPlanSchema, getPlanPriceId } from "@/modules/billing";

export async function createCheckoutSession(formData: FormData) {
  const parsedPlan = checkoutPlanSchema.safeParse(formData.get("plan"));

  if (!parsedPlan.success) {
    redirect("/pricing?error=invalid-plan");
  }

  if (!stripe) {
    redirect("/pricing?error=stripe-not-configured");
  }

  const priceId = getPlanPriceId({
    plan: parsedPlan.data,
    proPriceId: env.STRIPE_PRICE_PRO,
    businessPriceId: env.STRIPE_PRICE_BUSINESS,
  });

  if (!priceId) {
    redirect("/pricing?error=missing-price");
  }

  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.upsert({
        where: { email: session.user.email },
        update: {},
        create: {
          email: session.user.email,
          name: session.user.name,
        },
        select: { id: true, email: true, stripeCustomerId: true },
      })
    : null;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user?.stripeCustomerId ?? undefined,
    customer_email: user?.stripeCustomerId ? undefined : user?.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    metadata: buildCheckoutMetadata({ plan: parsedPlan.data, userId: user?.id }),
  });

  if (!checkout.url) {
    redirect("/pricing?error=checkout-url");
  }

  redirect(checkout.url);
}

export async function createBillingPortalSession() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!stripe) {
    redirect("/dashboard/billing?error=stripe-not-configured");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    redirect("/dashboard/billing?error=missing-customer");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  redirect(portal.url);
}
