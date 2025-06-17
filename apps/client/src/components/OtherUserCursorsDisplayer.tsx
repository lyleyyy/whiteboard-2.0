import type { UserCursor } from "../types/UserCursor";
import { PiCursorClickDuotone } from "react-icons/pi";
import type { User } from "../types/User";

interface OtherUserCursorsDisplayerProps {
  currentUser: User | null;
  otherUserCursors: UserCursor[];
}

function OtherUserCursorsDisplayer({
  currentUser,
  otherUserCursors,
}: OtherUserCursorsDisplayerProps) {
  return (
    <>
      {otherUserCursors.map((userCursor) => {
        const { coord, userName } = userCursor;
        if (!currentUser) return;
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
    </>
  );
}

export default OtherUserCursorsDisplayer;
