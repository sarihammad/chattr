import WebSocket from "ws";
import { verifyToken } from "./auth";
import { monitoring } from "./monitoring";
import { encryptMessage, decryptMessage } from "./auth";
import { Redis } from "ioredis";
import { Kafka } from "kafkajs";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: (process.env.KAFKA_BROKERS || "").split(","),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID! });

interface WebSocketMessage {
  type: string;
  roomId: string;
  content?: string;
  senderId?: string;
  timestamp?: number;
  isTyping?: boolean;
}

class WebSocketServer {
  private static instance: WebSocketServer;
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocket>;

  private constructor() {
    this.wss = new WebSocket.Server({ noServer: true });
    this.clients = new Map();

    this.setupWebSocketServer();
    this.setupKafkaConsumer();
  }

  static getInstance(): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer();
    }
    return WebSocketServer.instance;
  }

  private async setupWebSocketServer() {
    await producer.connect();
    await consumer.connect();

    this.wss.on("connection", async (ws: WebSocket, userId: string) => {
      this.clients.set(userId, ws);
      monitoring.incrementConnections();

      ws.on("message", async (data: WebSocket.Data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          const startTime = Date.now();

          switch (message.type) {
            case "message":
              // Encrypt message before sending to Kafka
              message.content = encryptMessage(message.content!);
              await this.handleChatMessage(message);
              monitoring.recordMessage("chat");
              break;

            case "typing":
              await this.handleTypingIndicator(message);
              monitoring.recordMessage("typing");
              break;

            case "join":
              await this.handleRoomJoin(message, userId);
              monitoring.recordMessage("join");
              break;
          }

          const latency = Date.now() - startTime;
          monitoring.recordLatency(latency);
        } catch (error) {
          console.error("Error processing message:", error);
          monitoring.recordError("websocket_message");
        }
      });

      ws.on("close", () => {
        this.clients.delete(userId);
        monitoring.decrementConnections();
      });
    });
  }

  private async setupKafkaConsumer() {
    await consumer.subscribe({
      topic: process.env.KAFKA_MESSAGES_TOPIC!,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.value!.toString());
          await this.broadcastToRoom(data);
        } catch (error) {
          console.error("Error consuming Kafka message:", error);
          monitoring.recordError("kafka_consumer");
        }
      },
    });
  }

  private async handleChatMessage(message: WebSocketMessage) {
    await producer.send({
      topic: process.env.KAFKA_MESSAGES_TOPIC!,
      messages: [{ value: JSON.stringify(message) }],
    });

    // Store message in Redis cache for quick retrieval
    const cacheKey = `chat:${message.roomId}:messages`;
    await redis.lpush(cacheKey, JSON.stringify(message));
    await redis.ltrim(cacheKey, 0, 99); // Keep last 100 messages
  }

  private async handleTypingIndicator(message: WebSocketMessage) {
    await this.broadcastToRoom(message);
  }

  private async handleRoomJoin(message: WebSocketMessage, userId: string) {
    // Get recent messages from Redis cache
    const cacheKey = `chat:${message.roomId}:messages`;
    const messages = await redis.lrange(cacheKey, 0, 49);

    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "history",
          messages: messages.map((msg) => JSON.parse(msg)),
        })
      );
    }
  }

  private async broadcastToRoom(message: WebSocketMessage) {
    const roomKey = `match:${message.roomId}`;
    const roomData = await redis.get(roomKey);

    if (!roomData) return;

    const { users } = JSON.parse(roomData);
    const messageStr = JSON.stringify(message);

    users.forEach((userId: string) => {
      const ws = this.clients.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  handleUpgrade(
    request: any,
    socket: any,
    head: any,
    token: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      verifyToken(token)
        .then(({ userId }) => {
          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit("connection", ws, userId);
            resolve();
          });
        })
        .catch((error) => {
          socket.destroy();
          reject(error);
        });
    });
  }
}

// Export singleton instance
export const websocketServer = WebSocketServer.getInstance();
