import React from "react";
import { View, ActivityIndicator, Text, Dimensions } from "react-native";

interface Props {
  progress: number;
}

export default function LoadingCircle({ progress }: Props) {
  const { width, height } = Dimensions.get("window");

  return (
    <View
      style={{
        position: "absolute",
        top: height / 2 - 100,
        left: width / 2 - 25,
        width: 50,
        height: 50,
      }}
    >
      <ActivityIndicator color="#000000" size="large" />
      <Text style={{ textAlign: "center", fontSize: 18 }}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
}
