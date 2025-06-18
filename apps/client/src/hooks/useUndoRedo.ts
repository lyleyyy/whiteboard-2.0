import { socket } from "../lib/socketClient";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { useUndoRedoStack } from "../contexts/UndoRedoStackContext";

function useUndoRedo(roomId: string | null) {
  const { undoStack, setUndoStack, redoStack, setRedoStack } =
    useUndoRedoStack();
  const { currentUser } = useCurrentUser();

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
        console.log("waya");
        console.log(undoStack);
        if (undoStack.length !== 0) {
          console.log(undoStack);
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

  return { undoStack, setUndoStack, redoStack, setRedoStack, undoRedo };
}

export default useUndoRedo;
