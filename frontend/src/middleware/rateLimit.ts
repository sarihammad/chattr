// src/middleware/rateLimit.ts
import { NextResponse } from "next/server";

// Simple in-memory rate limiter (for demonstration only, not for production)
const ipTimestamps = new Map<string, number[]>();

/**
 * Rate limit middleware for API routes.
 * @param req - The request object.
 * @param limit - Max requests allowed in windowMs.
 * @param windowMs - Time window in ms.
 * Throws Response with 429 if rate limited.
 */
export function rateLimit(req: Request, limit = 10, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const timestamps = ipTimestamps.get(ip) || [];
  // Remove timestamps outside window
  const recent = timestamps.filter(ts => now - ts < windowMs);
  if (recent.length >= limit) {
    throw NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  recent.push(now);
  ipTimestamps.set(ip, recent);
}
