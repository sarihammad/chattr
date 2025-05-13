import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from "@/middleware/auth";
import type { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  rateLimit(req, 10, 60000);
  await requireAuth();

  const { plan } = await req.json();
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stripeCustomerId = user.stripeCustomerId || (await createOrGetCustomer(user.email));

  const priceId = plan === 'monthly'
    ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
    subscription_data: {
      trial_period_days: 7,
    },
    metadata: { userId: user.id },
  });

  return NextResponse.json({ sessionId: checkoutSession.id });
}

async function createOrGetCustomer(email: string) {
  const customer = await stripe.customers.create({ email });
  await db.user.update({ where: { email }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}
