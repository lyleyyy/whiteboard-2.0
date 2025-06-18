import { useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import type { User } from "../types/User";
import type { UserCursor } from "../types/UserCursor";
import toast from "react-hot-toast";
import baseUrl from "../utils/baseUrl";
import useSocketListener from "./useSocketListener";
import useLoadRoomBoardData from "./useLoadRoomBoardData";
import useDrawLine from "./useDrawLine";
import useDrawEllipse from "./useDrawEllipse";
import useSocketEmitter from "./useSocketEmitter";
import useDrawRect from "./useDrawRect";
import useTextInput from "./useTextInput";

function useDrawing(
  roomId: string | null,
  currentUser: User | null,
  isRoomOwner: boolean
) {
  const {
    isDrawing,
    setIsDrawing,
    line,
    lines,
    setLines,
    drawingNewLine,
    finishDrawLine,
  } = useDrawLine(roomId);

  const {
    isEllisping,
    setIsEllisping,
    setEllipseRaw,
    ellipse,
    ellipses,
    setEllipses,
    drawingNewEllipse,
    finishDrawEllipse,
  } = useDrawEllipse(roomId);

  const {
    openTextArea,
    textAreaCoord,
    Texts,
    setTexts,
    handleDblClick,
    handleTextSubmit,
  } = useTextInput(roomId);

  const {
    setRectRaw,
    selectingRect,
    setSelectingRect,
    isSelecting,
    setIsSelecting,
    drawSelectingBox,
  } = useDrawRect();

  const { selectedShape } = useDrawingSelector();
  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);

  useLoadRoomBoardData(roomId, setLines, setEllipses);

  useSocketListener(
    roomId,
    setLines,
    setEllipses,
    setTexts,
    setOtherUserCursors
  );

  const { emitCursorMove } = useSocketEmitter();

  function handleMouseDown(e: KonvaEventObject<PointerEvent>) {
    if (e.evt.button === 0) {
      const newCoord = e.target.getStage()!.getPointerPosition()!;
      if (selectedShape === "pencil") setIsDrawing(true);
      if (selectedShape === "eraser") {
        setIsDrawing(true);
      }
      if (selectedShape === "ellipse") {
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

    if (roomId) {
      emitCursorMove(roomId, newCoord);
    }

    if (isDrawing) {
      drawingNewLine(newCoord);
    }

    if (isEllisping) {
      drawingNewEllipse(newCoord);
    }

    if (isSelecting) {
      drawSelectingBox(newCoord);
    }
  }

  function handleMouseUp() {
    if (selectedShape === "pencil" || selectedShape === "eraser") {
      finishDrawLine();
    }

    if (selectedShape === "ellipse") {
      finishDrawEllipse();
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
    openTextArea,
    textAreaCoord,
    Texts,
    setTexts,
    handleDblClick,
    handleTextSubmit,
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
