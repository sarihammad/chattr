import { NextRequest } from "next/server";
import { websocketServer } from "@/lib/websocket";
import { Socket } from "net";
import { IncomingMessage } from "http";

interface SocketServer {
  socket: Socket;
  response: {
    socket: {
      head: Buffer;
    };
  };
}

interface ExtendedNextRequest extends NextRequest {
  socket: {
    server: SocketServer;
  };
}

// Convert NextRequest to IncomingMessage for WebSocket handling
function convertToIncomingMessage(req: NextRequest): IncomingMessage {
  const incomingMessage = new IncomingMessage(new Socket());

  // Copy over the necessary properties
  incomingMessage.method = req.method;
  incomingMessage.url = req.url;
  incomingMessage.headers = {};
  req.headers.forEach((value, key) => {
    incomingMessage.headers[key] = value;
  });

  return incomingMessage;
}

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Handle WebSocket upgrade
    const { socket, response } = (req as ExtendedNextRequest).socket.server;

    if (!socket) {
      throw new Error("No socket found");
    }

    try {
      await websocketServer.handleUpgrade(
        convertToIncomingMessage(req),
        socket,
        response.socket.head,
        token
      );
      return new Response(null, { status: 101 });
    } catch (error) {
      console.error("WebSocket upgrade error:", error);
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.error("WebSocket connection error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
