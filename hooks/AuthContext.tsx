import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AuthRequest,
  AuthSessionResult,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";

// Define the shape of our context
interface AuthContextData {
  token: string | null;
  refreshToken: string | null;
  setToken: (newAccessToken: string, newRefreshToken?: string) => void;
  clearToken: () => void;
  shouldRefresh: () => Promise<boolean>;
  request: AuthRequest | null;
  promptAsync: () => Promise<AuthSessionResult>;
  refreshAccessToken: (token: string) => Promise<void>;
  authorized: boolean;
}

const keys = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  TIMESTAMP: "timeStamp",
};

const THRESHOLD = 600 / 60; // threshold time of 60 minutes ~ 1 hour

const uri = makeRedirectUri();
console.log(uri);

const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET ?? "";

interface AccessResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

const authConfig = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: uri,
  usePKCE: false,
  scopes: [
    "playlist-modify-public",
    "playlist-read-collaborative",
    "playlist-read-private",
    "user-modify-playback-state",
    "user-read-email",
    "user-read-playback-state",
    "user-read-private",
    "user-read-recently-played",
    "user-top-read",
  ],
};

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const tokenRequestOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [timeStamp, setTimeStamp] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const isRefreshing = useRef(false);

  const [request, response, promptAsync] = useAuthRequest(
    authConfig,
    discovery
  );

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
    const storedTimestamp = await AsyncStorage.getItem(keys.TIMESTAMP);

    if (storedToken && storedRefreshToken && storedTimestamp) {
      console.log("Successfully loaded tokens and timestamp:");
      console.log(`\tToken    : ${storedToken.slice(0, 15)}`);
      console.log(`\tRefresh  : ${storedRefreshToken.slice(0, 15)}`);
      console.log(`\tTimestamp: ${storedTimestamp}`);

      if (await shouldRefresh(Number(storedTimestamp))) {
        console.log("Token needs to be refreshed. Only setting refresh token");
        // setRefreshToken(storedRefreshToken);
        await refreshAccessToken(storedRefreshToken);
        setAuthorized(true);
      } else {
        console.log(
          "Token doesn't need to be refreshed Setting tokens to stored state"
        );
        setTokenState(storedToken);
        setRefreshToken(storedRefreshToken);
        setTimeStamp(timeStamp);
        setAuthorized(true);
      }
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

    console.log(
      `Checking token validity: diff: ${(diff / 60000).toFixed(
        1
      )} mins, threshold: ${THRESHOLD}mins`
    );

    // returns if the dif is more than 60 minutes / 3600 seconds
    return diff / 60000 > THRESHOLD;
  };

  const getAuthRequest = async (requestBody: string) => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      ...tokenRequestOptions,
      body: requestBody,
    });

    if (!response.ok) {
      console.log("Auth request was not successful.");
      const error = await response.json();
      console.log(error);
    }

    return response;
  };

  const getToken = async (code: string) => {
    console.log(`Getting access token with auth code: ${code.slice(0, 20)}...`);

    let requestBody = `grant_type=authorization_code`;
    requestBody += `&code=${code}`;
    requestBody += `&redirect_uri=${encodeURIComponent(uri)}`;
    requestBody += `&client_id=${CLIENT_ID}`;
    requestBody += `&client_secret=${CLIENT_SECRET}`;

    const tokenResponse = await getAuthRequest(requestBody);
    const tokenData: AccessResponse = await tokenResponse.json();

    const accessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token;

    console.log(`Access token: ${accessToken.slice(0, 20)}...`);
    console.log(`Refresh token: ${newRefreshToken.slice(0, 20)}...`);
    setToken(accessToken, newRefreshToken);
  };

  const refreshAccessToken = async (token: string) => {
    try {
      if (isRefreshing.current) {
        console.log("Already getting new access token. Ignoring.");
        return;
      }

      isRefreshing.current = true;

      console.log(
        `Getting new access token with refresh token: ${token.slice(0, 20)}...`
      );

      let requestBody = `grant_type=refresh_token`;
      requestBody += `&refresh_token=${token}`;
      requestBody += `&client_id=${CLIENT_ID}`;
      requestBody += `&client_secret=${CLIENT_SECRET}`;
      // console.log(requestBody);

      const tokenResponse = await getAuthRequest(requestBody);
      const tokenData: AccessResponse = await tokenResponse.json();

      const accessToken = tokenData.access_token;

      console.log(`Access token: ${accessToken.slice(0, 20)}...`);
      await setToken(accessToken);
    } catch (error: unknown) {
      console.log("Error when getting new token: ", error);
    }
  };

  useEffect(() => {
    if (response?.type === "success" && !token) {
      const { code } = response.params;
      getToken(code);
    }
  }, [response]);

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
        request,
        promptAsync,
        refreshAccessToken,
        authorized,
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
