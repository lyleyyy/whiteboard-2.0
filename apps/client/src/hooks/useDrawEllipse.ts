import { useState } from "react";
import type { EllipseRawInterface } from "../types/EllipseRawInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import ellipseParametersCalculator from "../utils/ellipseParametersCalculator";
import { useDrawingSelector } from "../contexts/DrawingSelectorContext";
import { v4 as uuidv4 } from "uuid";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import useSocketEmitter from "./useSocketEmitter";

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
  };
}

export default useDrawEllipse;
