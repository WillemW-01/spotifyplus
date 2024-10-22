import React from "react";
import { TouchableOpacity, View } from "react-native";

import Card, { CardProps } from "@/components/Card";
import { Colors } from "@/constants/Colors";

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
    <TouchableOpacity onPress={onPress} style={{ width: width }} activeOpacity={0.7}>
      <Card
        title={title}
        subtitle={subtitle ?? ""}
        imageUri={imageUri}
        width={width}
        disabled
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: width,
          height: width,
          opacity: selected ? 0 : 0.5,
          backgroundColor: selected ? null : Colors.dark.grey,
          borderRadius: 8,
        }}
      />
    </TouchableOpacity>
  );
}
