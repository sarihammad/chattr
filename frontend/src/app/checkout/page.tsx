"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plan) return;

    async function createCheckoutSession() {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (!res.ok || !data.sessionId) {
          throw new Error(data.error || "Failed to create checkout session");
        }

        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } catch (caught: unknown) {
        const message =
          caught instanceof Error ? caught.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    createCheckoutSession();
  }, [plan]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Redirecting to Stripe checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return null;
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CheckoutContent />
    </Suspense>
  );
}
