import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Alert } from "react-native";
import { router } from "expo-router";

interface Error {
  error: {
    message: string;
    status: number;
  };
}

export function useRequestBuilder(usingSpotify = true) {
  const { token, refreshToken, shouldRefresh, refreshAccessToken } = useAuth();

  const catchError = async (response: Response, url: string) => {
    if (!response.ok) {
      console.log("Response came back with error code ", response.status);
      const error: Error = await response.json();
      console.log(error);
      await catchRateLimit(response, error);
      catchInvalidToken(response);
      await catchScopeError(response, error, url);
    }
  };

  const catchInvalidToken = async (response: Response) => {
    if (response.status == 401) {
      console.log(
        `Token: ${token.slice(0, 20)}, RefreshToken: ${refreshToken.slice(0, 20)}`
      );
      Alert.alert(
        "Access token expire",
        "The current token used to connect to the Spotify API expired. Please go back to the login screen, press the login button, and retry your request.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "To login",
            style: "default",
            onPress: () => router.navigate("/"),
          },
        ]
      );
    }
  };

  const catchRateLimit = async (response: Response, error: Error) => {
    if (response.status === 429) {
      console.log(response);
      console.log(JSON.stringify(response.headers.has("Retry-After")));

      Alert.alert(
        "Rate Limit",
        "The amount of requests to the Spotify API has been high recently. Try to take a break for ~10min. If you still get this after that time, take a break for the day.",
        [
          {
            text: "aww, okay.",
          },
        ]
      );
    }
  };

  const catchScopeError = async (response: Response, error: Error, url: string) => {
    if (response.status === 403) {
      console.log(response);

      if (error.error.message.includes("scope")) {
        console.error("Not authorized scope for url: ", url);
      }
    }
  };

  const buildHeader = (method: "GET" | "POST" | "PUT", localToken: string) => {
    const headers = {
      GET: {
        Authorization: `Bearer ${localToken}`,
      },
      PUT: {
        Authorization: `Bearer ${localToken}`,
        "Content-Type": "application/json",
      },
      POST: {
        Authorization: `Bearer ${localToken}`,
        "Content-Type": "application/json",
      },
    };
    return headers[method];
  };

  const checkForRefresh = async () => {
    const mustRefresh = await shouldRefresh();
    if (token && refreshToken && mustRefresh) {
      const newToken = await refreshAccessToken(refreshToken);
      console.log(`Got new token just before sending requests: ${newToken.slice(0, 20)}`);
    } else return token;
  };

  const build = async (method: "GET" | "POST" | "PUT", url: string, body?: unknown) => {
    const tokenToUse = usingSpotify ? await checkForRefresh() : token;
    const response = await fetch(url, {
      method: method,
      headers: buildHeader(method, tokenToUse),
      body: body ? JSON.stringify(body) : undefined,
    });
    await catchError(response, url);
    return response;
  };

  const buildGet = async (url: string): Promise<Response> => {
    return await build("GET", url);
  };

  const buildPost = async (url: string) => {
    return await build("POST", url);
  };

  const buildPut = async (url: string, body: unknown): Promise<Response> => {
    return await build("PUT", url, body);
  };

  return {
    buildGet,
    buildPost,
    buildPut,
  };
}
