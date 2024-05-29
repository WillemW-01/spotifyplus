import { Stack } from "expo-router";
import React from "react";

export default function ExploreStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="explorePage">
      <Stack.Screen name="explorePage" />
      <Stack.Screen name="playlists" />
      <Stack.Screen name="artists" />
      <Stack.Screen name="genres" />
      <Stack.Screen name="tracks" />
    </Stack>
  );
}
