import React, { useEffect } from "react";
import { View, Button } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import useSpotifyAuth from "@/hooks/useSpotifyAuth";
import { useGlobals } from "@/hooks/Globals";

export default function App() {
  const { request, promptAsync } = useSpotifyAuth();
  const { token } = useGlobals();

  useEffect(() => {
    if (token) {
      console.log(`Token was updated: ${token.slice(0, 20)}...`);
      router.navigate("/home"); // TODO: why doesn't this work?
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
