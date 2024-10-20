import { IoniconType } from "@/interfaces/ionicon";
import {
  ColorSchemeName,
  ColorValue,
  DimensionValue,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import React = require("react");
import { Colors } from "@/constants/Colors";

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
}: Props) {
  const scheme = useColorScheme() ?? "dark";
  const fillColor = getFillColor(color, scheme);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={opacity}
      disabled={disabled}
      style={{
        ...styles.container,
        width: width,
        height: height,
        flex: flex,
        backgroundColor: disabled ? getFillColor("grey", scheme) : fillColor,
        padding: padding,
        paddingHorizontal: paddingHorizontal,
      }}
    >
      <Text style={{ color: textLight ? "white" : "black" }}>{title}</Text>
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
