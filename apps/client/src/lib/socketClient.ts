import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_SERVER_ADDRESS, {
  reconnection: true,
});
