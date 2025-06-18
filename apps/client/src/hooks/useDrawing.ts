import { useState } from "react";
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
import { DrawEllipseCommand } from "../commands/DrawEllipseCommand";
import type { User } from "../types/User";
import type { UserCursor } from "../types/UserCursor";
import toast from "react-hot-toast";
import baseUrl from "../utils/baseUrl";
import useSocketListener from "./useSocketListener";
import useUndoRedo from "./useUndoRedo";
import useLoadRoomBoardData from "./useLoadRoomBoardData";

function useDrawing(
  roomId: string | null,
  currentUser: User | null,
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
  const [isSelecting, setIsSelecting] = useState(false);
  const { selectedShape, selectedColor } = useDrawingSelector();

  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);

  const { setUndoStack, setRedoStack } = useUndoRedo(roomId);
  // load room board saved status
  useLoadRoomBoardData(roomId, setLines, setEllipses);
  useSocketListener(
    currentUser,
    roomId,
    setLines,
    setEllipses,
    setOtherUserCursors
  );

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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        ownerId: currentUser.id,
        boardLines: lines,
        boardEllipses: ellipses,
      }),
    };

    const res = await fetch(`${baseUrl}/room`, options);

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
