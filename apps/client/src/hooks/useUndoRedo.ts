import { useEffect, useState } from "react";
import type { DrawCommand } from "../commands/types";
import { socket } from "../lib/socketClient";
import { useCurrentUser } from "../contexts/CurrentUserContext";

function useUndoRedo(roomId: string | null) {
  const [undoStack, setUndoStack] = useState<DrawCommand[]>([]);
  const [redoStack, setRedoStack] = useState<DrawCommand[]>([]);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    function undoRedo(e: KeyboardEvent) {
      if (!currentUser) return;

      if (e.key === "z" && e.metaKey) {
        // redo
        if (e.shiftKey) {
          if (redoStack.length !== 0) {
            const redoCommand = redoStack.pop();
            if (redoCommand) {
              redoCommand.do();
              setUndoStack((prev) => [...prev, redoCommand]);
              setRedoStack(redoStack);

              if (roomId) {
                socket.emit("command", {
                  type: "redo",
                  shape: redoCommand.shape,
                  command: redoCommand,
                  roomId,
                  userId: currentUser.id,
                });
              }
            }
          }
        } else {
          // undo
          if (undoStack.length !== 0) {
            const undoCommand = undoStack.pop();
            if (undoCommand) {
              undoCommand.undo();
              setRedoStack((prev) => [...prev, undoCommand]);
              setUndoStack(undoStack);

              if (roomId) {
                socket.emit("command", {
                  type: "undo",
                  shape: undoCommand.shape,
                  command: undoCommand,
                  roomId,
                  userId: currentUser.id,
                });
              }
            }
          }
        }
      }
    }

    window.addEventListener("keydown", undoRedo);

    return () => {
      window.removeEventListener("keydown", undoRedo);
    };
  }, [undoStack, redoStack, roomId, currentUser]);

  return { undoStack, setUndoStack, redoStack, setRedoStack };
}

export default useUndoRedo;
