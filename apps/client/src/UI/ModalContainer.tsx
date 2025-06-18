import type { JSX } from "react";

interface ModalContainerProps {
  children: JSX.Element;
}

function ModalContainer({ children }: ModalContainerProps) {
  return (
    <div className="absolute z-20 h-full w-full bg-gray-600/10">
      <div className="absolute top-1/2 left-1/2 flex h-1/3 w-1/3 -translate-1/2 flex-col items-center justify-center gap-8 rounded-sm bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default ModalContainer;
