// src/lib/db.ts
// Prisma client connection
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();
