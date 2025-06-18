import { useNavigate } from "react-router";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import type { LineInterface } from "../types/LineInterface";
import type { EllipseInterface } from "../types/EllipseInterface";
import type { TextInterface } from "../types/TextInterface";

interface UserDisplayerProps {
  setLines: React.Dispatch<React.SetStateAction<LineInterface[]>>;
  setEllipses: React.Dispatch<React.SetStateAction<EllipseInterface[]>>;
  setTexts: React.Dispatch<React.SetStateAction<TextInterface[]>>;
}

function UserDisplayer({
  setLines,
  setEllipses,
  setTexts,
}: UserDisplayerProps) {
  const { currentUser, setCurrentUser } = useCurrentUser();
  const navigate = useNavigate();

  function handleLogout() {
    setCurrentUser(null);
    setLines([]);
    setEllipses([]);
    setTexts([]);
    navigate("/");
  }

  return (
    <div className="absolute right-5 bottom-5" onClick={handleLogout}>
      <div
        className="
        w-16 h-16 rounded-full
        bg-blue-500 text-white
        flex items-center justify-center
        shadow-md
        hover:bg-blue-600
        transition-colors duration-200
        cursor-pointer
        text-sm font-semibold
        overflow-hidden
        group
        relative
      "
      >
        <span
          className="
          absolute inset-0 /* 簡化定位和尺寸 */
          flex items-center justify-center
          transition-all duration-200 ease-out /* 簡化過渡時間 */
          group-hover:scale-0 group-hover:opacity-0
          px-2 overflow-hidden text-ellipsis
        "
        >
          {currentUser?.user_name}
        </span>

        <span
          className="
          absolute inset-0
          flex items-center justify-center
          transition-all duration-200 ease-out
          scale-0 opacity-0
          group-hover:scale-100 group-hover:opacity-100
          px-2 overflow-hidden text-ellipsis
        "
        >
          Logout
        </span>
      </div>
    </div>
  );
}

export default UserDisplayer;
