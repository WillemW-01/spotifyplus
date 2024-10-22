import { Colors } from "@/constants/Colors";
import { useColorScheme, View, Text } from "react-native";
import Bar from "react-native-progress/Bar";
import React, { useState } from "react";

interface Props {
  progress: number;
  color: "dark" | "brand";
  height?: number;
  width?: number;
  showValue?: boolean;
}

export default function ThemedProgressBar({
  progress,
  color,
  height = 25,
  width,
  showValue = false,
}: Props) {
  const scheme = useColorScheme() ?? "dark";
  const fillColor = color == "brand" ? Colors[scheme].brand : Colors[scheme].background;
  const backColor =
    color == "brand" ? Colors[scheme].backgroundAlt : Colors[scheme].brand;

  return (
    <View style={{ width: "100%", justifyContent: "center" }}>
      <Bar
        progress={progress}
        color={fillColor}
        unfilledColor={backColor}
        borderRadius={8}
        height={height}
        width={width ?? null}
        useNativeDriver={true}
        animationType="timing"
      />
      {showValue && (
        <Text
          style={{
            textAlign: "center",
            color: "white",
            position: "absolute",
            // Calculate vertical centering: (Progress bar height - Text height) / 2
            top: (height - 12) / 2, // Assuming lineHeight ~ 12
            left: 0, // Align text horizontally centered
            right: 0,
            lineHeight: 16,
            fontSize: 16,
          }}
        >
          {Math.floor(progress * 100)} %
        </Text>
      )}
    </View>
  );
}
