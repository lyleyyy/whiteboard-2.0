import { io } from "socket.io-client";

const baseUrl =
  import.meta.env.PRODUCTION === "1"
    ? import.meta.env.VITE_SOCKET_SERVER_ADDRESS_PRODUCTION
    : import.meta.env.VITE_SOCKET_SERVER_ADDRESS_DEV;

export const socket = io(baseUrl, {
  reconnection: true,
});
