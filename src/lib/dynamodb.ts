import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { ChatMessage } from "./websocket";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE || "chattr-messages";

// Save a new message
export async function saveMessageToDynamoDB(
  message: ChatMessage
): Promise<void> {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      messageId: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      timestamp: message.timestamp,
      type: message.type,
      conversationId: [message.senderId, message.receiverId].sort().join("_"),
    },
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error("Error saving message to DynamoDB:", error);
    throw error;
  }
}

// Get messages for a conversation
export async function getConversationMessages(
  userId1: string,
  userId2: string,
  limit = 50,
  lastEvaluatedKey?: Record<string, any>
): Promise<{
  messages: ChatMessage[];
  lastEvaluatedKey?: Record<string, any>;
}> {
  const conversationId = [userId1, userId2].sort().join("_");

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "conversationId = :conversationId",
    ExpressionAttributeValues: {
      ":conversationId": conversationId,
    },
    Limit: limit,
    ScanIndexForward: false, // Return messages in descending order (newest first)
    ExclusiveStartKey: lastEvaluatedKey,
  });

  try {
    const response = await docClient.send(command);

    return {
      messages: (response.Items || []) as ChatMessage[],
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
}

// Get a single message by ID
export async function getMessageById(
  messageId: string
): Promise<ChatMessage | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      messageId,
    },
  });

  try {
    const response = await docClient.send(command);
    return (response.Item as ChatMessage) || null;
  } catch (error) {
    console.error("Error fetching message by ID:", error);
    throw error;
  }
}

// Get recent conversations for a user
export async function getUserConversations(
  userId: string,
  limit = 20
): Promise<
  Array<{
    conversationId: string;
    lastMessage: ChatMessage;
    otherUserId: string;
  }>
> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "UserConversationsIndex",
    KeyConditionExpression: "participantId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    Limit: limit,
    ScanIndexForward: false,
  });

  try {
    const response = await docClient.send(command);
    return (response.Items || []).map((item) => ({
      conversationId: item.conversationId,
      lastMessage: item.lastMessage,
      otherUserId:
        item.conversationId.split("_").find((id: string) => id !== userId) ||
        "",
    }));
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    throw error;
  }
}
