import React from "react";

import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";

export default function Artists() {
  return (
    <BrandGradient>
      <ThemedText type="title" text="Artists" />
      <ThemedText
        type="body"
        text="Coming soon."
        style={{ textAlign: "center", marginTop: 40 }}
      />
    </BrandGradient>
  );
}
