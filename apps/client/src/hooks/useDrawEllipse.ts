import { useState } from "react";
import type { EllipseRawInterface } from "../types/EllipseRawInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import ellipseParametersCalculator from "../utils/ellipseParametersCalculator";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import { v4 as uuidv4 } from "uuid";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import useSocketEmitter from "./useSocketEmitter";
import { DrawEllipseCommand } from "../commands/DrawEllipseCommand";
import { useUndoRedoStack } from "../contexts/UndoRedoStackContext";

function useDrawEllipse(roomId: string | null) {
  const [isEllisping, setIsEllisping] = useState(false);
  const [ellipseRaw, setEllipseRaw] = useState<EllipseRawInterface | null>(
    null
  );
  const [ellipse, setEllipse] = useState<EllipseInterface | null>(null);
  const [ellipses, setEllipses] = useState<EllipseInterface[]>([]);

  const { selectedColor } = useDrawingSelector();
  const { currentUser } = useCurrentUser();
  const { emitDrawingShape } = useSocketEmitter();
  const { setUndoStack, setRedoStack } = useUndoRedoStack();

  function drawingNewEllipse(newCoord: { x: number; y: number }) {
    if (!currentUser) return;

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
      emitDrawingShape(roomId, "ellipse", newEllipse);
    }
  }

  function finishDrawEllipse() {
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

  return {
    isEllisping,
    setIsEllisping,
    ellipseRaw,
    setEllipseRaw,
    ellipse,
    setEllipse,
    ellipses,
    setEllipses,
    drawingNewEllipse,
    finishDrawEllipse,
  };
}

export default useDrawEllipse;
