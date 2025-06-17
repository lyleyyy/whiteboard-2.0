interface SecondaryButtonProps {
  positionCss?: string;
  buttonName: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function SecondaryButton({
  positionCss = "",
  buttonName,
  onClick,
}: SecondaryButtonProps) {
  return (
    <button
      className={`z-10 h-[40px] w-[130px] rounded-sm bg-red-400 px-4 py-2 font-semibold text-white transition duration-100 ease-in-out hover:cursor-pointer hover:bg-red-500 ${positionCss}`}
      onClick={onClick}
    >
      {buttonName}
    </button>
  );
}

export default SecondaryButton;
