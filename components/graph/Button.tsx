import Ionicons from "@expo/vector-icons/Ionicons";
import { type IconProps } from "@expo/vector-icons/build/createIconSet";
import { Colors } from "@/constants/Colors";
import React, { type ComponentProps } from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
  Text,
} from "react-native";
import { IoniconType } from "@/interfaces/ionicon";

interface ButtonProps {
  onPress: () => void;
  title?: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
  iconProps?: {
    name: IoniconType;
    size: number;
  };
}

export default function Button({
  onPress,
  title,
  selected = false,
  style,
  textStyle,
  activeOpacity,
  iconProps,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity ?? 0.7}
      style={[
        {
          ...styles.button,
          backgroundColor: selected ? Colors.dark.brand : Colors.dark.grey,
        },
        style,
      ]}
    >
      {title && <Text style={[textStyle, { color: "white" }]}>{title}</Text>}
      {iconProps && <Ionicons name={iconProps.name} size={iconProps.size} />}
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
