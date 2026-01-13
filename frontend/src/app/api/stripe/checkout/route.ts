import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from "@/middleware/auth";
import type { NextRequest } from 'next/server';
import { getStripeClient } from '@/lib/serverStripe';

export async function POST(req: NextRequest) {
  rateLimit(req, 10, 60000);
  const session = await requireAuth();
  const email = session.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'User session invalid' }, { status: 401 });
  }

  const { plan } = await req.json();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stripe = getStripeClient();

  if (plan !== 'monthly' && plan !== 'yearly') {
    return NextResponse.json({ error: 'Plan must be monthly or yearly' }, { status: 400 });
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
  const stripe = getStripeClient();
  const customer = await stripe.customers.create({ email });
  await db.user.update({ where: { email }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}
