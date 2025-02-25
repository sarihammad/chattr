import { NextResponse } from "next/server";
import Redis from "ioredis";
import { Kafka } from "kafkajs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { monitoring } from "@/lib/monitoring";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});
const dynamoClient = new DynamoDBClient({});

export async function GET() {
  try {
    // Check Redis connection
    await redis.ping();

    // Check Kafka connection
    const admin = kafka.admin();
    await admin.connect();
    await admin.listTopics();
    await admin.disconnect();

    // Check DynamoDB connection
    await dynamoClient.config.credentials();

    // Get monitoring metrics
    const metrics = await monitoring.getMetrics();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        redis: "connected",
        kafka: "connected",
        dynamodb: "connected",
      },
      metrics,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
