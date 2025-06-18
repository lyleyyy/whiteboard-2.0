import { NavLink } from "react-router";
import { Toaster } from "react-hot-toast";
import ThemeButton from "./components/ThemeButton.tsx";
import NewRoomModal from "./components/NewRoomModal.tsx";
import SecondaryButton from "./components/SecondaryButton.tsx";
import ShapeSelectorBar from "./components/ShapeSelectorBar.tsx";
import Palette from "./components/Palette.tsx";
import UserDisplayer from "./components/UserDisplayer.tsx";
import { useCurrentUser } from "./contexts/CurrentUserContext.tsx";
import LoginModal from "./components/LoginModal.tsx";
import useDrawing from "./hooks/useDrawing.ts";
import useRoom from "./hooks/useRoom.ts";
import WhiteBoardStage from "./components/WhiteBoardStage.tsx";
import OtherUserCursorsDisplayer from "./components/OtherUserCursorsDisplayer.tsx";
import { useEffect } from "react";
import useUndoRedo from "./hooks/useUndoRedo.ts";
import useTextInput from "./hooks/useTextInput.ts";

function App() {
  const { currentUser } = useCurrentUser();
  const {
    openTextArea,
    textAreaCoord,
    Texts,
    handleDblClick,
    handleTextSubmit,
  } = useTextInput();
  // const [selectCoord, setSelectCoord] = useState<{
  //   x: number;
  //   y: number;
  // } | null>(null);

  const {
    roomId,
    isNewRoomModalOpen,
    setIsNewRoomModalOpen,
    isRoomOwner,
    handleNewRoom,
  } = useRoom();

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
    otherUserCursors,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSaveBoard,
    handleClearBoard,
  } = useDrawing(roomId, currentUser, isRoomOwner);

  const { undoRedo } = useUndoRedo(roomId);

  useEffect(() => {
    window.addEventListener("keydown", undoRedo);

    return () => {
      window.removeEventListener("keydown", undoRedo);
    };
  }, [undoRedo]);

  // function handleCursorMove(e: KonvaEventObject<MouseEvent>) {
  //   if (selectedShape !== "cursor") return;
  //   const hoveredNode = e.target;

  //   const isHoveringShapeObj =
  //     hoveredNode.getClassName() === "Line" ||
  //     hoveredNode.getClassName() === "Ellipse";

  //   if (isHoveringShapeObj) {
  //     const cursorCoord = e.target.getStage()?.getPointerPosition();
  //     setSelectCoord(cursorCoord as { x: number; y: number });
  //     document.body.style.cursor = "none";
  //   } else {
  //     setSelectCoord(null);
  //     document.body.style.cursor = "default";
  //   }
  // }

  function handleSelectShape(shapeId: string) {
    console.log(shapeId);
    // setSelectedShapeIds([shapeId]);
  }

  return (
    <>
      <Toaster />
      <ShapeSelectorBar />
      <Palette />
      {!currentUser && <LoginModal />}

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
            onClick={handleClearBoard}
          />
        </NavLink>
      )}

      <WhiteBoardStage
        isDrawing={isDrawing}
        line={line}
        lines={lines}
        isEllisping={isEllisping}
        ellipse={ellipse}
        ellipses={ellipses}
        isSelecting={isSelecting}
        selectingRect={selectingRect}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        handleSelectShape={handleSelectShape}
        // handleCursorMove={handleCursorMove}
        handleDblClick={handleDblClick}
        Texts={Texts}
      />

      {roomId && currentUser && otherUserCursors.length > 0 && (
        <OtherUserCursorsDisplayer
          currentUser={currentUser}
          otherUserCursors={otherUserCursors}
        />
      )}

      {currentUser && (
        <UserDisplayer setLines={setLines} setEllipses={setEllipses} />
      )}

      {openTextArea && textAreaCoord && (
        <input
          style={{
            position: "absolute",
            left: `${textAreaCoord.x}px`,
            top: `${textAreaCoord.y}px`,
          }}
          autoFocus
          className="text-black focus: outline-none"
          onBlur={(e) => handleTextSubmit(e)}
        />
      )}

      {/* {selectCoord && (
        <span
          className={`absolute flex -translate-1/2`}
          style={{
            left: `${selectCoord.x}px`,
            top: `${selectCoord.y}px`,
          }}
        >
          <FaArrowsAlt />
        </span>
      )} */}
    </>
  );
}

export default App;
