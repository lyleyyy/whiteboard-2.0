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

const baseUrl =
  import.meta.env.PRODUCTION === "1"
    ? import.meta.env.VITE_SOCKET_SERVER_ADDRESS_PRODUCTION
    : import.meta.env.VITE_SOCKET_SERVER_ADDRESS_DEV;

function App() {
  const { currentUser } = useCurrentUser();
  // const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const {
    roomId,
    isNewRoomModalOpen,
    setIsNewRoomModalOpen,
    isRoomOwner,
    handleNewRoom,
  } = useRoom(currentUser, baseUrl);

  const {
    isDrawing,
    line,
    lines,
    isEllisping,
    ellipse,
    ellipses,
    isSelecting,
    selectingRect,
    otherUserCursors,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSaveBoard,
    handleClearBoard,
  } = useDrawing(roomId, currentUser, baseUrl, isRoomOwner);

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
      />

      {roomId && currentUser && otherUserCursors.length > 0 && (
        <OtherUserCursorsDisplayer
          currentUser={currentUser}
          otherUserCursors={otherUserCursors}
        />
      )}

      {currentUser && <UserDisplayer username={currentUser.user_name} />}
    </>
  );
}

export default App;
