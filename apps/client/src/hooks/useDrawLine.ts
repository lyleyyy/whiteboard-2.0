import { useState } from "react";
import type { LineInterface } from "../types/LineInterface";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { v4 as uuidv4 } from "uuid";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import { useUndoRedoStack } from "../contexts/UndoRedoStackContext";
import { DrawLineCommand } from "../commands/DrawLineCommand";
import useSocketEmitter from "./useSocketEmitter";

function useDrawLine(roomId: string | null) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const { currentUser } = useCurrentUser();
  const { selectedColor } = useDrawingSelector();
  const { setUndoStack, setRedoStack } = useUndoRedoStack();

  const { emitDrawingShape } = useSocketEmitter();

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
      emitDrawingShape(roomId, "line", newLine);
    }
    // throttledEmit(newLine);
  }

  function finishDrawLine() {
    setIsDrawing(false);

    if (line) {
      setLines((prev) => [...(prev ?? []), line]);
      const drawLineCommand = new DrawLineCommand(line, setLines);
      setUndoStack((prev) => [...prev, drawLineCommand]);
      setRedoStack([]);
    }

    setLine(null);
  }

  return {
    isDrawing,
    setIsDrawing,
    line,
    setLine,
    lines,
    setLines,
    drawingNewLine,
    finishDrawLine,
  };
}

export default useDrawLine;
