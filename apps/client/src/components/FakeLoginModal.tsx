import ModalContainer from "./ModalContainer";
import type { FormEvent } from "react";
import type { User } from "../types/User";

const url = `${import.meta.env.PRODUCTION === "1" ? import.meta.env.VITE_SOCKET_SERVER_ADDRESS_PRODUCTION : import.meta.env.VITE_SOCKET_SERVER_ADDRESS_DEV}/user`;

interface FakeLoginModalProps {
  setCurrentUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

function FakeLoginModal({ setCurrentUser }: FakeLoginModalProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    };

    const res = await fetch(url, options);
    const data = await res.json();

    const user = data.data;
    setCurrentUser(user);
  }

  return (
    <ModalContainer>
      <form
        className="flex flex-col w-2/3 h-2/3 justify-center items-center gap-4"
        onSubmit={handleSubmit}
      >
        <label className="text-3xl font-semibold text-gray-700 px-2">
          Nick Name
        </label>
        <input
          name="username"
          className="w-full p-3 border-2 border-purple-300 rounded-md text-gray-800 
          placeholder-gray-400 focus:outline-none focus:border-purple-500
            transition duration-200 ease-in-out
          "
          type="text"
          placeholder="Input your nick name..."
          required
        />

        <button
          className="mt-4 w-full py-3 bg-purple-600 text-white text-xl font-bold rounded-md shadow-lg hover:shadow-xl hover:bg-purple-500 active:scale-95 transition duration-250 ease-in-out
        "
          type="submit"
        >
          Start
        </button>
      </form>
    </ModalContainer>
  );
}

export default FakeLoginModal;
