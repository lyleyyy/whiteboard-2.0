import ModalContainer from "../UI/ModalContainer";
import { useState, type FormEvent } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import baseUrl from "../utils/baseUrl";

function LoginModal() {
  const { setCurrentUser } = useCurrentUser();
  const [isLoggin, setIsLoggin] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoggin(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    };

    const res = await fetch(`${baseUrl}/user`, options);
    const data = await res.json();

    const user = data.data;
    setCurrentUser(user);
    setIsLoggin(false);
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
        {!isLoggin && (
          <input
            name="username"
            className="w-full p-3 border-2 border-purple-300 rounded-md text-gray-800 
          placeholder-gray-400 focus:outline-none focus:border-purple-500
            transition duration-200 ease-in-out
          "
            type="text"
            placeholder="Input your nick name..."
            maxLength={6}
            disabled={isLoggin}
            required
          />
        )}

        <button
          className="mt-4 w-full py-3 bg-purple-600 text-white text-xl font-bold rounded-md shadow-lg hover:shadow-xl hover:bg-purple-500 active:scale-95 transition duration-250 ease-in-out disabled:bg-gray-500
        "
          type="submit"
          disabled={isLoggin}
        >
          {isLoggin ? "Loading..." : "Start"}
        </button>
      </form>
    </ModalContainer>
  );
}

export default LoginModal;
