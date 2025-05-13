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

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.stripeCustomerId || !user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  // 1. Cancel all schedules for this customer
  const schedules = await stripe.subscriptionSchedules.list({
    customer: user.stripeCustomerId,
  });

  for (const schedule of schedules.data) {
    if (schedule.status === 'not_started') {
      await stripe.subscriptionSchedules.cancel(schedule.id);
    }
  }

  // 2. Reactivate the current subscription
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // 3. Update DB
  await db.user.update({
    where: { email: session.user.email },
    data: {
      cancelAtPeriodEnd: false,
      isDowngrading: false,
    },
  });

  return NextResponse.json({ success: true });
}
