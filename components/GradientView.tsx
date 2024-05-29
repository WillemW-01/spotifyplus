import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

import BrandGradient from "./BrandGradient";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function GradientView({ children, style }: Props) {
  return <BrandGradient style={[style]}>{children}</BrandGradient>;
}
