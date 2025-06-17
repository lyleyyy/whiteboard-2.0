import { useEffect, useState } from "react";
import type { LineInterface } from "../types/LineInterface";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import type { EllipseRawInterface } from "../types/EllipseRawInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import type { RectRawInterface } from "../types/RectRawInterface";
import type { RectInterface } from "../types/RectInterface";
import { socket } from "../lib/socketClient";
import { v4 as uuidv4 } from "uuid";
import ellipseParametersCalculator from "../utils/ellipseParametersCalculator";
import rectParametersCalculator from "../utils/rectParametersCalculator";
import { DrawLineCommand } from "../commands/DrawLineCommand";
import type { DrawCommand } from "../commands/types";
import { DrawEllipseCommand } from "../commands/DrawEllipseCommand";
import type { User } from "../types/User";

function useDrawing(roomId: string | null, currentUser: User | null) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [isEllisping, setIsEllisping] = useState(false);
  const [ellipseRaw, setEllipseRaw] = useState<EllipseRawInterface | null>(
    null
  );
  const [ellipse, setEllipse] = useState<EllipseInterface | null>(null);
  const [ellipses, setEllipses] = useState<EllipseInterface[]>([]);
  const [rectRaw, setRectRaw] = useState<RectRawInterface | null>(null);
  const [selectingRect, setSelectingRect] = useState<RectInterface | null>(
    null
  );
  const [undoStack, setUndoStack] = useState<DrawCommand[]>([]);
  const [redoStack, setRedoStack] = useState<DrawCommand[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const { selectedShape, selectedColor, setSelectedColor } =
    useDrawingSelector();

  useEffect(() => {
    function undoRedo(e: KeyboardEvent) {
      if (!currentUser) return;

      if (e.key === "z" && e.metaKey) {
        // redo
        if (e.shiftKey) {
          if (redoStack.length !== 0) {
            const redoCommand = redoStack.pop();
            if (redoCommand) {
              redoCommand.do();
              setUndoStack((prev) => [...prev, redoCommand]);
              setRedoStack(redoStack);

              if (roomId) {
                socket.emit("command", {
                  type: "redo",
                  shape: redoCommand.shape,
                  command: redoCommand,
                  roomId,
                  userId: currentUser.id,
                });
              }
            }
          }
        } else {
          // undo
          if (undoStack.length !== 0) {
            const undoCommand = undoStack.pop();
            if (undoCommand) {
              undoCommand.undo();
              setRedoStack((prev) => [...prev, undoCommand]);
              setUndoStack(undoStack);

              if (roomId) {
                socket.emit("command", {
                  type: "undo",
                  shape: undoCommand.shape,
                  command: undoCommand,
                  roomId,
                  userId: currentUser.id,
                });
              }
            }
          }
        }
      }
    }

    // function test(e: KeyboardEvent) {
    //   if (e.key === "q") {
    //     console.log(lines, "the lines state");
    //     console.log(undoStack);
    //     console.log(redoStack);
    //   }
    // }

    window.addEventListener("keydown", undoRedo);
    // window.addEventListener("keydown", test);

    return () => {
      window.removeEventListener("keydown", undoRedo);
      // window.removeEventListener("keydown", test);
    };
  }, [undoStack, redoStack, lines, roomId, currentUser]);

  function handleMouseDown(e: KonvaEventObject<PointerEvent>) {
    if (e.evt.button === 0) {
      const newCoord = e.target.getStage()!.getPointerPosition()!;
      if (selectedShape === "pencil") setIsDrawing(true);
      if (selectedShape === "eraser") {
        setIsDrawing(true);
        setSelectedColor("white");
      }
      if (selectedShape === "circle") {
        setIsEllisping(true);

        const newEllispe = {
          startCoords: newCoord,
          endCoords: null,
        };

        setEllipseRaw(newEllispe);
      }

      if (selectedShape === "cursor") {
        setIsSelecting(true);
        setRectRaw(newCoord);
      }
    }
  }

  function handleMouseMove(e: KonvaEventObject<PointerEvent>) {
    if (!currentUser) return;

    const newCoord = e.target.getStage()?.getPointerPosition();
    if (!newCoord) return;

    // mouse move cursor
    if (roomId) {
      socket.emit("cursormove", {
        newCoord,
        roomId,
        userId: currentUser.id,
        userName: currentUser.user_name,
      });
    }

    if (isDrawing) {
      const newLine = {
        id: line?.id || uuidv4(),
        points: [...(line?.points ?? []), newCoord.x, newCoord.y],
        stroke: selectedColor,
        strokeWidth: selectedColor === "white" ? 40 : 4,
      };

      setLine(newLine);

      // socket io emits event
      // socket.emit("drawline", newLine);

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

    if (isEllisping) {
      setEllipseRaw((prev) => {
        if (!prev) return null;
        return { startCoords: prev.startCoords, endCoords: newCoord };
      });

      if (!ellipseRaw || !ellipseRaw.endCoords) return;
      const { startCoords, endCoords } = ellipseRaw;

      const data = ellipseParametersCalculator(startCoords, endCoords);

      const newEllipse = {
        ...data,
        id: ellipse?.id || uuidv4(),
        stroke: selectedColor,
        strokeWidth: 2,
      };

      setEllipse(newEllipse);

      if (roomId) {
        socket.emit("command", {
          type: "draw",
          shape: "ellipse",
          ellipse: newEllipse,
          roomId,
          userId: currentUser.id,
        });
      }
    }

    if (isSelecting) {
      if (!rectRaw) return;
      const { width, height } = rectParametersCalculator(rectRaw, newCoord);

      const newRect = {
        id: uuidv4(),
        x: rectRaw.x,
        y: rectRaw.y,
        width,
        height,
      };

      setSelectingRect(newRect);
    }
  }

  function handleMouseUp() {
    if (selectedShape === "pencil" || selectedShape === "eraser") {
      setIsDrawing(false);
      // setIsEarsing(false);
      if (line) {
        setLines((prev) => [...(prev ?? []), line]);
        const drawLineCommand = new DrawLineCommand(line, setLines);
        setUndoStack((prev) => [...prev, drawLineCommand]);
        setRedoStack([]);
      }

      setLine(null);
    }

    if (selectedShape === "circle") {
      setIsEllisping(false);

      if (ellipse) {
        setEllipses((prev) => [...(prev ?? []), ellipse]);
        const drawEllipseCommand = new DrawEllipseCommand(ellipse, setEllipses);
        setUndoStack((prev) => [...prev, drawEllipseCommand]);
        setRedoStack([]);
      }

      setEllipseRaw(null);
      setEllipse(null);
    }

    if (selectedShape === "cursor") {
      setRectRaw(null);
      setSelectingRect(null);
    }
  }

  return {
    isDrawing,
    line,
    lines,
    setLines,
    isEllisping,
    ellipse,
    ellipses,
    setEllipses,
    isSelecting,
    selectingRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

export default useDrawing;
