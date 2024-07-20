import React from "react";
import { ColorValue, Text, TouchableOpacity } from "react-native";
import { IoniconType } from "@/interfaces/ionicon";
import { Ionicons } from "@expo/vector-icons";

interface GraphButtonProps {
  label?: string;
  iconName?: IoniconType;
  iconColor?: string;
  color?: ColorValue;
  onPress: () => void;
}

export default function GraphButton({
  label,
  iconName,
  iconColor = "#0d1030",
  color = "#e9495f",
  onPress,
}: GraphButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 50,
        height: 50,
        backgroundColor: color,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
      }}
    >
      {label && <Text style={{ color: "white" }}>{label}</Text>}
      {iconName && <Ionicons name={iconName} size={45} color={iconColor} />}
    </TouchableOpacity>
  );
}
