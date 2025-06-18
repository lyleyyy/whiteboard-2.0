import { io } from "socket.io-client";

const baseUrl = import.meta.env.VITE_SOCKET_SERVER_ADDRESS;

export const socket = io(baseUrl, {
  reconnection: true,
});
