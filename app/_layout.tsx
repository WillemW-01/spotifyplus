import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";

import { Colors } from "@/constants/Colors";

import { AuthProvider } from "@/hooks/AuthContext";
import { GlobalProvider } from "@/hooks/Globals";
import { useLogger } from "@/hooks/useLogger";

export default function RootLayout() {
  const theme = useColorScheme() ?? "dark";
  const { addLog } = useLogger();

  const [loaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Regular.ttf"),
    InterBold: require("../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      addLog("Loaded fonts", "RootLayout");
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SQLiteProvider
      databaseName="library.sqlite"
      assetSource={{
        assetId: require("@/assets/db/library.sqlite"),
        forceOverwrite: true,
      }}
      options={{
        useNewConnection: true,
        // enableChangeListener: true,
      }}
    >
      <AuthProvider>
        <GlobalProvider>
          <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: Colors[theme]["background"] }}
          >
            <StatusBar barStyle="light-content" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="debug" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SafeAreaView>
        </GlobalProvider>
      </AuthProvider>
    </SQLiteProvider>
  );
}
