import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSpotifyAuth from "./useSpotifyAuth";

// Define the shape of our context
interface AuthContextData {
  token: string | null;
  refreshToken: string | null;
  setToken: (newAccessToken: string, newRefreshToken?: string) => void;
  clearToken: () => void;
  shouldRefresh: () => Promise<boolean>;
}

const keys = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  TIMESTAMP: "timeStamp",
};

const THRESHOLD = 600 / 60; // threshold time of 60 minutes ~ 1 hour

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [timeStamp, setTimeStamp] = useState<string | null>(null);

  // const { refreshAccessToken } = useSpotifyAuth();

  const setToken = async (newAccessToken: string, newRefreshToken?: string) => {
    console.log("Setting new tokens!");
    const currentTime = String(new Date().getTime());
    await AsyncStorage.setItem(keys.TIMESTAMP, currentTime);
    setTimeStamp(currentTime);

    await AsyncStorage.setItem(keys.ACCESS_TOKEN, newAccessToken);
    console.log("Set new access token: ", newAccessToken.slice(0, 20));
    setTokenState(newAccessToken);

    if (newRefreshToken) {
      await AsyncStorage.setItem(keys.REFRESH_TOKEN, newRefreshToken);
      console.log("Set new refresh token: ", newAccessToken.slice(0, 20));
      setRefreshToken(newRefreshToken);
    }
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem(keys.ACCESS_TOKEN);
    await AsyncStorage.removeItem(keys.REFRESH_TOKEN);
    await AsyncStorage.removeItem(keys.TIMESTAMP);
    setTokenState(null);
    setRefreshToken(null);
    setTimeStamp(null);
  };

  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem(keys.ACCESS_TOKEN);
    const storedRefreshToken = await AsyncStorage.getItem(keys.REFRESH_TOKEN);
    // const storedTimestamp = await AsyncStorage.getItem(keys.TIMESTAMP);
    const now = new Date();
    now.setTime(now.getMinutes() - 30);
    const storedTimestamp = String(now.getTime());

    if (storedToken && storedRefreshToken && storedTimestamp) {
      console.log("Successfully loaded tokens and timestamp:");
      console.log(`\tToken    : ${storedToken.slice(0, 15)}`);
      console.log(`\tRefresh  : ${storedRefreshToken.slice(0, 15)}`);
      console.log(`\tTimestamp: ${storedTimestamp}`);

      if (await shouldRefresh(Number(storedTimestamp))) {
        console.log("Token needs to be refreshed. Only setting refresh token");
        setRefreshToken(storedRefreshToken);

        return;
      } else {
        console.log("Token doesn't need to be refreshed");
      }

      console.log("Setting tokens to stored state");
      setTokenState(storedToken);
      setRefreshToken(storedRefreshToken);
      setTimeStamp(timeStamp);
    } else {
      console.log("Nothing to load from async storage");
    }
  };

  const shouldRefresh = async (givenTime?: number): Promise<boolean> => {
    const now = new Date().getTime();
    const then = givenTime
      ? givenTime
      : Number(await AsyncStorage.getItem(keys.TIMESTAMP));
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
