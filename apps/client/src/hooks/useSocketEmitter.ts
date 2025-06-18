import { useCurrentUser } from "../contexts/CurrentUserContext";
import { socket } from "../lib/socketClient";
import type { EllipseInterface } from "../types/EllipseInterface";
import type { LineInterface } from "../types/LineInterface";
import type { TextInterface } from "../types/TextInterface";

function useSocketEmitter() {
  const { currentUser } = useCurrentUser();

  function emitCursorMove(
    roomId: string | null,
    newCoord: { x: number; y: number }
  ) {
    socket.emit("cursormove", {
      newCoord,
      roomId,
      userId: currentUser!.id,
      userName: currentUser!.user_name,
    });
  }

  function emitDrawingShape(
    roomId: string | null,
    shape: "ellipse" | "line" | "rect" | "text",
    ShapeObj: EllipseInterface | LineInterface | TextInterface
  ) {
    socket.emit("command", {
      type: "draw",
      shape: shape,
      shapeObj: ShapeObj,
      roomId,
      userId: currentUser!.id,
    });
  }

  return { emitCursorMove, emitDrawingShape };
}

export default useSocketEmitter;
