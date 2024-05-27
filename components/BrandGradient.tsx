import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Colors } from "@/constants/Colors";

const background = Colors["light"]["background"];
const mid = Colors["light"]["backgroundAlt"];
const brand = Colors["light"]["brand"];

// make the children be of type react children
const BrandGradient = ({ children }: { children: React.ReactNode }) => {
  return (
    <LinearGradient
      colors={[background, mid, brand]}
      style={{
        flex: 1,
      }}
    >
      {children}
    </LinearGradient>
  );
};

export default BrandGradient;
