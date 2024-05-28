import { ViewStyle, StyleProp } from "react-native";
import BrandGradient from "./BrandGradient";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function GradientView({ children, style }: Props) {
  return <BrandGradient style={[style]}>{children}</BrandGradient>;
}
