import React from "react";
import { Image, StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";

import { Colors } from "@/constants/Colors";

import RandomGradient from "./RandomGradient";
import ThemedText from "./ThemedText";

export interface CardProps {
  title?: string;
  subtitle?: string;
  imageUri?: string;
  onPress?: () => void;
  width?: number;
  disabled?: boolean;
}

export default function Card({
  title = "Title",
  subtitle = "Subtitle",
  imageUri,
  onPress,
  width,
  disabled,
}: CardProps) {
  const theme = useColorScheme() ?? "dark";
  const calcWidth = width ? width : 50;

  return (
    <TouchableOpacity
      style={[styles.container, { maxWidth: calcWidth, maxHeight: calcWidth + 40 }]}
      onPress={onPress}
      activeOpacity={0.5}
      disabled={disabled}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: calcWidth,
            height: calcWidth,
            borderRadius: 12,
          }}
        />
      ) : (
        <RandomGradient
          style={{
            backgroundColor: Colors[theme]["grey"],
            width: calcWidth,
            height: calcWidth,
            borderRadius: 12,
          }}
        />
      )}
      <View style={{ flexDirection: "column", alignItems: "center", maxHeight: 40 }}>
        <ThemedText type="cardTitle" text={title} />
        {subtitle && <ThemedText type="cardSubtitle" text={subtitle} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
