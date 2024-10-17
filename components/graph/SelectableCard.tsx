import { Colors } from "@/constants/Colors";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Card, { CardProps } from "../Card";

interface SelectableCardProps extends CardProps {
  selected?: boolean;
}

export default function SelectableCard({
  selected,
  title,
  subtitle,
  imageUri,
  onPress,
  width,
}: SelectableCardProps) {
  return (
    <TouchableOpacity
      onPress={() => console.log("Card Pressed")}
      style={{ width: width }}
    >
      <Card title={title} subtitle={subtitle ?? ""} imageUri={imageUri} width={width} />
      <View
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          width: 30,
          height: 30,
          backgroundColor: selected ? Colors.dark.backgroundAlt : Colors.dark.grey,
          borderRadius: 8,
        }}
      />
    </TouchableOpacity>
  );
}
