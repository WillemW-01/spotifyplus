import React, { useEffect, useState } from "react";
import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";
import { View, useColorScheme } from "react-native";
import { PlotPoint } from "@/components/ScatterPlotOld";
import { Colors } from "@/constants/Colors";

import allGenres from "@/constants/all-genres.json";
import Network from "@/components/Network";

const packData = () => {
  const dataArray = Object.entries(allGenres);
  const data: PlotPoint[] = dataArray.map((genre) => {
    return {
      name: genre[0],
      size: 0.5,
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
        <Network />
      </View>
    </BrandGradient>
  );
}
