import { IoColorPaletteOutline } from "react-icons/io5";
import ColorSelector from "./ColorSelector";
import { useSelectedColor } from "../contexts/SelectedColorContext";

const colors = [
  { id: "black", twcss: "bg-black" },
  { id: "gray", twcss: "bg-gray-400" },
  { id: "red", twcss: "bg-red-500" },
  { id: "yellow", twcss: "bg-yellow-400" },
  { id: "blue", twcss: "bg-blue-500" },
  { id: "green", twcss: "bg-green-500" },
  { id: "purple", twcss: "bg-purple-500" },
];

function Palette() {
  const { selectedColor, setSelectedColor } = useSelectedColor();

  return (
    <div className="w-[40px] h-[250px] flex flex-col justify-between items-center absolute left-3 top-1/2 -translate-y-1/2  shadow-sm border border-gray-200 rounded-md z-10 bg-white p-1">
      <div>
        <IoColorPaletteOutline className="text-2xl" />
      </div>
      {colors.map((color) => (
        <ColorSelector
          key={color.id}
          twcss={color.twcss}
          isActive={selectedColor === color.id}
          onSelect={() => setSelectedColor(color.id)}
        />
      ))}
    </div>
  );
}

export default Palette;
