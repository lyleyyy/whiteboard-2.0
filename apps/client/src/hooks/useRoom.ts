import { useEffect, useState } from "react";
import type { User } from "../types/User";
import { useSearchParams } from "react-router";
import { socket } from "../lib/socketClient";
import baseUrl from "../utils/baseUrl";

function useRoom(currentUser: User | null) {
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("room");

  // if there is params of roomId in the url, join the room
  useEffect(() => {
    if (searchParams) {
      socket.emit("joinroom", roomId);
    }
  }, [searchParams, roomId]);

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

      if (data.room.id === roomId) setIsRoomOwner(true);
    }

    getRoom();
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

  return {
    roomId,
    isNewRoomModalOpen,
    setIsNewRoomModalOpen,
    isRoomOwner,
    handleNewRoom,
    searchParams,
  };
}

export default useRoom;
