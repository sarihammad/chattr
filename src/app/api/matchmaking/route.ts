import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

interface MatchmakingPreferences {
  gender: string;
  purpose: string;
  minAge?: number;
  maxAge?: number;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const preferences: MatchmakingPreferences = await req.json();
    const userId = session.user.id;

    // Add user to the waiting queue with their preferences
    const queueKey = `queue:${preferences.purpose}`;
    const userKey = `user:${userId}`;

    // Store user preferences
    await redis.hset(userKey, {
      userId,
      gender: preferences.gender,
      purpose: preferences.purpose,
      minAge: preferences.minAge || 18,
      maxAge: preferences.maxAge || 99,
      timestamp: Date.now(),
    });

    // Add user to the appropriate queue
    await redis.zadd(queueKey, Date.now(), userId);

    // Find a match from the queue
    const potentialMatches = await redis.zrange(queueKey, 0, -1);
    let match = null;

    for (const matchUserId of potentialMatches) {
      if (matchUserId === userId) continue;

      const matchPrefs = await redis.hgetall(`user:${matchUserId}`);
      if (!matchPrefs) continue;

      // Check if preferences are compatible
      const isCompatible = checkCompatibility(
        {
          gender: preferences.gender,
          purpose: preferences.purpose,
          minAge: preferences.minAge,
          maxAge: preferences.maxAge,
        },
        {
          gender: matchPrefs.gender,
          purpose: matchPrefs.purpose,
          minAge: parseInt(matchPrefs.minAge),
          maxAge: parseInt(matchPrefs.maxAge),
        }
      );

      if (isCompatible) {
        match = matchUserId;
        break;
      }
    }

    if (match) {
      // Create a chat room
      const roomId = uuidv4();

      // Remove both users from the queue
      await redis.zrem(queueKey, userId, match);

      // Clean up user preferences
      await redis.del(userKey, `user:${match}`);

      // Store room information
      await redis.hset(`room:${roomId}`, {
        user1: userId,
        user2: match,
        createdAt: Date.now(),
      });

      return NextResponse.json({ roomId });
    }

    // No match found, user stays in queue
    return NextResponse.json(
      { message: "Added to queue, waiting for match" },
      { status: 202 }
    );
  } catch (error) {
    console.error("Matchmaking error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function checkCompatibility(
  prefs1: MatchmakingPreferences,
  prefs2: MatchmakingPreferences
): boolean {
  // Same purpose check
  if (prefs1.purpose !== prefs2.purpose) return false;

  // Gender preference check
  if (
    prefs1.gender !== "any" &&
    prefs2.gender !== "any" &&
    prefs1.gender !== prefs2.gender
  ) {
    return false;
  }

  // Age range check
  const minAge1 = prefs1.minAge || 18;
  const maxAge1 = prefs1.maxAge || 99;
  const minAge2 = prefs2.minAge || 18;
  const maxAge2 = prefs2.maxAge || 99;

  if (minAge1 > maxAge2 || maxAge1 < minAge2) return false;

  return true;
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const { purpose } = await req.json();

    // Remove user from the queue
    const queueKey = `queue:${purpose}`;
    await redis.zrem(queueKey, userId);

    // Clean up user preferences
    await redis.del(`user:${userId}`);

    return NextResponse.json({ message: "Removed from queue" });
  } catch (error) {
    console.error("Error removing from queue:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
