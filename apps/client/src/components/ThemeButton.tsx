interface ThemeButtonProps {
  positionCss?: string;
  buttonName: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ThemeButton({
  positionCss = "",
  buttonName,
  onClick,
}: ThemeButtonProps) {
  return (
    <button
      className={`z-10 h-[40px] w-[130px] rounded-sm bg-purple-500 px-4 py-2 font-semibold text-white transition duration-100 ease-in-out hover:cursor-pointer hover:bg-purple-600 ${positionCss}`}
      onClick={onClick}
    >
      {buttonName}
    </button>
  );
}

export default ThemeButton;
