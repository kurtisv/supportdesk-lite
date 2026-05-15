import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getPlanFromMetadata, getStripeId, mapStripeSubscription } from "@/modules/billing";

export async function POST(request: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChanged(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = getPlanFromMetadata(session.metadata);
  const stripeCustomerId = getStripeId(session.customer);
  const stripeSubscriptionId = getStripeId(session.subscription);

  if (!userId || !plan || !stripeCustomerId || !stripeSubscriptionId) {
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    }),
    prisma.subscription.upsert({
      where: { stripeSubscriptionId },
      update: {
        stripeCustomerId,
        plan,
        status: "active",
      },
      create: {
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        plan,
        status: "active",
      },
    }),
  ]);
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const mapped = mapStripeSubscription(subscription as unknown as Parameters<typeof mapStripeSubscription>[0]);

  if (!mapped.stripeCustomerId) {
    return;
  }

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: mapped.stripeSubscriptionId },
    select: { plan: true },
  });

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: mapped.stripeSubscriptionId },
    data: {
      stripeCustomerId: mapped.stripeCustomerId,
      plan: mapped.plan ?? existing?.plan,
      status: mapped.status,
      currentPeriodEnd: mapped.currentPeriodEnd,
    },
  });
}
