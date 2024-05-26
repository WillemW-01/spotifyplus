import { GlobalProvider } from "@/hooks/Globals";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
      </Stack>
    </GlobalProvider>
  );
}
