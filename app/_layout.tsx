import { Colors } from "@/constants/Colors";
import { AuthProvider } from "@/hooks/AuthContext";
import { GlobalProvider } from "@/hooks/Globals";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const theme = useColorScheme() ?? "dark";

  return (
    <AuthProvider>
      <GlobalProvider>
        <StatusBar style="dark" />
        <SafeAreaView
          edges={["top"]}
          style={{ flex: 1, backgroundColor: Colors[theme]["background"] }}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaView>
      </GlobalProvider>
    </AuthProvider>
  );
}
