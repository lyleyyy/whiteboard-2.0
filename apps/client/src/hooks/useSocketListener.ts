import { useEffect } from "react";
import { socket } from "../lib/socketClient";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import type { LineInterface } from "../types/LineInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import type { UserCursor } from "../types/UserCursor";
import type { TextInterface } from "../types/TextInterface";

function useSocketListener(
  roomId: string | null,
  setLines: React.Dispatch<React.SetStateAction<LineInterface[]>>,
  setEllipses: React.Dispatch<React.SetStateAction<EllipseInterface[]>>,
  setTexts: React.Dispatch<React.SetStateAction<TextInterface[]>>,
  setOtherUserCursors: React.Dispatch<React.SetStateAction<UserCursor[]>>
) {
  const { currentUser } = useCurrentUser();
  // socket listener
  useEffect(() => {
    socket.on("command", (data) => {
      if (!currentUser || roomId !== data.roomId) return;

      // testing
      // console.log(data.userId, "data.userId");
      // this is where the bug happened, the local undo delete the line, but in the event loop it not yet re-render, and then this emit command undo happen, the lines state is the same as the one just deleted line, so the state is not change, so the line has been deleted from the lines, but the re-render is not triggered? But why only happend when another user draw something
      if (data.userId === currentUser.id) return;

      if (data.type === "draw") {
        if (data.shape === "line") {
          const { shapeObj } = data;
          setLines((prev) => [
            ...(prev ?? []).filter(
              (drawedLine) => drawedLine.id !== shapeObj.id
            ),
            shapeObj,
          ]);
        }

        if (data.shape === "ellipse") {
          const { shapeObj } = data;
          setEllipses((prev) => [
            ...(prev ?? []).filter(
              (drawedEllipse) => drawedEllipse.id !== shapeObj.id
            ),
            shapeObj,
          ]);
        }

        if (data.shape === "text") {
          const { shapeObj } = data;
          setTexts((prev) => [
            ...(prev ?? []).filter(
              (drawedText) => drawedText.id !== shapeObj.id
            ),
            shapeObj,
          ]);
        }
      }

      if (data.type === "undo") {
        if (data.command.shape === "line") {
          const { targetShapeId } = data.command;
          setLines((prev) => prev.filter((line) => line.id !== targetShapeId));
        }

        if (data.command.shape === "ellipse") {
          const { targetShapeId } = data.command;
          setEllipses((prev) =>
            prev.filter((ellipse) => ellipse.id !== targetShapeId)
          );
        }

        if (data.command.shape === "text") {
          console.log(data, "wayaya");
          const { targetShapeId } = data.command;
          setTexts((prev) => prev.filter((text) => text.id !== targetShapeId));
        }
      }

      if (data.type === "redo") {
        if (data.command.shape === "line") {
          const { line } = data.command;
          setLines((prev) => [...prev, line]);
        }

        if (data.command.shape === "ellipse") {
          const { ellipse } = data.command;
          setEllipses((prev) => [...prev, ellipse]);
        }

        if (data.command.shape === "text") {
          const { text } = data.command;
          setTexts((prev) => [...prev, text]);
        }
      }
    });

    socket.on("cursormove", (data) => {
      const { newCoord, userId, userName } = data;
      if (!currentUser || userId === currentUser.id || !roomId) return;

      setOtherUserCursors((prev) => [
        ...prev.filter((otherUserCursor) => otherUserCursor.userId !== userId),
        { userId, coord: newCoord, userName },
      ]);
    });

    return () => {
      socket.off("command");
      socket.off("cursormove");
    };
  }, [
    roomId,
    currentUser,
    setLines,
    setEllipses,
    setTexts,
    setOtherUserCursors,
  ]);
}

export default useSocketListener;
