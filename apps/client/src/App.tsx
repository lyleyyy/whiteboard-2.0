import { useEffect, useState } from "react";
import { Stage, Layer, Line, Ellipse } from "react-konva";
import { NavLink, useSearchParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import { PiCursorClickDuotone } from "react-icons/pi";
import { socket } from "./lib/socketClient.ts";
import generateGuest from "./utils/guestGenerator.ts";
import ThemeButton from "./components/ThemeButton.tsx";
import NewRoomModal from "./components/NewRoomModal.tsx";
import SecondaryButton from "./components/SecondaryButton.tsx";
import ShapeSelectorBar from "./components/ShapeSelectorBar.tsx";
import Palette from "./components/Palette.tsx";
import { DrawLineCommand } from "./commands/DrawLineCommand.ts";
import type { Command } from "./commands/types";
import type { LineInterface } from "./types/LineInterface.ts";
import type { KonvaEventObject } from "konva/lib/Node";
import type { UserCursor } from "./types/UserCursor.ts";
import type { User } from "./types/User.ts";
import type { EllipseRawInterface } from "./types/EllipseRawInterface.ts";
import type { EllipseInterface } from "./types/EllipseInterface.ts";
import { useSelectedShape } from "./contexts/SelectedShapeContext.tsx";
import { useSelectedColor } from "./contexts/SelectedColorContext.tsx";
import ellipseParametersCalculator from "./utils/ellipseParametersCalculator.ts";
import { DrawEllipseCommand } from "./commands/DrawEllipseCommand.ts";

function App() {
  const [currentUser, setCurrentUser] = useState<User>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEllisping, setIsEllisping] = useState(false);
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [ellipseRaw, setEllipseRaw] = useState<EllipseRawInterface | null>(
    null
  );
  const [ellipse, setEllipse] = useState<EllipseInterface | null>(null);
  const [ellipses, setEllipses] = useState<EllipseInterface[]>([]);
  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);
  const [undoStack, setUndoStack] = useState<Command[]>([]);
  const [redoStack, setRedoStack] = useState<Command[]>([]);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedShape } = useSelectedShape();
  const { selectedColor, setSelectedColor } = useSelectedColor();
  const roomId = searchParams.get("room");

  // initialize the user
  useEffect(() => {
    const owner = localStorage.getItem("whiteboard_owner");

    if (!owner) {
      const guest = generateGuest();
      localStorage.setItem("whiteboard_guest", JSON.stringify(guest));

      setCurrentUser(guest);
    } else {
      setCurrentUser(JSON.parse(owner));
    }
  }, []);

  // load room board saved status
  useEffect(() => {
    async function getRoomData() {
      if (!roomId || !currentUser) return;

      const params = new URLSearchParams({
        roomId,
        // ownerId: currentUser.userId,
        // ownerId is hard coded
        ownerId: "lyleyyy",
      });

      const url = `${import.meta.env.VITE_SOCKET_SERVER_ADDRESS}/roomdata?${params.toString()}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await fetch(url, options);
      const data = await res.json();
      if (data) setLines(data);
    }

    if (roomId) getRoomData();
  }, [roomId, currentUser]);

  // if there is params of roomId in the url, join the room
  useEffect(() => {
    if (searchParams) {
      socket.emit("joinroom", roomId);
    }
  }, [searchParams, roomId]);

  // undo redo
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
                  shape: "line",
                  command: redoCommand,
                  roomId,
                  userId: currentUser.userId,
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
                  userId: currentUser.userId,
                });
              }
            }
          }
        }
      }
    }

    // function test(e: KeyboardEvent) {
    //   if (e.key === "q") {
    //     console.log(lines, "the lines state");
    //     console.log(undoStack);
    //     console.log(redoStack);
    //   }
    // }

    window.addEventListener("keydown", undoRedo);
    // window.addEventListener("keydown", test);

    return () => {
      window.removeEventListener("keydown", undoRedo);
      // window.removeEventListener("keydown", test);
    };
  }, [undoStack, redoStack, lines, roomId, currentUser]);

  // socket listener
  useEffect(() => {
    socket.on("command", (data) => {
      if (!currentUser || roomId !== data.roomId) return;

      // testing
      // console.log(data.userId, "data.userId");
      // this is where the bug happened, the local undo delete the line, but in the event loop it not yet re-render, and then this emit command undo happen, the lines state is the same as the one just deleted line, so the state is not change, so the line has been deleted from the lines, but the re-render is not triggered? But why only happend when another user draw something
      if (data.userId === currentUser.userId) return;

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
      const { newCoord, userId, userName } = data;
      if (!currentUser || userId === currentUser.userId) return;

      setOtherUserCursors((prev) => [
        ...prev.filter((otherUserCursor) => otherUserCursor.userId !== userId),
        { userId, coord: newCoord, userName },
      ]);
    });

    return () => {
      socket.off("command");
      socket.off("cursormove");
    };
  }, [roomId, currentUser]);

  function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
    if (e.evt.button === 0) {
      if (selectedShape === "pencil") setIsDrawing(true);
      if (selectedShape === "eraser") {
        setIsDrawing(true);
        setSelectedColor("white");
      }
      if (selectedShape === "circle") {
        setIsEllisping(true);

        const newCoord = e.target.getStage()!.getPointerPosition()!;
        const newEllispe = {
          startCoords: newCoord,
          endCoords: null,
        };

        setEllipseRaw(newEllispe);
      }
    }
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    if (!currentUser) return;

    const newCoord = e.target.getStage()?.getPointerPosition();
    if (!newCoord) return;

    // mouse move cursor
    socket.emit("cursormove", {
      newCoord,
      roomId,
      userId: currentUser.userId,
      userName: currentUser.username,
    });

    if (isDrawing) {
      const newLine = {
        id: line?.id || uuidv4(),
        points: [...(line?.points ?? []), newCoord.x, newCoord.y],
        stroke: selectedColor,
        strokeWidth: selectedColor === "white" ? 40 : 4,
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
          userId: currentUser.userId,
        });
      }
      // throttledEmit(newLine);
    }

    if (isEllisping) {
      setEllipseRaw((prev) => {
        if (!prev) return null;
        return { startCoords: prev.startCoords, endCoords: newCoord };
      });

      console.log(ellipseRaw);

      if (!ellipseRaw || !ellipseRaw.endCoords) return;
      const { startCoords, endCoords } = ellipseRaw;

      const data = ellipseParametersCalculator(startCoords, endCoords);
      setEllipse({
        ...data,
        id: uuidv4(),
        stroke: selectedColor,
        strokeWidth: 2,
      });
    }
  }

  function handleMouseUp() {
    if (selectedShape === "pencil" || selectedShape === "eraser") {
      setIsDrawing(false);
      // setIsEarsing(false);
      if (line) {
        setLines((prev) => [...prev, line]);
        const drawLineCommand = new DrawLineCommand(line, setLines);
        setUndoStack((prev) => [...prev, drawLineCommand]);
        setRedoStack([]);
      }

      setLine(null);
    }

    if (selectedShape === "circle") {
      setIsEllisping(false);

      if (ellipse) {
        setEllipses((prev) => [...prev, ellipse]);
        const drawEllipseCommand = new DrawEllipseCommand(ellipse, setEllipses);
        setUndoStack((prev) => [...prev, drawEllipseCommand]);
        setRedoStack([]);
      }

      setEllipseRaw(null);
      setEllipse(null);
    }
  }

  async function handleNewRoom(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (currentUser) {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: currentUser.userId,
        }),
      };

      const res = await fetch(
        `${import.meta.env.VITE_SOCKET_SERVER_ADDRESS}/room`,
        options
      );
      const data = await res.json();

      const params = new URLSearchParams();
      const newRoomId = data.roomId;
      params.set("room", newRoomId);
      setSearchParams(params);

      setIsNewRoomModalOpen(true);
    }
  }

  async function handleSaveBoard() {
    // if (!currentUser || currentUser.role !== "owner" || !roomId) return;
    if (!currentUser || currentUser.role !== "owner") return;

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        ownerId: currentUser.userId,
        boardLines: lines,
      }),
    };

    const res = await fetch(
      `${import.meta.env.VITE_SOCKET_SERVER_ADDRESS}/roomsave`,
      options
    );

    const data = await res.json();
    if (data) {
      toast.success("Board content is saved.");
    }
  }

  return (
    <>
      <Toaster />
      <ShapeSelectorBar />
      <Palette />
      {currentUser &&
        otherUserCursors.length !== 0 &&
        otherUserCursors.map((userCursor) => {
          const { coord, userName } = userCursor;
          if (currentUser.userId !== userCursor.userId) {
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

      {currentUser && currentUser.role === "owner" && roomId && (
        <ThemeButton
          positionCss="absolute right-40 top-5"
          buttonName="Save"
          onClick={handleSaveBoard}
        />
      )}

      {!roomId && currentUser && currentUser.role === "owner" && (
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
          {lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              draggable={selectedShape === "cursor"}
            />
          ))}
          {ellipses.map((ellipse) => (
            <Ellipse
              x={ellipse.x}
              y={ellipse.y}
              radiusX={ellipse.radiusX}
              radiusY={ellipse.radiusY}
              stroke={ellipse.stroke}
              strokeWidth={ellipse.strokeWidth}
              draggable={selectedShape === "cursor"}
            />
          ))}
          {isDrawing && (
            <Line
              points={line?.points}
              stroke={selectedColor}
              strokeWidth={selectedColor === "white" ? 40 : 4}
            />
          )}
          {isEllisping && ellipse && (
            <Ellipse
              x={ellipse.x}
              y={ellipse.y}
              radiusX={ellipse.radiusX}
              radiusY={ellipse.radiusY}
              stroke={ellipse.stroke}
              strokeWidth={ellipse.strokeWidth}
            />
          )}
        </Layer>
      </Stage>
    </>
  );
}

export default App;
