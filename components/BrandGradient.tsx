import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

import { Colors } from "@/constants/Colors";

const background = Colors["light"]["background"];
const mid = Colors["light"]["backgroundAlt"];
const brand = Colors["light"]["brand"];

interface BrandGradientProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// make the children be of type react children
const BrandGradient = ({ children, style }: BrandGradientProps) => {
  return (
    <LinearGradient colors={[background, mid, brand]} style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
};

export default BrandGradient;
