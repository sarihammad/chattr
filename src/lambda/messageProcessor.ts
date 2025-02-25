import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SQSEvent, Context } from "aws-lambda";
import { Kafka } from "kafkajs";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const kafka = new Kafka({
  clientId: "chattr-lambda",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const producer = kafka.producer();

export const handler = async (event: SQSEvent, context: Context) => {
  try {
    await producer.connect();

    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const startTime = Date.now();

      // Store message in DynamoDB
      await docClient.send(
        new PutCommand({
          TableName: "ChatMessages",
          Item: {
            messageId: message.id,
            content: message.content,
            senderId: message.senderId,
            roomId: message.roomId,
            timestamp: message.timestamp,
            processed: true,
            processedAt: Date.now(),
          },
        })
      );

      // Publish to Kafka for real-time delivery
      await producer.send({
        topic: "processed-messages",
        messages: [
          {
            key: message.roomId,
            value: JSON.stringify({
              ...message,
              processedAt: Date.now(),
              processingTime: Date.now() - startTime,
            }),
          },
        ],
      });
    }

    await producer.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Messages processed successfully",
        processedCount: event.Records.length,
      }),
    };
  } catch (error) {
    console.error("Error processing messages:", error);
    throw error;
  }
};
