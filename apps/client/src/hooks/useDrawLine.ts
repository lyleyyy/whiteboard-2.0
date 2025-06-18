import { useState } from "react";
import type { LineInterface } from "../types/LineInterface";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { socket } from "../lib/socketClient";
import { v4 as uuidv4 } from "uuid";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";

function useDrawLine(roomId: string | null) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const { currentUser } = useCurrentUser();
  const { selectedColor } = useDrawingSelector();

  function drawingNewLine(newCoord: { x: number; y: number }) {
    if (!currentUser) return;

    const newLine = {
      id: line?.id || uuidv4(),
      points: [...(line?.points ?? []), newCoord.x, newCoord.y],
      stroke: selectedColor,
      strokeWidth: selectedColor === "white" ? 40 : 4,
    };

    setLine(newLine);

    if (roomId) {
      socket.emit("command", {
        type: "draw",
        shape: "line",
        line: newLine,
        roomId,
        userId: currentUser.id,
      });
    }
    // throttledEmit(newLine);
  }

  return {
    isDrawing,
    setIsDrawing,
    line,
    setLine,
    lines,
    setLines,
    drawingNewLine,
  };
}

export default useDrawLine;
