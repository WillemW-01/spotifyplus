import { TabBarIcon } from "@/components/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function RootTabLayout() {
  const theme = useColorScheme() ?? "light";

  return (
    <LinearGradient
      colors={["#0d1030", "#2c1e48", "#e9495f"]}
      style={{
        flex: 1,
      }}
    >
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
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => (
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ focused, color, size }) => (
              <TabBarIcon
                name={focused ? "globe" : "globe-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
      </Tabs>
    </LinearGradient>
  );
}
