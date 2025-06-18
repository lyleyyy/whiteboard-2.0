import { createContext, useContext, useState } from "react";

interface DrawingSelectorContextType {
  selectedColor: string;
  selectedShape: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  setSelectedShape: React.Dispatch<React.SetStateAction<string>>;
}

const DrawingSelectorContext = createContext<
  DrawingSelectorContextType | undefined
>(undefined);

interface DrawingSelectorProviderProps {
  children: React.ReactNode;
}

function DrawingSelectorProvider({ children }: DrawingSelectorProviderProps) {
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [selectedShape, setSelectedShape] = useState<string>("cursor");

  return (
    <DrawingSelectorContext.Provider
      value={{
        selectedColor,
        setSelectedColor,
        selectedShape,
        setSelectedShape,
      }}
    >
      {children}
    </DrawingSelectorContext.Provider>
  );
}

function useDrawingSelector(): DrawingSelectorContextType {
  const context = useContext(DrawingSelectorContext);
  if (context === undefined)
    throw new Error(
      "useDrawingSelector must be used within a DrawingSelectorProvider"
    );

  return context;
}

/* eslint-disable react-refresh/only-export-components */
export { DrawingSelectorProvider, useDrawingSelector };
