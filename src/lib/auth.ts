import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-encryption-key";

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Token generation and verification
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Message encryption and decryption
export function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
}

export function decryptMessage(encryptedMessage: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// RSA key pair generation for E2EE
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  // In a real implementation, you would use a proper RSA library
  // This is just a placeholder to demonstrate the concept
  const keyPair = {
    publicKey: "dummy-public-key",
    privateKey: "dummy-private-key",
  };
  return keyPair;
}

// Rate limiting
const rateLimits = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(
  userId: string,
  limit = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit) {
    rateLimits.set(userId, { count: 1, timestamp: now });
    return true;
  }

  if (now - userLimit.timestamp > windowMs) {
    rateLimits.set(userId, { count: 1, timestamp: now });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count += 1;
  return true;
}

// GDPR compliance
export async function deleteUserData(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });

  // Delete user's messages
  await prisma.chatMessage.deleteMany({
    where: { senderId: userId },
  });

  // Delete user's chat rooms
  await prisma.chatRoom.deleteMany({
    where: {
      users: {
        has: userId,
      },
    },
  });
}

// Security headers
export const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self';",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
