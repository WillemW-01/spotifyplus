import React, { useEffect, useState } from "react";
import { View, useColorScheme } from "react-native";

import BrandGradient from "@/components/BrandGradient";
import Network from "@/components/Network";
import ThemedText from "@/components/ThemedText";

import { Colors } from "@/constants/Colors";
import allGenres from "@/constants/all-genres.json";

export interface PlotPoint {
  name: string;
  x: string;
  y: string;
  href: string;
  size: number;
}

const packData = () => {
  const dataArray = Object.entries(allGenres);
  const data: PlotPoint[] = dataArray.map((genre) => {
    return {
      name: genre[0],
      size: genre[1].size === 0 ? 5 : genre[1].size * 200,
      y: genre[1].top.toString(),
      x: genre[1].left.toString(),
      href: "https://api.spotify.com/v1/playlists/69fEt9DN5r4JQATi52sRtq/tracks",
    };
  });

  return data;
};

export default function Mood() {
  const theme = useColorScheme() ?? "dark";
  const [data, setData] = useState<PlotPoint[]>([]);

  useEffect(() => {
    if (!data || data.length == 0) {
      setData(packData());
    }
  }, []);

  return (
    <BrandGradient>
      <ThemedText
        type="title"
        text="Mood"
        style={{ backgroundColor: Colors[theme]["background"] }}
      />
      <View style={{ flex: 1, backgroundColor: "white", zIndex: -1 }}>
        <Network nodeData={data.slice(0, 20)} edgeData={[]} />
      </View>
    </BrandGradient>
  );
}
