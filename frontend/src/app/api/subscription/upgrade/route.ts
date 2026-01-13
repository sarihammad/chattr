// src/app/api/subscription/upgrade/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from '@/middleware/auth';
import { getStripeClient } from '@/lib/serverStripe';

export async function POST(req: Request) {
  rateLimit(req, 10, 60000);
  const session = await requireAuth();
  const email = session.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'User session invalid' }, { status: 401 });
  }

  const { newPriceId } = await req.json();

  if (!newPriceId || typeof newPriceId !== 'string') {
    return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const stripe = getStripeClient();
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
