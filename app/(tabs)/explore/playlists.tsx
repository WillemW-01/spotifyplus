import React from "react";

import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";

export default function Playlists() {
  return (
    <BrandGradient>
      <ThemedText type="title" text="PlayLists" />
      <ThemedText
        type="body"
        text="Coming soon."
        style={{ textAlign: "center", marginTop: 40 }}
      />
    </BrandGradient>
  );
}
