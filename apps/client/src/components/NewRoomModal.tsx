import { useEffect, useState } from "react";
import ThemeButton from "./ThemeButton";
import CopiedButton from "./CopiedButton";
import { IoMdClose } from "react-icons/io";
import ModalContainer from "../UI/ModalContainer";

interface NewRoomModalProps {
  roomId: string;
  onClick: () => void;
}

export default function NewRoomModal({ roomId, onClick }: NewRoomModalProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    const timeoutID = setTimeout(() => setIsCopied(false), 3000);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [isCopied]);

  function handleCopy() {
    navigator.clipboard.writeText(
      `${import.meta.env.VITE_USER_DOMAIN}?room=${roomId}`
    );

    setIsCopied(true);
  }

  return (
    <ModalContainer>
      <>
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
      </>
    </ModalContainer>
  );
}
