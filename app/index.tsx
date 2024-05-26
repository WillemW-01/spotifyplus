import React, { useState } from "react";
import { View, Button, Alert, Text } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";

import { PlaybackStateResponse } from "@/interfaces/player.me";

const uri = makeRedirectUri();
console.log(uri);

const config = {
  clientId: "c5ef878ae61046f0a713956f9dbd9377",
  clientSecret: "10e897807c2c44989f6794ca1af7df5b",
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

export default function App() {
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const [authorized, setAuthorized] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [token, setToken] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [curr, setCurr] = useState({
    title: "",
    artist: "",
  });

  const getPlayBackState = async () => {
    if (!authorized) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      Alert.alert("Success", "Playback started");

      console.log(response);
      const data: PlaybackStateResponse = await response.json();
      setIsPlaying(Boolean(data.is_playing));
      setCurr({ title: data.item.name, artist: data.item.artists[0].name });
      console.log(`Is playing: `, data.is_playing);
      console.log(`Song name: `, data.item.name);
      console.log(`Artist: `, data.item.artists[0].name);
    } catch (error) {
      Alert.alert("Playback error", (error as Error).message);
    }
  };

  async function getToken(code: string) {
    console.log(`Getting access token with auth code: ${code.slice(0, 20)}...`);

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

      setAuthorized(true);
      setAuthCode(code);

      getToken(code);
    }
  }, [response]);

  return (
    <View>
      <Button
        disabled={!request}
        title="Login"
        onPress={() => {
          promptAsync();
        }}
      />
      <Button
        title="Get playback state"
        onPress={getPlayBackState}
        disabled={!authorized}
      />

      <Text>Is playing? {isPlaying}</Text>
      {isPlaying && (
        <View>
          <Text>Song: {curr.title}</Text>
          <Text>Artist: {curr.artist}</Text>
        </View>
      )}
    </View>
  );
}
