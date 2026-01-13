// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/middleware/rateLimit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  rateLimit(request, 10, 60000);
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = result.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
