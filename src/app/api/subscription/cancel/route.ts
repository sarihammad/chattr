import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from "@/middleware/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  rateLimit(req, 10, 60000);
  await requireAuth();

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const canceled = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await db.user.update({
    where: { email: session.user.email },
    data: {
      cancelAtPeriodEnd: true,
      isDowngrading: false,
    },
  });

  return NextResponse.json({ success: true, subscription: canceled });
}
