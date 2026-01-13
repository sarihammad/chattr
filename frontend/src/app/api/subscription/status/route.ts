// Subscription status disabled for v1 - subscriptions not in scope
import { NextResponse } from 'next/server';

export async function GET() {
  // Return default subscription status for v1
  return NextResponse.json({
    isSubscribed: false,
    subscriptionStatus: null,
    subscriptionPeriodEnd: null,
    cancelAtPeriodEnd: false,
    subscriptionType: null,
    isDowngrading: false,
  });
}
