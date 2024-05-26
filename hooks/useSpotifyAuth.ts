import React, { useState } from "react";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";

const uri = makeRedirectUri();
console.log(uri);

const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET ?? "";

const config = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: uri, // e.g., 'yourapp://callback'
  usePKCE: false,
  scopes: [
    "user-read-private",
    "user-read-email",
    "user-modify-playback-state",
    "user-read-playback-state",
    "playlist-modify-public",
  ],
};

// Endpoint
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function useSpotifyAuth() {
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const [token, setToken] = useState("");

  async function getToken(code: string) {
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
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
          uri
        )}&client_id=c5ef878ae61046f0a713956f9dbd9377&client_secret=10e897807c2c44989f6794ca1af7df5b`,
      }
    );

    const tokenData = await tokenResponse.json();

    console.log(tokenData);
    const accessToken = tokenData.access_token;

    console.log(accessToken);
    setToken(accessToken);
  }

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      getToken(code);
    }
  }, [response]);

  return {
    request,
    promptAsync,
    token,
  };
}
