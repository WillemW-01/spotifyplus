import { Colors } from "@/constants/Colors";
import { GlobalProvider } from "@/hooks/Globals";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const theme = useColorScheme() ?? "dark";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[theme]["background"] }}
    >
      <StatusBar style="auto" />
      <GlobalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
        </Stack>
      </GlobalProvider>
    </SafeAreaView>
  );
}
