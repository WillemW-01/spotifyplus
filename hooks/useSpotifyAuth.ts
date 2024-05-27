import React, { useState, useEffect } from "react";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useGlobals } from "./Globals";
import { useAuth } from "./AuthContext";

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
    "user-read-private",
    "user-read-email",
    "user-modify-playback-state",
    "user-read-playback-state",
    "playlist-modify-public",
    "user-read-recently-played",
    "playlist-read-private",
    "playlist-read-collaborative",
  ],
};

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function useSpotifyAuth() {
  const [request, response, promptAsync] = useAuthRequest(
    authConfig,
    discovery
  );
  const { token, refreshToken, setToken, shouldRefresh } = useAuth();

  const getToken = async (code: string) => {
    console.log(`Getting access token with auth code: ${code.slice(0, 20)}...`);

    let requestBody = `grant_type=authorization_code`;
    requestBody += `&code=${code}`;
    requestBody += `&redirect_uri=${encodeURIComponent(uri)}`;
    requestBody += `&client_id=${CLIENT_ID}`;
    requestBody += `&client_secret=${CLIENT_SECRET}`;

    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      }
    );

    const tokenData: AccessResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    console.log(`Access token: ${accessToken.slice(0, 20)}...`);
    console.log(`Refresh token: ${refreshToken.slice(0, 20)}...`);
    setToken(accessToken, refreshToken);
  };

  const refreshAccessToken = async (token: string) => {
    try {
      console.log(
        `Getting new access token with refresh token: ${token.slice(0, 20)}...`
      );

      let requestBody = `grant_type=refresh_token`;
      requestBody += `&refresh_token=${token}`;
      requestBody += `&client_id=${CLIENT_ID}`;
      requestBody += `&client_secret=${CLIENT_SECRET}`;
      console.log(requestBody);

      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: requestBody,
        }
      );

      const tokenData: AccessResponse = await tokenResponse.json();
      console.log(tokenData);

      const accessToken = tokenData.access_token;

      console.log(`Access token: ${accessToken.slice(0, 20)}...`);
      setToken(accessToken);
    } catch (error) {
      console.log("Error when getting new token: ", error);
    }
  };

  const handleRefreshCheck = async () => {
    if (token) {
      const needNew = await shouldRefresh();
      console.log("Checking if token needs to be refreshed: ", needNew);
      console.log(
        `checking if refresh exists: ${
          refreshToken && String(refreshToken.slice(0, 15))
        }`
      );
      if (needNew && refreshToken) {
        refreshAccessToken(refreshToken);
      } else if (needNew && !refreshToken) {
        console.error(
          "Can't get a new token because the refresh doesn't exist..."
        );
      }
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      getToken(code);
    }
  }, [response]);

  useEffect(() => {
    handleRefreshCheck();
  }, [token]);

  return {
    request,
    promptAsync,
  };
}
