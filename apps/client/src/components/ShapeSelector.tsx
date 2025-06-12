import { useSelectedShape } from "../contexts/SelectedShapeContext";

interface ShapeSelectorProps {
  shapeId: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}

function ShapeSelector({
  shapeId,
  isActive,
  onSelect,
  children,
}: ShapeSelectorProps) {
  const activeClass = isActive ? "bg-purple-300" : "hover:bg-purple-100";
  const { setSelectedShape } = useSelectedShape();

  return (
    <div
      className={`flex justify-center items-center w-[30px] h-full rounded-sm hover:cursor-pointer ${activeClass}`}
      onClick={() => {
        onSelect(shapeId);
        setSelectedShape(shapeId);
      }}
    >
      {children}
    </div>
  );
}

export default ShapeSelector;
