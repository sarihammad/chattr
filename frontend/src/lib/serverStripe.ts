import Stripe from "stripe";

const apiVersion = "2025-04-30.basil";

let cachedStripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedStripe) {
    return cachedStripe;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  cachedStripe = new Stripe(secret, { apiVersion });
  return cachedStripe;
}
