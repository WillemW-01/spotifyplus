import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { IoniconType } from "@/interfaces/ionicon";
import { Ionicons } from "@expo/vector-icons";

interface GraphButtonProps {
  iconName: IoniconType;
  playImmediate: () => void;
  playSecondDegree: () => void;
}

export default function GraphButtonPlay({
  iconName,
  playImmediate,
  playSecondDegree,
}: GraphButtonProps) {
  const [onlyImmediate, setOnlyImmediate] = React.useState(false);

  return (
    <TouchableOpacity
      onPress={onlyImmediate ? playImmediate : playSecondDegree}
      onLongPress={() => setOnlyImmediate((prev) => !prev)}
      style={{
        width: 50,
        height: 50,
        backgroundColor: onlyImmediate ? "#e9495f" : "#0d1030",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
      }}
    >
      <Text
        style={{ color: "white", fontSize: 15, position: "absolute", top: 5, right: 5 }}
      >
        {onlyImmediate ? "1" : "2"}
      </Text>
      <Ionicons name={iconName} size={45} color="white" />
    </TouchableOpacity>
  );
}
