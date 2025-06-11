import { useEffect, useState } from "react";
import ThemeButton from "./ThemeButton";
import CopiedButton from "./CopiedButton";
import { IoMdClose } from "react-icons/io";

interface NewRoomModalProps {
  roomId: string;
  onClick: () => void;
}

export default function NewRoomModal({ roomId, onClick }: NewRoomModalProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    const intervalID = setInterval(() => setIsCopied(false), 3000);

    return () => {
      clearInterval(intervalID);
    };
  }, [isCopied]);

  function handleCopy() {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_USER_DOMAIN}?room=${roomId}`,
    );

    setIsCopied(true);
  }

  return (
    <div className="absolute z-20 h-full w-full bg-gray-600/10">
      <div className="absolute top-1/2 left-1/2 flex h-1/3 w-1/3 -translate-1/2 flex-col items-center justify-center gap-8 rounded-sm bg-white shadow-2xl">
        <span
          className="hover:text- absolute top-3 right-3 cursor-pointer rounded-full transition duration-100 ease-in-out hover:bg-black hover:text-white"
          onClick={onClick}
        >
          <IoMdClose className="text-2xl" />
        </span>
        <h3 className="text-3xl font-medium">Live collaboration</h3>
        <p className="w-2/3 text-center">
          Invite strangers to spy on your drawing. Be very worried — the session
          is <b>NOT</b> encrypted and completely public. Even our server watches
          everything you draw... and takes notes.
        </p>
        {!isCopied && (
          <ThemeButton buttonName="Copy Link" onClick={handleCopy} />
        )}

        {isCopied && <CopiedButton />}
      </div>
    </div>
  );
}
