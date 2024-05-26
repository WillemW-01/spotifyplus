import { ColorValue, useColorScheme } from "react-native";

import { Colors } from "@/constants/Colors";

export function useColor(
  colorName: keyof typeof Colors.light | keyof typeof Colors.dark
): ColorValue {
  const theme = useColorScheme() ?? "light";
  const color = Colors[theme][colorName];
  return color ?? "transparent"; // Ensure it returns a valid ColorValue
}
