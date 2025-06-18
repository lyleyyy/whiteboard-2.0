import { useState } from "react";
import type { TextInterface } from "../types/TextInterface";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import type { KonvaEventObject } from "konva/lib/Node";
import { v4 as uuidv4 } from "uuid";

function useTextInput() {
  const [openTextArea, setOpenTextArea] = useState<boolean>(false);
  const [textAreaCoord, setTextAreaCoord] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [Texts, setTexts] = useState<TextInterface[]>([]);

  const { selectedShape } = useDrawingSelector();

  function handleDblClick(e: KonvaEventObject<MouseEvent>) {
    if (selectedShape !== "cursor") return;

    setOpenTextArea(true);
    const coord = e.target.getStage()?.getPointerPosition();
    setTextAreaCoord(coord as { x: number; y: number });
  }

  function handleTextSubmit(e: React.FocusEvent<HTMLInputElement>) {
    if (!textAreaCoord) return;
    const text = e.target.value;

    const newText = {
      id: uuidv4(),
      x: textAreaCoord.x,
      y: textAreaCoord.y + 5,
      text,
      fontSize: 18,
      fill: "black",
    };

    setTexts((prev) => [...prev, newText]);
    e.target.value = "";
    setOpenTextArea(false);
  }

  return {
    openTextArea,
    setOpenTextArea,
    textAreaCoord,
    setTextAreaCoord,
    Texts,
    setTexts,
    handleDblClick,
    handleTextSubmit,
  };
}

export default useTextInput;
