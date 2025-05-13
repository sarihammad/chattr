import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions'; // adjust path if necessary
import type { NextRequest } from 'next/server';
import { rateLimit } from "@/middleware/rateLimit";
import { requireAuth } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  rateLimit(req, 10, 60000);
  await requireAuth();

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      isSubscribed: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      cancelAtPeriodEnd: true,
      subscriptionType: true,
      isDowngrading: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    isSubscribed: user.isSubscribed,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPeriodEnd: user.subscriptionPeriodEnd,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    subscriptionType: user.subscriptionType,
    isDowngrading: user.isDowngrading,
  });
}
