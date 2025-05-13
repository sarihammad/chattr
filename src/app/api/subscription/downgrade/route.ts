import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { db } from '@/lib/db';
import { requireAuth } from '@/middleware/auth';
import { rateLimit } from "@/middleware/rateLimit";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  rateLimit(req, 10, 60000);
  await requireAuth();

  const { newPriceId } = await req.json();
  console.log('Received newPriceId for downgrade:', newPriceId);
  if (!newPriceId || typeof newPriceId !== 'string' || !newPriceId.startsWith('price_')) {
    return NextResponse.json({ error: 'Invalid or missing price ID' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const scheduled = await stripe.subscriptionSchedules.create({
    customer: user.stripeCustomerId!,
    start_date: currentPeriodEnd,
    end_behavior: 'release',
    phases: [
      {
        items: [
          {
            price: newPriceId,
            quantity: 1,
          },
        ],
        iterations: 1,
      },
    ],
  });

  await db.user.update({
    where: { email: session.user.email },
    data: {
      cancelAtPeriodEnd: true,
      isDowngrading: true,
    },
  });

  return NextResponse.json({ success: true, schedule: scheduled });
}
