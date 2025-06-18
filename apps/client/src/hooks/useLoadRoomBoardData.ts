import { useEffect } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import baseUrl from "../utils/baseUrl";
import type { LineInterface } from "../types/LineInterface";
import type { EllipseInterface } from "../types/EllipseInterface";

function useLoadRoomBoardData(
  roomId: string | null,
  setLines: React.Dispatch<React.SetStateAction<LineInterface[]>>,
  setEllipses: React.Dispatch<React.SetStateAction<EllipseInterface[]>>
) {
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    async function getRoomData() {
      if (!roomId || !currentUser) return;

      const params = new URLSearchParams({
        roomId,
      });

      const url = `${baseUrl}/room?${params.toString()}`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const res = await fetch(url, options);
      const data = await res.json();

      if (data) setLines(data.room.stage_lines);
      if (data) setEllipses(data.room.stage_ellipses);
    }

    if (roomId) getRoomData();
  }, [roomId, currentUser, setLines, setEllipses]);
}

export default useLoadRoomBoardData;
