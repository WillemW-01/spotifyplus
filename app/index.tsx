import React, { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/hooks/AuthContext";
import BrandGradient from "@/components/BrandGradient";
import { useLogger } from "@/hooks/useLogger";

export default function App() {
  const { request, promptAsync, authorized } = useAuth();
  const { addLog } = useLogger();

  const handleLogin = () => {
    addLog("Login button pressed", "index");
    if (!authorized) {
      promptAsync();
    } else {
      router.navigate("/(tabs)/");
    }
  };

  const goToDebug = () => {
    router.navigate("/home");
  };

  useEffect(() => {
    if (authorized) {
      addLog("Navigating to home", "index");
      router.navigate("/(tabs)/");
    } else {
      addLog("Token not ready. Need to request", "index");
    }
  }, [authorized]);

  return (
    <BrandGradient style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 35, color: "white", top: "25%" }}>
        Welcome to Spotify+
      </Text>
      <TouchableOpacity style={styles.button} disabled={!request} onPress={handleLogin}>
        <Text style={{ color: "#0d1030", fontSize: 25 }}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ position: "absolute", bottom: 0, height: 100, width: "100%" }}
        onPress={goToDebug}
      />
    </BrandGradient>
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
