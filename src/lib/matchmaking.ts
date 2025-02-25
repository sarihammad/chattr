import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { monitoring } from "./monitoring";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const QUEUE_KEY = "matchmaking:queue";
const MATCH_TTL = 60; // seconds

export interface UserPreferences {
  gender: string;
  purpose: string;
  minAge?: number;
  maxAge?: number;
  userId: string;
}

export class MatchmakingService {
  private static instance: MatchmakingService;

  private constructor() {}

  static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  async addToQueue(preferences: UserPreferences): Promise<string | null> {
    const startTime = monitoring.startMatchmaking();

    try {
      // Add user to queue
      const queuedUser = {
        ...preferences,
        timestamp: Date.now(),
      };

      await redis.zadd(QUEUE_KEY, Date.now(), JSON.stringify(queuedUser));
      monitoring.updateQueueDepth(await this.getQueueDepth());

      // Try to find a match
      const match = await this.findMatch(queuedUser);

      if (match) {
        // Create a room for the matched users
        const roomId = uuidv4();

        // Store the match in Redis with TTL
        await redis.setex(
          `match:${roomId}`,
          MATCH_TTL,
          JSON.stringify({
            users: [preferences.userId, match.userId],
            timestamp: Date.now(),
          })
        );

        monitoring.endMatchmaking(startTime);
        return roomId;
      }

      return null;
    } catch (error) {
      console.error("Error in matchmaking:", error);
      throw error;
    }
  }

  private async findMatch(
    user: UserPreferences
  ): Promise<UserPreferences | null> {
    const queuedUsers = await redis.zrange(QUEUE_KEY, 0, -1);

    for (const potentialMatch of queuedUsers) {
      const matchData = JSON.parse(potentialMatch) as UserPreferences;

      if (matchData.userId === user.userId) continue;

      if (this.isCompatibleMatch(user, matchData)) {
        // Remove both users from queue
        await redis.zrem(QUEUE_KEY, JSON.stringify(user), potentialMatch);
        monitoring.updateQueueDepth(await this.getQueueDepth());

        return matchData;
      }
    }

    return null;
  }

  private isCompatibleMatch(
    prefs1: UserPreferences,
    prefs2: UserPreferences
  ): boolean {
    // Check purpose compatibility
    if (prefs1.purpose !== prefs2.purpose) return false;

    // Check gender preferences
    if (
      prefs1.gender !== "any" &&
      prefs2.gender !== "any" &&
      prefs1.gender !== prefs2.gender
    ) {
      return false;
    }

    // Check age preferences if specified
    if (prefs1.minAge && prefs2.maxAge && prefs1.minAge > prefs2.maxAge)
      return false;
    if (prefs1.maxAge && prefs2.minAge && prefs1.maxAge < prefs2.minAge)
      return false;

    return true;
  }

  async removeFromQueue(userId: string): Promise<void> {
    const queuedUsers = await redis.zrange(QUEUE_KEY, 0, -1);

    for (const user of queuedUsers) {
      const userData = JSON.parse(user);
      if (userData.userId === userId) {
        await redis.zrem(QUEUE_KEY, user);
        monitoring.updateQueueDepth(await this.getQueueDepth());
        break;
      }
    }
  }

  private async getQueueDepth(): Promise<number> {
    return await redis.zcard(QUEUE_KEY);
  }
}

// Export singleton instance
export const matchmaking = MatchmakingService.getInstance();
