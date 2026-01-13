import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStripeClient } from '@/lib/serverStripe';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from "@/middleware/auth";

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

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const stripe = getStripeClient();
  const canceled = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await db.user.update({
    where: { email },
    data: {
      cancelAtPeriodEnd: true,
      isDowngrading: false,
    },
  });

  return NextResponse.json({ success: true, subscription: canceled });
}
