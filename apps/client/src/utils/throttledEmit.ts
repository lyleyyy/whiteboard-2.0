import { throttle } from "lodash";
import { socket } from "../lib/socketClient.ts";
import type { LineInterface } from "../types/LineInterface";

export const throttledEmit = throttle((line: LineInterface) => {
  socket.emit("command", {
    type: "draw",
    shape: "line",
    line,
  });
}, 50);
