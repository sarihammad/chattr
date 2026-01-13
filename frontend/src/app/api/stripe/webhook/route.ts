// Stripe webhook disabled for v1 - subscriptions not in scope
import { NextResponse } from 'next/server';

export async function POST() {
  // Return 200 to acknowledge webhook receipt, but don't process
  return new NextResponse(null, { status: 200 });
}
