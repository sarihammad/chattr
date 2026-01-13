// src/middleware/auth.ts
import type { NextRequest } from "next/server";

/**
 * Middleware for API routes to require authentication.
 * Usage (in route handler): await requireAuth(request);
 * Returns user info if authenticated, throws 401 if not.
 *
 * Note: For v1, API routes should validate JWT tokens from Spring Boot backend.
 * This is a placeholder that returns a mock session for build-time.
 */
export async function requireAuth(
  request?: NextRequest
): Promise<{ user: { email: string } }> {
  // For build-time, return a mock session to prevent build errors
  // In production, this should validate the JWT token from the Authorization header
  if (process.env.NODE_ENV === "production" && !request) {
    // During static generation, return mock
    return { user: { email: "build@example.com" } };
  }

  // TODO: Implement proper JWT validation from Spring Boot
  // const authHeader = request?.headers.get('authorization');
  // if (!authHeader?.startsWith('Bearer ')) {
  //   throw NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  // }
  // const token = authHeader.substring(7);
  // Validate token with Spring Boot backend...

  // For now, return mock for build
  return { user: { email: "user@example.com" } };
}
