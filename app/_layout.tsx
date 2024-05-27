import { Colors } from "@/constants/Colors";
import { AuthProvider } from "@/hooks/AuthContext";
import { GlobalProvider } from "@/hooks/Globals";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, SafeAreaView } from "react-native";

export default function RootLayout() {
  const theme = useColorScheme() ?? "dark";

  return (
    <AuthProvider>
      <GlobalProvider>
        <StatusBar style="dark" />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Colors[theme]["background"] }}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
          </Stack>
        </SafeAreaView>
        <SafeAreaView
          style={{ flex: 0, backgroundColor: Colors[theme]["brand"] }}
        />
      </GlobalProvider>
    </AuthProvider>
  );
}
