// src/app/api/subscription/upgrade/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { db } from '@/lib/db';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from '@/middleware/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  rateLimit(req, 10, 60000);
  await requireAuth();

  const { newPriceId } = await req.json();

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

  const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false, // upgrades happen immediately
    proration_behavior: 'create_prorations',
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });

  const invoice = await stripe.invoices.create({
    customer: subscription.customer as string,
    description: 'Proration for upgrade',
  });

  if (!invoice.id) {
    return NextResponse.json({ error: 'Invoice ID is undefined' }, { status: 400 });
  }
  await stripe.invoices.pay(invoice.id);

  return NextResponse.json({ success: true, subscription: updated });
}
