import { Colors } from "@/constants/Colors";
import React from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
  Text,
} from "react-native";

interface ButtonProps {
  onPress: () => void;
  title: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  onPress,
  title,
  selected = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={[
        {
          ...styles.button,
          backgroundColor: selected ? Colors.dark.brand : Colors.dark.grey,
        },
        style,
      ]}
    >
      <Text style={[textStyle, { color: "white" }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
  },
  modalText: {
    textAlign: "center",
    fontSize: 25,
  },
});
