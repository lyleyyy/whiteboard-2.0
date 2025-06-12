import { FaRegHandPaper } from "react-icons/fa";
import { HiOutlinePencil } from "react-icons/hi";
import { PiCursorFill } from "react-icons/pi";
import { FaRegCircle } from "react-icons/fa";
import { FaRegSquare } from "react-icons/fa";
import { LuDiamond } from "react-icons/lu";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { MdFormatColorText } from "react-icons/md";
import { BiEraser } from "react-icons/bi";
import ShapeSelector from "./ShapeSelector";
import { useState } from "react";

interface ShapeConfig {
  id: string;
  icon: React.ElementType;
}

const shapes: ShapeConfig[] = [
  { id: "hand", icon: FaRegHandPaper },
  { id: "pencil", icon: HiOutlinePencil },
  { id: "cursor", icon: PiCursorFill },
  { id: "circle", icon: FaRegCircle },
  { id: "square", icon: FaRegSquare },
  { id: "diamond", icon: LuDiamond },
  { id: "arrow", icon: HiOutlineArrowNarrowRight },
  { id: "line", icon: TfiLayoutLineSolid },
  { id: "text", icon: MdFormatColorText },
  { id: "eraser", icon: BiEraser },
];

function ShapeSelectorBar() {
  const [activeShapeId, setActiveShapeId] = useState<string>("pencil");

  function handleShapeSelect(id: string) {
    setActiveShapeId(id);
  }

  return (
    <div className="flex justify-between items-center w-1/5 h-[40px] absolute right-1/2 top-5 translate-x-1/2 shadow-sm border border-gray-200 rounded-md z-10 bg-white p-1">
      {shapes.map((shape) => (
        <ShapeSelector
          key={shape.id}
          shapeId={shape.id}
          onSelect={handleShapeSelect}
          isActive={activeShapeId === shape.id}
        >
          <shape.icon />
        </ShapeSelector>
      ))}
    </div>
  );
}

export default ShapeSelectorBar;
