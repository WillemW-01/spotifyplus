import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the shape of our context
interface AuthContextData {
  token: string | null;
  refreshToken: string | null;
  authorized: boolean;
  setToken: (newAccessToken: string, newRefreshToken?: string) => void;
  clearToken: () => void;
  shouldRefresh: () => Promise<boolean>;
}

const keys = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  TIMESTAMP: "timeStamp",
};

const THRESHOLD = 3600 / 60; // threshold time of 60 minutes ~ 1 hour

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [timeStamp, setTimeStamp] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const setToken = async (newAccessToken: string, newRefreshToken?: string) => {
    console.log("Getting new tokens!");
    const currentTime = String(new Date().getTime());
    await AsyncStorage.setItem(keys.TIMESTAMP, currentTime);
    setTimeStamp(currentTime);

    await AsyncStorage.setItem(keys.ACCESS_TOKEN, newAccessToken);
    setTokenState(newAccessToken);

    if (newRefreshToken) {
      await AsyncStorage.setItem(keys.REFRESH_TOKEN, newRefreshToken);
      setRefreshToken(newRefreshToken);
    }
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem(keys.ACCESS_TOKEN);
    setTokenState(null);
  };

  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem(keys.ACCESS_TOKEN);
    const storedRefreshToken = await AsyncStorage.getItem(keys.REFRESH_TOKEN);
    const storedTimestamp = await AsyncStorage.getItem(keys.TIMESTAMP);

    if (storedToken && storedRefreshToken && storedTimestamp) {
      console.log("Successfully loaded tokens and timestamp:");
      console.log(`\tToken    : ${storedToken.slice(0, 15)}`);
      console.log(`\tRefresh  : ${storedRefreshToken.slice(0, 15)}`);
      console.log(`\tTimestamp: ${storedTimestamp}`);
      setTokenState(storedToken);
      setRefreshToken(storedRefreshToken);
      setTimeStamp(timeStamp);
      setAuthorized(true);
    }
  };

  const shouldRefresh = async (): Promise<boolean> => {
    const now = new Date().getTime();
    const then = Number(await AsyncStorage.getItem(keys.TIMESTAMP));
    const diff = now - then;

    console.log(`Now: ${now}, Then: ${then}`);
    console.log(
      `\tDiff: ${(diff / 60000).toFixed(1)} mins, Threshold: ${THRESHOLD}mins`
    );

    // returns if the dif is more than 60 minutes / 3600 seconds
    return diff / 60000 > THRESHOLD;
  };

  useEffect(() => {
    // Load token from AsyncStorage when the app starts
    loadToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        authorized,
        setToken,
        clearToken,
        shouldRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
