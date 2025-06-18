import { createContext, useContext, useState } from "react";
import type { DrawCommand } from "../commands/types";

interface UndoRedoContextType {
  undoStack: DrawCommand[];
  setUndoStack: React.Dispatch<React.SetStateAction<DrawCommand[]>>;
  redoStack: DrawCommand[];
  setRedoStack: React.Dispatch<React.SetStateAction<DrawCommand[]>>;
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(
  undefined
);

interface UndoRedoProviderProps {
  children: React.ReactNode;
}

function UndoRedoStackProvider({ children }: UndoRedoProviderProps) {
  const [undoStack, setUndoStack] = useState<DrawCommand[]>([]);
  const [redoStack, setRedoStack] = useState<DrawCommand[]>([]);

  return (
    <UndoRedoContext.Provider
      value={{
        undoStack,
        setUndoStack,
        redoStack,
        setRedoStack,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
}

function useUndoRedoStack(): UndoRedoContextType {
  const context = useContext(UndoRedoContext);
  if (context === undefined)
    throw new Error("useUndoRedo must be used within a UndoRedoProvider");

  return context;
}

/* eslint-disable react-refresh/only-export-components */
export { UndoRedoStackProvider, useUndoRedoStack };
