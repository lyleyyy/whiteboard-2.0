import { useEffect, useState } from "react";
import { Stage, Layer, Line, Ellipse, Rect } from "react-konva";
import { NavLink, useSearchParams } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { PiCursorClickDuotone } from "react-icons/pi";
import { socket } from "./lib/socketClient.ts";
import ThemeButton from "./components/ThemeButton.tsx";
import NewRoomModal from "./components/NewRoomModal.tsx";
import SecondaryButton from "./components/SecondaryButton.tsx";
import ShapeSelectorBar from "./components/ShapeSelectorBar.tsx";
import Palette from "./components/Palette.tsx";
import type { UserCursor } from "./types/UserCursor.ts";
import UserDisplayer from "./components/UserDisplayer.tsx";
import { useCurrentUser } from "./contexts/CurrentUserContext.tsx";
import LoginModal from "./components/LoginModal.tsx";
import useDrawing from "./hooks/useDrawing.ts";
import { useDrawingSelector } from "./contexts/DrawingSelectorContext.tsx";

const baseUrl =
  import.meta.env.PRODUCTION === "1"
    ? import.meta.env.VITE_SOCKET_SERVER_ADDRESS_PRODUCTION
    : import.meta.env.VITE_SOCKET_SERVER_ADDRESS_DEV;

function App() {
  const { currentUser } = useCurrentUser();
  const [otherUserCursors, setOtherUserCursors] = useState<UserCursor[]>([]);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  // const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const roomId = searchParams.get("room");
  const { selectedColor } = useDrawingSelector();
  const {
    isDrawing,
    line,
    lines,
    setLines,
    isEllisping,
    ellipse,
    ellipses,
    setEllipses,
    isSelecting,
    selectingRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDrawing(roomId, currentUser);

  // if current user is owner
  useEffect(() => {
    async function getRoom() {
      if (!roomId || !currentUser) return;

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
    // setSelectedShapeIds([shapeId]);
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
