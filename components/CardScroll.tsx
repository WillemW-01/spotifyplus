import React from "react";
import { ScrollView } from "react-native";

import Card, { CardProps } from "./Card";
import LoaderCard from "./LoaderCard";

interface CardScrollProps {
  cards: CardProps[];
  loading?: boolean;
}

export default function CardScroll({ cards, loading }: CardScrollProps) {
  return (
    <ScrollView
      horizontal
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 20, paddingHorizontal: 10 }}
      showsHorizontalScrollIndicator={false}
    >
      {!loading
        ? cards.map((cardProps, idx) => <Card key={idx} {...cardProps} />)
        : Array(8)
            .fill(0)
            .map((_, idx) => <LoaderCard key={idx} />)}
    </ScrollView>
  );
}
