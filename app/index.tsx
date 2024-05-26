import React, { useEffect, useState } from "react";
import { View, Button, Alert, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import useSpotifyAuth from "@/hooks/useSpotifyAuth";
import { useGlobals } from "@/hooks/Globals";

export default function App() {
  const { request, promptAsync, token } = useSpotifyAuth();
  const { setToken } = useGlobals();

  useEffect(() => {
    if (token) {
      console.log(`Token was updated: ${token.slice(0, 20)}...`);
      setToken(token);
      router.navigate("/home");
      console.log("Running this");
    }
  }, [token]);

  return (
    <SafeAreaView>
      <View>
        <Button
          disabled={!request}
          title="Login"
          onPress={() => {
            promptAsync();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
