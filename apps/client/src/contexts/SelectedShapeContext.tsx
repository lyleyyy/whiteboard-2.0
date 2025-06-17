import { createContext, useContext, useState } from "react";

interface SelectedShapeContextType {
  selectedShape: string;
  setSelectedShape: React.Dispatch<React.SetStateAction<string>>;
}

const SelectedShapeContext = createContext<
  SelectedShapeContextType | undefined
>(undefined);

interface SelectedShapeProviderProps {
  children: React.ReactNode;
}

function SelectedShapeProvider({ children }: SelectedShapeProviderProps) {
  const [selectedShape, setSelectedShape] = useState<string>("pencil");

  return (
    <SelectedShapeContext.Provider
      value={{
        selectedShape,
        setSelectedShape,
      }}
    >
      {children}
    </SelectedShapeContext.Provider>
  );
}

function useSelectedShape(): SelectedShapeContextType {
  const context = useContext(SelectedShapeContext);
  if (context === undefined)
    throw new Error(
      "useSelectedShape must be used within a SelectedShapeProvider"
    );

  return context;
}

/* eslint-disable react-refresh/only-export-components */
export { SelectedShapeProvider, useSelectedShape };
