import { createContext, useContext, useState } from "react";
import type { User } from "../types/User";

interface CurrentUserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined
);

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

function CurrentUserProvider({ children }: CurrentUserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

function useCurrentUser(): CurrentUserContextType {
  const context = useContext(CurrentUserContext);
  if (context === undefined)
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");

  return context;
}

/* eslint-disable react-refresh/only-export-components */
export { CurrentUserProvider, useCurrentUser };
