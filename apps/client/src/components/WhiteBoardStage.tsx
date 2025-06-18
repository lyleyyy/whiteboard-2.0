import { Ellipse, Layer, Line, Rect, Stage, Text } from "react-konva";
import type { LineInterface } from "../types/LineInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import type { RectInterface } from "../types/RectInterface";
import type { KonvaEventObject } from "konva/lib/Node";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { useRef } from "react";
import type Konva from "konva";
import type { TextInterface } from "../types/TextInterface";

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
  // handleCursorMove: (e: KonvaEventObject<MouseEvent>) => void;
  handleDblClick: (e: KonvaEventObject<MouseEvent>) => void;
  Texts: TextInterface[];
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
  // handleCursorMove,
  handleDblClick,
  Texts,
}: WhiteBoardStageProps) {
  const { currentUser } = useCurrentUser();
  const stageRef = useRef<Konva.Stage>(null);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerMove={handleMouseMove}
      // onMouseMove={handleCursorMove}
      onDblClick={handleDblClick}
    >
      <Layer>
        {Texts &&
          Texts.map((text) => (
            <Text
              key={text.id}
              id={text.id}
              x={text.x}
              y={text.y}
              text={text.text}
              fontSize={text.fontSize}
              fill={text.fill}
            />
          ))}
        {/* <Text x={100} y={100} text={"waya"} fontSize={18} fill="black" /> */}
        {currentUser &&
          ellipses &&
          ellipses.map((ellipse) => (
            <Ellipse
              key={ellipse.id}
              id={ellipse.id}
              name="shape-ellipse"
              x={ellipse.x}
              y={ellipse.y}
              radiusX={ellipse.radiusX}
              radiusY={ellipse.radiusY}
              stroke={ellipse.stroke}
              strokeWidth={ellipse.strokeWidth}
            />
          ))}

        {currentUser &&
          lines &&
          lines.map((line) => (
            <Line
              key={line.id}
              id={line.id}
              name="shape-line"
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              onClick={() => handleSelectShape(line.id)}
            />
          ))}

        {currentUser && isEllisping && ellipse && (
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

        {currentUser && isDrawing && line && (
          <Line
            points={line.points}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
          />
        )}

        {currentUser && isSelecting && selectingRect && (
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
