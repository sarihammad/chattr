import { WebSocket, WebSocketServer } from "ws";
import { parse } from "url";
import { Redis } from "ioredis";
import { Server } from "http";
import { IncomingMessage } from "http";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const redisSub = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

interface WebSocketClient extends WebSocket {
  roomId?: string;
  userId?: string;
  isAlive: boolean;
  readyState: number;
  send(data: string): void;
  terminate(): void;
  ping(): void;
  close(code?: number, reason?: string): void;
  on(event: string, listener: (...args: any[]) => void): this;
}

interface ChatMessage {
  type: "message" | "typing";
  content?: string;
  senderId: string;
  timestamp: number;
  isTyping?: boolean;
}

interface RedisMessage {
  roomId: string;
  type: "message" | "typing";
  content?: string;
  senderId: string;
  timestamp: number;
  isTyping?: boolean;
  id?: number;
}

interface StoredMessage {
  id: number;
  type: "message";
  content: string;
  senderId: string;
  timestamp: number;
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  // Set up Redis subscription for receiving messages
  redisSub.subscribe("chat");
  redisSub.on("message", (channel: string, message: string) => {
    const data: RedisMessage = JSON.parse(message);
    const { roomId, ...messageData } = data;

    // Broadcast message to all clients in the room
    wss.clients.forEach((client: WebSocketClient) => {
      if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageData));
      }
    });
  });

  // Set up heartbeat to detect stale connections
  const interval = setInterval(() => {
    wss.clients.forEach((client: WebSocketClient) => {
      if (!client.isAlive) {
        client.terminate();
        return;
      }

      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  wss.on("connection", async (ws: WebSocketClient, req: IncomingMessage) => {
    const { query } = parse(req.url || "", true);
    const roomId = query.roomId as string;
    const userId = query.userId as string;

    if (!roomId || !userId) {
      ws.close(1008, "Missing roomId or userId");
      return;
    }

    // Verify room exists and user is a participant
    const room = await redis.hgetall(`room:${roomId}`);
    if (!room || (room.user1 !== userId && room.user2 !== userId)) {
      ws.close(1008, "Invalid room or user");
      return;
    }

    ws.roomId = roomId;
    ws.userId = userId;
    ws.isAlive = true;

    // Set up ping-pong for connection health check
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Handle incoming messages
    ws.on("message", async (data: string) => {
      try {
        const message: ChatMessage = JSON.parse(data);

        if (message.type === "message") {
          // Store message in Redis
          const messageId = await redis.incr(`room:${roomId}:messageId`);
          const messageData = {
            id: messageId,
            ...message,
            timestamp: Date.now(),
          };

          await redis.rpush(
            `room:${roomId}:messages`,
            JSON.stringify(messageData)
          );

          // Publish message to Redis for broadcasting
          await redis.publish(
            "chat",
            JSON.stringify({
              roomId,
              ...messageData,
            })
          );
        } else if (message.type === "typing") {
          // Broadcast typing status
          await redis.publish(
            "chat",
            JSON.stringify({
              roomId,
              type: "typing",
              senderId: userId,
              isTyping: message.isTyping,
            })
          );
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    // Handle client disconnect
    ws.on("close", async () => {
      try {
        // Clean up room if both users have disconnected
        const clients = Array.from(wss.clients) as WebSocketClient[];
        const connectedClients = clients.filter(
          (client) => client.roomId === roomId
        );

        if (connectedClients.length === 0) {
          // Archive chat messages
          const messages = await redis.lrange(`room:${roomId}:messages`, 0, -1);
          if (messages.length > 0) {
            await redis.rpush(
              `archive:${roomId}`,
              ...messages.map((msg: string) => msg)
            );
          }

          // Clean up room data
          const keys = await redis.keys(`room:${roomId}*`);
          if (keys.length > 0) {
            await redis.del(...keys);
          }
        }
      } catch (error) {
        console.error("Error cleaning up room:", error);
      }
    });

    // Send recent messages to the newly connected client
    try {
      const recentMessages = await redis.lrange(
        `room:${roomId}:messages`,
        -50,
        -1
      );
      if (recentMessages.length > 0) {
        ws.send(
          JSON.stringify({
            type: "history",
            messages: recentMessages.map((msg: string) =>
              JSON.parse(msg)
            ) as StoredMessage[],
          })
        );
      }
    } catch (error) {
      console.error("Error sending message history:", error);
    }
  });

  return wss;
}
