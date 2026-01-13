import { Client, Frame } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client: Client | null = null;

export const connectWebSocket = (
  token: string,
  onConnect?: () => void,
  onError?: (error: unknown) => void
): Client => {
  if (client && client.connected) {
    return client;
  }

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

  client = new Client({
    webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log("WebSocket connected");
      onConnect?.();
    },
    onStompError: (frame: Frame) => {
      console.error("STOMP error:", frame);
      onError?.(frame);
    },
    onWebSocketClose: () => {
      console.log("WebSocket closed");
    },
    onWebSocketError: (event: Event) => {
      console.error("WebSocket error:", event);
      onError?.(event);
    },
  });

  client.activate();
  return client;
};

export const disconnectWebSocket = () => {
  if (client && client.connected) {
    client.deactivate();
    client = null;
  }
};

export const getWebSocketClient = (): Client | null => {
  return client;
};
