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
    console.log(tokenData);

    const accessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token;

    console.log(`Access token: ${accessToken.slice(0, 20)}...`);
    console.log(`Refresh token: ${newRefreshToken.slice(0, 20)}...`);
    setToken(accessToken, newRefreshToken);
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

      if (!tokenResponse.ok) {
        console.log("Couldn't get new access token! ", tokenResponse.status);
        return;
      }

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
    if (token && refreshToken) {
      const needNew = await shouldRefresh();
      console.log("Need to refresh token: ", needNew);
      if (needNew) {
        refreshAccessToken(refreshToken);
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
  }, [token, refreshToken]);

  return {
    request,
    promptAsync,
    refreshAccessToken,
  };
}
