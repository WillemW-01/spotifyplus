import React, { ReactNode, createContext, FC, useContext } from "react";

interface GlobalsContextType {
  // token: string;
  // setToken: Dispatch<SetStateAction<string>>;
  // authorized: boolean;
}

// Create the context with a default value
export const Globals = createContext<GlobalsContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: FC<GlobalProviderProps> = ({ children }) => {
  return <Globals.Provider value={{}}>{children}</Globals.Provider>;
};

export const useGlobals = () => {
  const context = useContext(Globals);
  if (!context) {
    throw new Error("useGlobals must be used within a GlobalProvider");
  }
  return context;
};
