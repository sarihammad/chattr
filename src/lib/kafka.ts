import { Kafka, Producer, Consumer } from "kafkajs";
import { ChatMessage } from "./websocket";
import { saveMessageToDynamoDB } from "./dynamodb";

const kafka = new Kafka({
  clientId: "chattr-app",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  ssl: process.env.KAFKA_SSL === "true",
  sasl: process.env.KAFKA_SASL_USERNAME
    ? {
        mechanism: "plain",
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD || "",
      }
    : undefined,
});

let producer: Producer | null = null;

async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

// Message publishing
export async function publishToKafka(
  topic: string,
  message: any
): Promise<void> {
  try {
    const producer = await getProducer();
    await producer.send({
      topic,
      messages: [
        {
          key: message.id,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
  } catch (error) {
    console.error("Failed to publish message to Kafka:", error);
    throw error;
  }
}

// Message consumption
export async function startMessageConsumer(groupId: string): Promise<void> {
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic: "chat-messages", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      try {
        const chatMessage: ChatMessage = JSON.parse(message.value.toString());

        // Process message
        await processMessage(chatMessage);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
}

async function processMessage(message: ChatMessage): Promise<void> {
  // Save to DynamoDB
  await saveMessageToDynamoDB(message);

  // Additional processing like sentiment analysis, content moderation, etc.
  // could be added here
}

// Graceful shutdown
export async function shutdownKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}

// Error handling and retries
const retryOptions = {
  initialRetryTime: 100,
  maxRetryTime: 30000,
  retries: 5,
};

export async function publishWithRetry(
  topic: string,
  message: any
): Promise<void> {
  let lastError;

  for (let attempt = 0; attempt < retryOptions.retries; attempt++) {
    try {
      await publishToKafka(topic, message);
      return;
    } catch (error) {
      lastError = error;
      const delay = Math.min(
        retryOptions.maxRetryTime,
        retryOptions.initialRetryTime * Math.pow(2, attempt)
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Health check
export async function checkKafkaHealth(): Promise<boolean> {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    await admin.disconnect();
    return topics.length > 0;
  } catch (error) {
    console.error("Kafka health check failed:", error);
    return false;
  }
}
