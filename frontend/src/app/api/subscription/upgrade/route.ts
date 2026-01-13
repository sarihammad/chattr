// Subscription upgrade disabled for v1 - subscriptions not in scope
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Subscriptions are not available in v1' },
    { status: 501 }
  );
}
