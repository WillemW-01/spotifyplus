import { PlayHistoryObject } from "@/interfaces/tracks";
import { useAuth } from "@/hooks/AuthContext";
import { usePlayback } from "@/hooks/usePlayback";
import { useRequestBuilder } from "@/hooks/useRequestBuilder";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import Card from "@/components/Card";
import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { usePlayLists } from "@/hooks/usePlayList";

export default function Mood() {
  const [playlists, setPlaylists] = useState<SimplifiedPlayList[]>([]);

  const { authorized } = useAuth();
  // const { playTrack } = usePlayback();
  const { listPlayLists } = usePlayLists();
  const theme = useColorScheme() ?? "dark";

  const fetchPlaylists = async () => {
    const response = await listPlayLists();
    setPlaylists(response);
  };

  useEffect(() => {
    if (authorized) {
      fetchPlaylists();
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
        {playlists &&
          playlists.map((item, index) => {
            return (
              <Card
                key={index}
                title={item.name}
                subtitle={item.owner.display_name}
                imageUri={item.images[0].url}
                onPress={() => {}}
                width={90}
              />
            );
          })}
      </ScrollView>
    </BrandGradient>
  );
}
