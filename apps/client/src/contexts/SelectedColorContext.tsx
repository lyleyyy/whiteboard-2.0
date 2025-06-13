import { createContext, useContext, useState } from "react";

interface SelectedColorContextType {
  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
}

const SelectedColorContext = createContext<
  SelectedColorContextType | undefined
>(undefined);

interface SelectedColorProviderProps {
  children: React.ReactNode;
}

function SelectedColorProvider({ children }: SelectedColorProviderProps) {
  const [selectedColor, setSelectedColor] = useState<string>("black");

  return (
    <SelectedColorContext.Provider
      value={{
        selectedColor,
        setSelectedColor,
      }}
    >
      {children}
    </SelectedColorContext.Provider>
  );
}

function useSelectedColor(): SelectedColorContextType {
  const context = useContext(SelectedColorContext);
  if (context === undefined)
    throw new Error(
      "useSelectedColor must be used within a SelectedColorProvider"
    );

  return context;
}

/* eslint-disable react-refresh/only-export-components */
export { SelectedColorProvider, useSelectedColor };
