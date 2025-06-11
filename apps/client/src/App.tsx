import { useEffect, useState } from "react";
import { DrawLineCommand } from "./commands/DrawLineCommand.ts";
import type { Command } from "./commands/types";
import type { LineInterface } from "./types/LineInterface.ts";
import type { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Line } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import ThemeButton from "./components/ThemeButton.tsx";
import { NavLink, useSearchParams } from "react-router";
import { socket } from "./lib/socketClient.ts";
import NewRoomModal from "./components/NewRoomModal.tsx";
import SecondaryButton from "./components/SecondaryButton.tsx";
import type { UserCursor } from "./types/UserCursor.ts";
import { PiCursorClickDuotone } from "react-icons/pi";

const userId = uuidv4();
const userName = "Waya";

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);
  const [undoStack, setUndoStack] = useState<Command[]>([]);
  const [redoStack, setRedoStack] = useState<Command[]>([]);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("room");

  useEffect(() => {
    if (searchParams) {
      // console.log(`I am in room ${roomId}`);
      socket.emit("joinroom", roomId);
    }
  }, [searchParams, roomId]);

  // undo redo
  useEffect(() => {
    function undoRedo(e: KeyboardEvent) {
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
                  shape: "line",
                  command: redoCommand,
                  roomId,
                  userId,
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
                  shape: "line",
                  command: undoCommand,
                  roomId,
                  userId,
                });
              }
            }
          }
        }
      }
    }

    function test(e: KeyboardEvent) {
      if (e.key === "q") {
        console.log(lines, "the lines state");
        console.log(undoStack);
        console.log(redoStack);
      }
    }

    window.addEventListener("keydown", undoRedo);
    window.addEventListener("keydown", test);

    return () => {
      window.removeEventListener("keydown", undoRedo);
      window.removeEventListener("keydown", test);
    };
  }, [undoStack, redoStack, lines, roomId]);

  // socket listener
  useEffect(() => {
    socket.on("command", (data) => {
      console.log(data, "wqdqdqwdwqdwq");
      if (roomId !== data.roomId) return;

      // testing
      console.log(data.userId, "data.userId");
      // this is where the bug happened, the local undo delete the line, but in the event loop it not yet re-render, and then this emit command undo happen, the lines state is the same as the one just deleted line, so the state is not change, so the line has been deleted from the lines, but the re-render is not triggered? But why only happend when another user draw something
      if (data.userId === userId) return;

      if (data.type === "draw") {
        if (data.shape === "line") {
          const { line } = data;
          setLines((prev) => [
            ...prev.filter((drawedLine) => drawedLine.id !== line.id),
            line,
          ]);
        }
      }

      if (data.type === "undo") {
        if (data.command.shape === "line") {
          const { targetShapeId } = data.command;
          setLines((prev) => prev.filter((line) => line.id !== targetShapeId));
        }
      }

      if (data.type === "redo") {
        if (data.command.shape === "line") {
          const { line } = data.command;
          setLines((prev) => [...prev, line]);
        }
      }
    });

    socket.on("cursormove", (data) => {
      const { newCoord, userId } = data;
      setOtherUserCursors((prev) => [
        ...prev.filter((otherUserCursor) => otherUserCursor.userId !== userId),
        { userId, coord: newCoord, userName },
      ]);
    });

    return () => {
      socket.off("command");
      socket.off("cursormove");
    };
  }, [roomId]);

  function handleMouseDown() {
    setIsDrawing(true);
  }

  function handleMouseUp() {
    setIsDrawing(false);
    if (line !== null) setLines((prev) => [...prev, line]);
    setLine(null);
    if (line !== null) {
      const drawLineCommand = new DrawLineCommand(line, setLines);
      setUndoStack((prev) => [...prev, drawLineCommand]);
      setRedoStack([]);
    }
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    const newCoord = e.target.getStage()?.getPointerPosition();
    if (!newCoord) return;

    if (isDrawing) {
      const newLine = {
        id: line?.id || uuidv4(),
        points: [...(line?.points ?? []), newCoord.x, newCoord.y],
        stroke: "blacks",
        strokeWidth: 2,
      };

      setLine(newLine);

      // socket io emits event
      // socket.emit("drawline", newLine);
      if (roomId) {
        socket.emit("command", {
          type: "draw",
          shape: "line",
          line: newLine,
          roomId,
          userId,
        });
      }
      // throttledEmit(newLine);
    }

    // mouse move cursor
    socket.emit("cursormove", {
      newCoord,
      roomId,
      userId,
      userName,
    });
  }

  function handleNewRoom(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const params = new URLSearchParams();
    const newRoomId = uuidv4();
    params.set("room", newRoomId);
    setSearchParams(params);

    setIsNewRoomModalOpen(true);
  }

  return (
    <>
      {otherUserCursors.length !== 0 &&
        otherUserCursors.map((userCursor) => {
          const { coord, userName } = userCursor;
          if (userId !== userCursor.userId) {
            const { x, y } = coord;

            return (
              <span
                key={userCursor.userId}
                className={`absolute flex`}
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                <PiCursorClickDuotone />
                <p className="text-sm">{userName}</p>
              </span>
            );
          }
        })}
      {isNewRoomModalOpen && roomId && (
        <NewRoomModal
          roomId={roomId}
          onClick={() => setIsNewRoomModalOpen(false)}
        />
      )}

      {!roomId && (
        <ThemeButton
          positionCss="absolute right-5 top-5"
          buttonName="New Room"
          onClick={(e) => handleNewRoom(e)}
        />
      )}

      {roomId && (
        <NavLink to="/">
          <SecondaryButton
            positionCss="absolute right-5 top-5"
            buttonName="Leave Room"
          />
        </NavLink>
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {isDrawing && <Line points={line?.points} stroke="black" />}
          {lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
}

export default App;
