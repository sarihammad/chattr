// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user1 = await db.user.create({
    data: {
      email: "demo@example.com",
      password,
      name: "Demo User",
      stripeCustomerId: "cus_test123", 
      stripeSubscriptionId: "sub_test123",
      stripePriceId: "price_test123",
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isSubscribed: true,
      subscriptionStatus: "active",
    },
  });

  console.log(`Created user with id: ${user1.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
