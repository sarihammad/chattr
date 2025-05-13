// src/app/api/auth/forgot-password/route.ts
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/middleware/rateLimit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  rateLimit(req, 5, 60000);
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = result.data;

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: "If that email exists, a reset link has been sent" });
  }

  const resetToken = randomBytes(32).toString("hex");

  await db.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry: addHours(new Date(), 1), // expires in 1 hour
    },
  });

  await sendPasswordResetEmail({ email, token: resetToken });

  return NextResponse.json({ message: "Reset link sent!" });
}
