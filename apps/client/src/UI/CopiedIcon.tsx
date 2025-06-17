import { FcCheckmark } from "react-icons/fc";

function CopiedButton() {
  return (
    <button
      className={`z-10 flex h-[40px] w-[100px] items-center justify-center rounded-sm bg-green-200 px-4 py-2 font-semibold text-white transition duration-100 ease-in-out hover:cursor-pointer`}
    >
      <FcCheckmark className="text-xl" />
    </button>
  );
}

export default CopiedButton;
