import { IoniconType } from "@/interfaces/ionicon";
import {
  ColorSchemeName,
  ColorValue,
  DimensionValue,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";
import React = require("react");
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

type PossibleColors = "dark" | "brand" | "grey";

interface Props {
  title?: string;
  // eslint-disable-next-line no-unused-vars
  onPress?: (...args: unknown[]) => unknown;
  flex?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  color?: PossibleColors;
  opacity?: number;
  padding?: number;
  paddingHorizontal?: number;
  disabled?: boolean;
  textLight?: boolean;
  icon?: {
    name: IoniconType;
    size: number;
    color: ColorValue;
  };
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const getFillColor = (color: PossibleColors, scheme: ColorSchemeName) => {
  switch (color) {
    case "dark":
      return Colors[scheme].background;
    case "brand":
      return Colors[scheme].brand;
    case "grey":
      return Colors[scheme].grey;
    default:
      return Colors[scheme].brand;
  }
};

export default function Button({
  title,
  onPress,
  flex = 0,
  width = "auto",
  height = "auto",
  color = "brand",
  opacity = 0.7,
  padding = 10,
  paddingHorizontal = 10,
  textLight = true,
  disabled = false,
  icon,
  style,
  textStyle,
}: Props) {
  const scheme = useColorScheme() ?? "dark";
  const fillColor = getFillColor(color, scheme);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={opacity}
      disabled={disabled}
      style={[
        {
          width: width,
          height: height,
          flex: flex,
          backgroundColor: disabled ? getFillColor("grey", scheme) : fillColor,
          padding: padding,
          paddingHorizontal: paddingHorizontal,
        },
        styles.container,
        style,
      ]}
    >
      <Text style={[{ color: textLight ? "white" : "black" }, textStyle]}>{title}</Text>
      {icon && <Ionicons name={icon.name} size={icon.size} color={icon.color} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});
