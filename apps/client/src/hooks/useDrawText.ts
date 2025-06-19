import { useState } from "react";
import type { TextInterface } from "../types/TextInterface";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import type { KonvaEventObject } from "konva/lib/Node";
import { v4 as uuidv4 } from "uuid";
import useSocketEmitter from "./useSocketEmitter";
import { DrawTextCommand } from "../commands/DrawTextCommand";
import { useUndoRedoStack } from "../contexts/UndoRedoStackContext";

function useDrawText(roomId: string | null) {
  const [openTextArea, setOpenTextArea] = useState<boolean>(false);
  const [textAreaCoord, setTextAreaCoord] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [texts, setTexts] = useState<TextInterface[]>([]);
  const { emitDrawingShape } = useSocketEmitter();

  const { selectedShape } = useDrawingSelector();
  const { setUndoStack, setRedoStack } = useUndoRedoStack();

  function handleDblClick(e: KonvaEventObject<MouseEvent>) {
    if (selectedShape !== "cursor") return;

    setOpenTextArea(true);
    const coord = e.target.getStage()?.getPointerPosition();
    setTextAreaCoord(coord as { x: number; y: number });
  }

  function handleTextSubmit(e: React.FocusEvent<HTMLInputElement>) {
    const text = e.target.value;
    if (!textAreaCoord || !text) return;

    const newText = {
      id: uuidv4(),
      x: textAreaCoord.x,
      y: textAreaCoord.y + 5,
      text,
      fontSize: 22,
      fill: "black",
    };

    setTexts((prev) => [...(prev ?? []), newText]);
    e.target.value = "";
    setOpenTextArea(false);

    const drawTextCommand = new DrawTextCommand(newText, setTexts);
    setUndoStack((prev) => [...prev, drawTextCommand]);
    setRedoStack([]);

    if (roomId) {
      emitDrawingShape(roomId, "text", newText);
    }
  }

  return {
    openTextArea,
    setOpenTextArea,
    textAreaCoord,
    setTextAreaCoord,
    texts,
    setTexts,
    handleDblClick,
    handleTextSubmit,
  };
}

export default useDrawText;
