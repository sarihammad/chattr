// src/middleware/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * Middleware for API routes to require authentication.
 * Usage (in route handler): await requireAuth();
 * Throws Response with 401 if not authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return session;
}
