import React from "react";

import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";
import LoaderCard from "@/components/LoaderCard";

export default function Mood() {
  return (
    <BrandGradient>
      <ThemedText type="title" text="Mood" />
    </BrandGradient>
  );
}
