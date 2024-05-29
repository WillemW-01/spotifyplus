import BrandGradient from "@/components/BrandGradient";
import { TabBarIcon, IoniconType } from "@/components/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "react-native";

const createTabScreen = (
  name: string,
  title: string,
  iconNames: [IoniconType, IoniconType]
) => {
  return (
    <Tabs.Screen
      key={name}
      name={name}
      options={{
        title: title,
        tabBarIcon: ({ focused, color }) => (
          <TabBarIcon
            name={focused ? iconNames[0] : iconNames[1]}
            color={color}
            size={30}
          />
        ),
      }}
    />
  );
};

export default function RootTabLayout() {
  const theme = useColorScheme() ?? "dark";

  return (
    <BrandGradient>
      <StatusBar barStyle="light-content" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors[theme]["light"],
          tabBarInactiveTintColor: Colors[theme]["backgroundAlt"],
          tabBarStyle: {
            flex: 0,
            backgroundColor: Colors[theme]["brand"],
          },
        }}
      >
        {createTabScreen("index", "Home", ["home", "home-outline"])}
        {createTabScreen("explore", "Explore", ["compass", "compass-outline"])}
        {createTabScreen("graph", "Graph", ["git-network", "git-network-outline"])}
        {createTabScreen("mood", "Mood", ["color-palette", "color-palette-outline"])}
        {createTabScreen("settings", "Settings", ["cog", "cog-outline"])}
      </Tabs>
    </BrandGradient>
  );
}
