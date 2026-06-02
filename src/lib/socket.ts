import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SafeguardingAlertPayload,
  DMMessagePayload,
  DMReadPayload,
} from "../types";

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  SafeguardingAlertPayload,
  DMMessagePayload,
  DMReadPayload,
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000", {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

// ─────────────────────────────────────────────
// Connect + join facilitator broadcast room
// ─────────────────────────────────────────────

export function connectFacilitator(): void {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("room:join", "room:facilitators");
}

// ─────────────────────────────────────────────
// Join personal DM room — call after any login
// ─────────────────────────────────────────────

export function joinDMRoom(userId: string): void {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("dm:join", userId);
}

// ─────────────────────────────────────────────
// Typing indicators
// ─────────────────────────────────────────────

export function sendTyping(recipientId: string, senderName: string): void {
  getSocket().emit("dm:typing", { recipientId, senderName });
}

export function stopTyping(recipientId: string): void {
  getSocket().emit("dm:typing:stop", { recipientId });
}

// ─────────────────────────────────────────────
// DM event listeners — return an unsubscribe fn
// ─────────────────────────────────────────────

export function onDMMessage(handler: (payload: DMMessagePayload) => void): () => void {
  const s = getSocket();
  s.on("dm:message", handler);
  return () => s.off("dm:message", handler);
}

export function onDMRead(handler: (payload: DMReadPayload) => void): () => void {
  const s = getSocket();
  s.on("dm:read", handler);
  return () => s.off("dm:read", handler);
}

export function onDMTyping(handler: (payload: { senderName: string }) => void): () => void {
  const s = getSocket();
  s.on("dm:typing", handler);
  return () => s.off("dm:typing", handler);
}

export function onDMTypingStop(handler: () => void): () => void {
  const s = getSocket();
  s.on("dm:typing:stop", handler);
  return () => s.off("dm:typing:stop", handler);
}

// ─────────────────────────────────────────────
// Disconnect cleanly on logout
// ─────────────────────────────────────────────

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
