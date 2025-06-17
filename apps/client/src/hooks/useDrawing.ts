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
import type { UserCursor } from "../types/UserCursor";
import toast from "react-hot-toast";

function useDrawing(
  roomId: string | null,
  currentUser: User | null,
  baseUrl: string,
  isRoomOwner: boolean
) {
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
  const { selectedShape, selectedColor } = useDrawingSelector();

  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);

  // load room board saved status
  useEffect(() => {
    async function getRoomData() {
      if (!roomId || !currentUser) return;

      const params = new URLSearchParams({
        roomId,
      });

      const url = `${baseUrl}/roomdata?${params.toString()}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await fetch(url, options);
      const data = await res.json();

      if (data) setLines(data.stage_lines);
      if (data) setEllipses(data.stage_ellipses);
    }

    if (roomId) getRoomData();
  }, [roomId, currentUser]);

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

    window.addEventListener("keydown", undoRedo);

    return () => {
      window.removeEventListener("keydown", undoRedo);
    };
  }, [undoStack, redoStack, lines, roomId, currentUser]);

  // socket listener
  useEffect(() => {
    socket.on("command", (data) => {
      if (!currentUser || roomId !== data.roomId) return;

      // testing
      // console.log(data.userId, "data.userId");
      // this is where the bug happened, the local undo delete the line, but in the event loop it not yet re-render, and then this emit command undo happen, the lines state is the same as the one just deleted line, so the state is not change, so the line has been deleted from the lines, but the re-render is not triggered? But why only happend when another user draw something
      if (data.userId === currentUser.id) return;

      if (data.type === "draw") {
        if (data.shape === "line") {
          const { line } = data;
          setLines((prev) => [
            ...prev.filter((drawedLine) => drawedLine.id !== line.id),
            line,
          ]);
        }

        if (data.shape === "ellipse") {
          const { ellipse } = data;
          setEllipses((prev) => [
            ...prev.filter((drawedEllipse) => drawedEllipse.id !== ellipse.id),
            ellipse,
          ]);
        }
      }

      if (data.type === "undo") {
        if (data.command.shape === "line") {
          const { targetShapeId } = data.command;
          setLines((prev) => prev.filter((line) => line.id !== targetShapeId));
        }

        if (data.command.shape === "ellipse") {
          const { targetShapeId } = data.command;
          setEllipses((prev) =>
            prev.filter((ellipse) => ellipse.id !== targetShapeId)
          );
        }
      }

      if (data.type === "redo") {
        if (data.command.shape === "line") {
          const { line } = data.command;
          setLines((prev) => [...prev, line]);
        }

        if (data.command.shape === "ellipse") {
          const { ellipse } = data.command;
          setEllipses((prev) => [...prev, ellipse]);
        }
      }
    });

    socket.on("cursormove", (data) => {
      const { newCoord, userId, userName } = data;
      if (!currentUser || userId === currentUser.id || !roomId) return;

      setOtherUserCursors((prev) => [
        ...prev.filter((otherUserCursor) => otherUserCursor.userId !== userId),
        { userId, coord: newCoord, userName },
      ]);
    });

    return () => {
      socket.off("command");
      socket.off("cursormove");
    };
  }, [roomId, currentUser]);

  function handleMouseDown(e: KonvaEventObject<PointerEvent>) {
    if (e.evt.button === 0) {
      const newCoord = e.target.getStage()!.getPointerPosition()!;
      if (selectedShape === "pencil") setIsDrawing(true);
      if (selectedShape === "eraser") {
        setIsDrawing(true);
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

  async function handleSaveBoard() {
    if (!currentUser || !isRoomOwner) return;

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        ownerId: currentUser.id,
        boardLines: lines,
        boardEllipses: ellipses,
      }),
    };

    const res = await fetch(`${baseUrl}/roomsave`, options);

    const data = await res.json();
    if (data) {
      toast.success("Board content is saved.");
    }
  }

  function handleClearBoard() {
    setLines([]);
    setEllipses([]);
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
    otherUserCursors,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSaveBoard,
    handleClearBoard,
  };
}

export default useDrawing;
