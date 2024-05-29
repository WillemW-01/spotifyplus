import React, { useEffect, useState } from "react";
import { ScrollView, Text, useColorScheme } from "react-native";

import { Colors } from "@/constants/Colors";

import { PlayHistoryObject } from "@/interfaces/tracks";

import { useAuth } from "@/hooks/AuthContext";
import { usePlayback } from "@/hooks/usePlayback";

import BrandGradient from "@/components/BrandGradient";
import Card from "@/components/Card";

export default function Home() {
  const [recents, setRecents] = useState<PlayHistoryObject[]>([]);

  const { authorized } = useAuth();
  const { getRecent, playTrack } = usePlayback();
  const theme = useColorScheme() ?? "dark";

  const fetchRecents = async () => {
    const response = await getRecent();
    setRecents(response);
  };

  useEffect(() => {
    if (authorized) {
      fetchRecents();
    }
  }, []);

  return (
    <BrandGradient style={{ flex: 1, alignItems: "center", gap: 30 }}>
      <Text style={{ fontSize: 35, color: Colors[theme]["light"] }}>
        Recently Played:
      </Text>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 30,
          width: "100%",
        }}
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        {recents &&
          recents.map((item, index) => {
            return (
              <Card
                key={index}
                title={item.track.name}
                subtitle={item.track.artists[0].name}
                imageUri={item.track.album.images[0].url}
                onPress={() => {
                  playTrack(item.track.id);
                }}
                width={90}
              />
            );
          })}
      </ScrollView>
    </BrandGradient>
  );
}
