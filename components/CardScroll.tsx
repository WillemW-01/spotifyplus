import React from "react";
import { ScrollView } from "react-native";

import Card, { CardProps } from "./Card";

interface CardScrollProps {
  cards: CardProps[];
}

export default function CardScroll({ cards }: CardScrollProps) {
  return (
    <ScrollView
      horizontal
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 20, paddingHorizontal: 10 }}
      showsHorizontalScrollIndicator={false}
    >
      {cards.map((cardProps, idx) => (
        <Card key={idx} {...cardProps} />
      ))}
    </ScrollView>
  );
}
