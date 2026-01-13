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

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user?.stripeCustomerId || !user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const stripe = getStripeClient();
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
    where: { email },
    data: {
      cancelAtPeriodEnd: false,
      isDowngrading: false,
    },
  });

  return NextResponse.json({ success: true });
}
