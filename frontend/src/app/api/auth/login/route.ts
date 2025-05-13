// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { rateLimit } from "@/middleware/rateLimit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  rateLimit(request, 10, 60000);
  const body = await request.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const { email, password } = result.data;

  const user = await loginUser(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Return user data without password
  const { password: _, ...userData } = user;

  return NextResponse.json(userData);
}
