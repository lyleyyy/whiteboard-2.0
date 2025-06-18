import { useState } from "react";
import type { RectRawInterface } from "../types/RectRawInterface";
import type { RectInterface } from "../types/RectInterface";
import rectParametersCalculator from "../utils/rectParametersCalculator";
import { v4 as uuidv4 } from "uuid";

function useDrawRect() {
  const [rectRaw, setRectRaw] = useState<RectRawInterface | null>(null);
  const [selectingRect, setSelectingRect] = useState<RectInterface | null>(
    null
  );
  const [isSelecting, setIsSelecting] = useState(false);

  function drawSelectingBox(newCoord: { x: number; y: number }) {
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

  return {
    rectRaw,
    setRectRaw,
    selectingRect,
    setSelectingRect,
    isSelecting,
    setIsSelecting,
    drawSelectingBox,
  };
}

export default useDrawRect;
