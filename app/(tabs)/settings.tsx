import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";
import React from "react";

export default function Settings() {
  return (
    <BrandGradient>
      <ThemedText text="Settings" type="title" />
      <ThemedText
        type="body"
        text="Coming soon."
        style={{ textAlign: "center", marginTop: 40 }}
      />
    </BrandGradient>
  );
}
