import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SafeguardingAlertPayload,
} from "../types";

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  SafeguardingAlertPayload,
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000", {
      withCredentials: true,
      autoConnect: false, // connect only when explicitly called
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

// ─────────────────────────────────────────────
// Connect + join facilitator room
// Called after facilitator login
// ─────────────────────────────────────────────

export function connectFacilitator(): void {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("room:join", "room:facilitators");
}

// ─────────────────────────────────────────────
// Disconnect cleanly
// Called on logout
// ─────────────────────────────────────────────

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
