import { useEffect, useState } from "react";
import { Stage, Layer, Line, Ellipse, Rect } from "react-konva";
import { NavLink, useSearchParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import { PiCursorClickDuotone } from "react-icons/pi";
import { socket } from "./lib/socketClient.ts";
import ThemeButton from "./components/ThemeButton.tsx";
import NewRoomModal from "./components/NewRoomModal.tsx";
import SecondaryButton from "./components/SecondaryButton.tsx";
import ShapeSelectorBar from "./components/ShapeSelectorBar.tsx";
import Palette from "./components/Palette.tsx";
import { DrawLineCommand } from "./commands/DrawLineCommand.ts";
import type { DrawCommand } from "./commands/types";
import type { LineInterface } from "./types/LineInterface.ts";
import type { KonvaEventObject } from "konva/lib/Node";
import type { UserCursor } from "./types/UserCursor.ts";
import type { EllipseRawInterface } from "./types/EllipseRawInterface.ts";
import type { EllipseInterface } from "./types/EllipseInterface.ts";
import ellipseParametersCalculator from "./utils/ellipseParametersCalculator.ts";
import { DrawEllipseCommand } from "./commands/DrawEllipseCommand.ts";
import UserDisplayer from "./components/UserDisplayer.tsx";
import type { RectRawInterface } from "./types/RectRawInterface.ts";
import rectParametersCalculator from "./utils/rectParametersCalculator.ts";
import type { RectInterface } from "./types/RectInterface.ts";
import { useCurrentUser } from "./contexts/CurrentUserContext.tsx";
import LoginModal from "./components/LoginModal.tsx";
import { useDrawingSelector } from "./contexts/DrawingSelectorContext.tsx";

const baseUrl =
  import.meta.env.PRODUCTION === "1"
    ? import.meta.env.VITE_SOCKET_SERVER_ADDRESS_PRODUCTION
    : import.meta.env.VITE_SOCKET_SERVER_ADDRESS_DEV;

function App() {
  const { currentUser } = useCurrentUser();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEllisping, setIsEllisping] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [rectRaw, setRectRaw] = useState<RectRawInterface | null>(null);
  const [selectingRect, setSelectingRect] = useState<RectInterface | null>(
    null
  );
  const [line, setLine] = useState<LineInterface | null>(null);
  const [lines, setLines] = useState<LineInterface[]>([]);
  const [ellipseRaw, setEllipseRaw] = useState<EllipseRawInterface | null>(
    null
  );
  const [ellipse, setEllipse] = useState<EllipseInterface | null>(null);
  const [ellipses, setEllipses] = useState<EllipseInterface[]>([]);
  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);
  const [undoStack, setUndoStack] = useState<DrawCommand[]>([]);
  const [redoStack, setRedoStack] = useState<DrawCommand[]>([]);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const { selectedShape, selectedColor, setSelectedColor } =
    useDrawingSelector();
  const roomId = searchParams.get("room");

  // if current user is owner
  useEffect(() => {
    async function getRoom() {
      if (!roomId || !currentUser) return;

      console.log(currentUser);
      const params = new URLSearchParams({
        userId: currentUser.id,
      });

      const url = `${baseUrl}/room?${params.toString()}`;

      const options = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };

      const res = await fetch(url, options);
      const data = await res.json();

      if (data.roomId === roomId) setIsRoomOwner(true);
    }

    getRoom();
  }, [roomId, currentUser]);

  // load room board saved status
  useEffect(() => {
    async function getRoomData() {
      if (!roomId || !currentUser) return;

      const params = new URLSearchParams({
        roomId,
        // ownerId: currentUser.id,
      });

      const url = `${baseUrl}/roomdata?${params.toString()}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await fetch(url, options);
      const data = await res.json();

      if (data) setLines(data.stage_lines);
      if (data) setEllipses(data.stage_ellipses);
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
      if (data.userId === currentUser.id) return;

      if (data.type === "draw") {
        if (data.shape === "line") {
          const { line } = data;
          setLines((prev) => [
            ...prev.filter((drawedLine) => drawedLine.id !== line.id),
            line,
          ]);
        }

        if (data.shape === "ellipse") {
          const { ellipse } = data;
          setEllipses((prev) => [
            ...prev.filter((drawedEllipse) => drawedEllipse.id !== ellipse.id),
            ellipse,
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
  }, [roomId, currentUser]);

  function handleMouseDown(e: KonvaEventObject<PointerEvent>) {
    if (e.evt.button === 0) {
      const newCoord = e.target.getStage()!.getPointerPosition()!;
      if (selectedShape === "pencil") setIsDrawing(true);
      if (selectedShape === "eraser") {
        setIsDrawing(true);
        setSelectedColor("white");
      }
      if (selectedShape === "circle") {
        setIsEllisping(true);

        const newEllispe = {
          startCoords: newCoord,
          endCoords: null,
        };

        setEllipseRaw(newEllispe);
      }

      if (selectedShape === "cursor") {
        setIsSelecting(true);
        setRectRaw(newCoord);
      }
    }
  }

  function handleMouseMove(e: KonvaEventObject<PointerEvent>) {
    if (!currentUser) return;

    const newCoord = e.target.getStage()?.getPointerPosition();
    if (!newCoord) return;

    // mouse move cursor
    if (roomId) {
      socket.emit("cursormove", {
        newCoord,
        roomId,
        userId: currentUser.id,
        userName: currentUser.user_name,
      });
    }

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
          userId: currentUser.id,
        });
      }
      // throttledEmit(newLine);
    }

    if (isEllisping) {
      setEllipseRaw((prev) => {
        if (!prev) return null;
        return { startCoords: prev.startCoords, endCoords: newCoord };
      });

      if (!ellipseRaw || !ellipseRaw.endCoords) return;
      const { startCoords, endCoords } = ellipseRaw;

      const data = ellipseParametersCalculator(startCoords, endCoords);

      const newEllipse = {
        ...data,
        id: ellipse?.id || uuidv4(),
        stroke: selectedColor,
        strokeWidth: 2,
      };

      setEllipse(newEllipse);

      if (roomId) {
        socket.emit("command", {
          type: "draw",
          shape: "ellipse",
          ellipse: newEllipse,
          roomId,
          userId: currentUser.id,
        });
      }
    }

    if (isSelecting) {
      if (!rectRaw) return;
      const { width, height } = rectParametersCalculator(rectRaw, newCoord);

      const newRect = {
        id: uuidv4(),
        x: rectRaw.x,
        y: rectRaw.y,
        width,
        height,
      };

      setSelectingRect(newRect);
    }
  }

  function handleMouseUp() {
    if (selectedShape === "pencil" || selectedShape === "eraser") {
      setIsDrawing(false);
      // setIsEarsing(false);
      if (line) {
        setLines((prev) => [...(prev ?? []), line]);
        const drawLineCommand = new DrawLineCommand(line, setLines);
        setUndoStack((prev) => [...prev, drawLineCommand]);
        setRedoStack([]);
      }

      setLine(null);
    }

    if (selectedShape === "circle") {
      setIsEllisping(false);

      if (ellipse) {
        setEllipses((prev) => [...(prev ?? []), ellipse]);
        const drawEllipseCommand = new DrawEllipseCommand(ellipse, setEllipses);
        setUndoStack((prev) => [...prev, drawEllipseCommand]);
        setRedoStack([]);
      }

      setEllipseRaw(null);
      setEllipse(null);
    }

    if (selectedShape === "cursor") {
      setRectRaw(null);
      setSelectingRect(null);
    }
  }

  async function handleNewRoom(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (currentUser) {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: currentUser.id,
        }),
      };

      const res = await fetch(`${baseUrl}/room`, options);
      const data = await res.json();

      const params = new URLSearchParams();
      const newRoomId = data.roomId;
      params.set("room", newRoomId);
      setSearchParams(params);

      setIsNewRoomModalOpen(true);
    }
  }

  async function handleSaveBoard() {
    if (!currentUser || !isRoomOwner) return;

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        ownerId: currentUser.id,
        boardLines: lines,
        boardEllipses: ellipses,
      }),
    };

    const res = await fetch(`${baseUrl}/roomsave`, options);

    const data = await res.json();
    if (data) {
      toast.success("Board content is saved.");
    }
  }

  function handleLeaveRoom() {
    setLines([]);
    setEllipses([]);
  }

  function handleSelectShape(shapeId: string) {
    console.log(shapeId);
    setSelectedShapeIds([shapeId]);
  }

  return (
    <>
      <Toaster />
      <ShapeSelectorBar />
      <Palette />
      {currentUser && <UserDisplayer username={currentUser.user_name} />}
      {!currentUser && <LoginModal />}

      {roomId &&
        currentUser &&
        otherUserCursors.length > 0 &&
        otherUserCursors.map((userCursor) => {
          const { coord, userName } = userCursor;
          if (currentUser.id !== userCursor.userId) {
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

      {currentUser && roomId && isRoomOwner && (
        <ThemeButton
          positionCss="absolute right-40 top-5"
          buttonName="Save"
          onClick={handleSaveBoard}
        />
      )}

      {!roomId && currentUser && (
        <ThemeButton
          positionCss="absolute right-5 top-5"
          buttonName="Share"
          onClick={(e) => handleNewRoom(e)}
        />
      )}

      {roomId && currentUser && (
        <NavLink to="/">
          <SecondaryButton
            positionCss="absolute right-5 top-5"
            buttonName="Leave Room"
            onClick={handleLeaveRoom}
          />
        </NavLink>
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onPointerDown={handleMouseDown}
        onPointerUp={handleMouseUp}
        onPointerMove={handleMouseMove}
      >
        <Layer>
          {ellipses &&
            ellipses.map((ellipse) => (
              <Ellipse
                key={ellipse.id}
                x={ellipse.x}
                y={ellipse.y}
                radiusX={ellipse.radiusX}
                radiusY={ellipse.radiusY}
                stroke={ellipse.stroke}
                strokeWidth={ellipse.strokeWidth}
              />
            ))}

          {lines &&
            lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                onClick={() => handleSelectShape(line.id)}
              />
            ))}

          {isEllisping && ellipse && (
            <Ellipse
              x={ellipse.x}
              y={ellipse.y}
              radiusX={ellipse.radiusX}
              radiusY={ellipse.radiusY}
              stroke={ellipse.stroke}
              strokeWidth={ellipse.strokeWidth}
              onClick={() => handleSelectShape(ellipse.id)}
            />
          )}

          {isDrawing && (
            <Line
              points={line?.points}
              stroke={selectedColor}
              strokeWidth={selectedColor === "white" ? 40 : 4}
            />
          )}

          {isSelecting && selectingRect && (
            <Rect
              x={selectingRect.x}
              y={selectingRect.y}
              width={selectingRect.width}
              height={selectingRect.height}
              fill="rgba(108, 92, 231, 0.1)"
              stroke="#6c5ce7"
              strokeWidth={1}
            />
          )}
        </Layer>
      </Stage>
    </>
  );
}

export default App;
