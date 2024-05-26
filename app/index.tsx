import React, { useEffect } from "react";
import {
  View,
  Button,
  useColorScheme,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import useSpotifyAuth from "@/hooks/useSpotifyAuth";
import { useGlobals } from "@/hooks/Globals";
import { Colors } from "@/constants/Colors";

export default function App() {
  const { request, promptAsync } = useSpotifyAuth();
  const { token } = useGlobals();

  const theme = useColorScheme() ?? "light";

  useEffect(() => {
    if (token) {
      console.log(`Token was updated: ${token.slice(0, 20)}...`);
      router.navigate("/home"); // TODO: why doesn't this work when router.replace?
    }
  }, [token]);

  return (
    <LinearGradient
      colors={["#0d1030", "#2c1e48", "#e9495f"]}
      style={{
        flex: 1,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 35, color: "white", top: "25%" }}>
        Welcome to Spotify+
      </Text>
      <TouchableOpacity
        style={styles.button}
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
      >
        <Text style={{ color: "#0d1030", fontSize: 25 }}>Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const window = Dimensions.get("window");

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#dedede",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: "absolute",
    top: window.height / 2 - 40,
    left: window.width / 2 - 75,
  },
});
