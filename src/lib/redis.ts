import Redis from "ioredis";
import { ChatMessage } from "./websocket";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Message caching
export async function cacheMessage(message: ChatMessage): Promise<void> {
  const roomKey = `chat:${message.receiverId}`;
  await redis.lpush(roomKey, JSON.stringify(message));
  // Keep only last 100 messages in cache
  await redis.ltrim(roomKey, 0, 99);
}

export async function getCachedMessages(
  roomId: string
): Promise<ChatMessage[]> {
  const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
  return messages.map((msg) => JSON.parse(msg));
}

// Matchmaking system
interface UserPreferences {
  gender?: "male" | "female" | "other";
  purpose: "casual" | "friendship" | "romantic";
  userId: string;
}

export async function addUserToMatchmaking(
  preferences: UserPreferences
): Promise<void> {
  const queueKey = `matchmaking:${preferences.purpose}`;
  const score = Date.now(); // Use timestamp as score for FIFO ordering
  await redis.zadd(
    queueKey,
    score,
    JSON.stringify({
      ...preferences,
      joinedAt: score,
    })
  );
}

export async function findMatch(
  preferences: UserPreferences
): Promise<string | null> {
  const queueKey = `matchmaking:${preferences.purpose}`;

  // Get all users in the queue
  const potentialMatches = await redis.zrange(queueKey, 0, -1);

  for (const matchJson of potentialMatches) {
    const match = JSON.parse(matchJson);

    // Skip self
    if (match.userId === preferences.userId) continue;

    // Check gender preference if specified
    if (preferences.gender && match.gender !== preferences.gender) continue;

    // Found a match - remove both users from queue
    await redis.zrem(queueKey, matchJson);
    await redis.zrem(queueKey, JSON.stringify(preferences));

    return match.userId;
  }

  return null;
}

// Active conversations caching
export async function cacheActiveConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  const conversationId = `${userId1}_${userId2}`.split("_").sort().join("_");
  const key = `active_conversation:${conversationId}`;

  await redis.setex(
    key,
    3600,
    JSON.stringify({
      participants: [userId1, userId2],
      startedAt: Date.now(),
    })
  );

  return conversationId;
}

export async function getActiveConversation(conversationId: string) {
  const data = await redis.get(`active_conversation:${conversationId}`);
  return data ? JSON.parse(data) : null;
}

// Pub/Sub for real-time updates
export function subscribeToUserEvents(
  userId: string,
  callback: (message: string) => void
) {
  const subscriber = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
  );
  subscriber.subscribe(`user:${userId}:events`, (err) => {
    if (err) {
      console.error("Failed to subscribe to user events:", err);
      return;
    }
  });

  subscriber.on("message", (channel, message) => {
    callback(message);
  });

  return () => {
    subscriber.unsubscribe(`user:${userId}:events`);
    subscriber.quit();
  };
}

export async function publishUserEvent(userId: string, event: any) {
  await redis.publish(`user:${userId}:events`, JSON.stringify(event));
}
