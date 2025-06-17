import { Ellipse, Layer, Line, Rect, Stage } from "react-konva";
import type { LineInterface } from "../types/LineInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import type { RectInterface } from "../types/RectInterface";
import type { KonvaEventObject } from "konva/lib/Node";

interface WhiteBoardStageProps {
  isDrawing: boolean;
  line: LineInterface | null;
  lines: LineInterface[];
  isEllisping: boolean;
  ellipse: EllipseInterface | null;
  ellipses: EllipseInterface[];
  isSelecting: boolean;
  selectingRect: RectInterface | null;
  handleMouseDown: (e: KonvaEventObject<PointerEvent>) => void;
  handleMouseMove: (e: KonvaEventObject<PointerEvent>) => void;
  handleMouseUp: () => void;
  handleSelectShape: (shapeId: string) => void;
}

function WhiteBoardStage({
  isDrawing,
  line,
  lines,
  isEllisping,
  ellipse,
  ellipses,
  isSelecting,
  selectingRect,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleSelectShape,
}: WhiteBoardStageProps) {
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerMove={handleMouseMove}
    >
      <Layer>
        {ellipses &&
          ellipses.map((ellipse) => (
            <Ellipse
              key={ellipse.id}
              x={ellipse.x}
              y={ellipse.y}
              radiusX={ellipse.radiusX}
              radiusY={ellipse.radiusY}
              stroke={ellipse.stroke}
              strokeWidth={ellipse.strokeWidth}
            />
          ))}

        {lines &&
          lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              onClick={() => handleSelectShape(line.id)}
            />
          ))}

        {isEllisping && ellipse && (
          <Ellipse
            x={ellipse.x}
            y={ellipse.y}
            radiusX={ellipse.radiusX}
            radiusY={ellipse.radiusY}
            stroke={ellipse.stroke}
            strokeWidth={ellipse.strokeWidth}
            onClick={() => handleSelectShape(ellipse.id)}
          />
        )}

        {isDrawing && line && (
          <Line
            points={line.points}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
          />
        )}

        {isSelecting && selectingRect && (
          <Rect
            x={selectingRect.x}
            y={selectingRect.y}
            width={selectingRect.width}
            height={selectingRect.height}
            fill="rgba(108, 92, 231, 0.1)"
            stroke="#6c5ce7"
            strokeWidth={1}
          />
        )}
      </Layer>
    </Stage>
  );
}

export default WhiteBoardStage;
