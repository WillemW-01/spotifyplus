import BrandGradient from "@/components/BrandGradient";
import { TabBarIcon } from "@/components/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function RootTabLayout() {
  const theme = useColorScheme() ?? "dark";

  return (
    <BrandGradient>
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
                name={focused ? "compass" : "compass-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="graph"
          options={{
            title: "Graph",
            tabBarIcon: ({ focused, color, size }) => (
              <TabBarIcon
                name={focused ? "git-network" : "git-network-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="mood"
          options={{
            title: "Mood",
            tabBarIcon: ({ focused, color, size }) => (
              <TabBarIcon
                name={focused ? "color-palette" : "color-palette-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <TabBarIcon
                name={focused ? "cog" : "cog-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
      </Tabs>
    </BrandGradient>
  );
}
