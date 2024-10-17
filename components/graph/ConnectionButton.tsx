import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text } from "react-native";
import Button from "./Button";

interface ConnectionProps {
  title: string;
  body: string;
  onPress: () => void;
  selected: boolean;
}

export default function ConnectionButton({
  title,
  body,
  onPress,
  selected,
}: ConnectionProps) {
  return (
    <View style={{ width: "100%", alignItems: "flex-end" }}>
      <Button
        title={title}
        onPress={onPress}
        selected={selected}
        style={{ width: "100%", borderBottomRightRadius: 0 }}
        textStyle={{ fontSize: 25 }}
        activeOpacity={0.7}
      />
      <View
        style={{
          width: "90%",
          backgroundColor: Colors.dark.lightMedium,
          borderBottomRightRadius: 10,
          borderBottomLeftRadius: 10,
          padding: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>{body}</Text>
      </View>
    </View>
  );
}
