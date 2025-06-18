interface ColorSelectorProps {
  twcss: string;
  isActive: boolean;
  onSelect: () => void;
}

function ColorSelector({ twcss, isActive, onSelect }: ColorSelectorProps) {
  const bgCss = isActive ? "bg-purple-300" : "hover:bg-purple-300";

  return (
    <div
      className={`hover:cursor-pointer p-1 rounded-sm ${bgCss}`}
      onClick={onSelect}
    >
      <div className={`w-[20px] h-[20px] rounded-sm ${twcss}`}></div>
    </div>
  );
}

export default ColorSelector;
