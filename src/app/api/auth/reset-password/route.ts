// src/app/api/auth/reset-password/route.ts
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/middleware/rateLimit";

const schema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  rateLimit(req, 5, 60000);
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { token, password } = result.data;

  if (!token || !password) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ message: "Password reset successful" });
}
