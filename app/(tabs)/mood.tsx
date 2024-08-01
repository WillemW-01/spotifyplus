import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

import { Colors } from "@/constants/Colors";
import { PRESETS, TrackFeatures } from "@/constants/sliderPresets";

import { SimplifiedPlayList } from "@/interfaces/playlists";

import BrandGradient from "@/components/BrandGradient";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";

import { useAuth } from "@/hooks/AuthContext";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayLists } from "@/hooks/usePlayList";
import { useTracks } from "@/hooks/useTracks";
import MoodCustomizer from "@/components/MoodCustomizer";

export default function Mood() {
  const [playlists, setPlaylists] = useState<SimplifiedPlayList[]>([]);
  const [sliderValues, setSliderValues] = useState<TrackFeatures>(PRESETS.default);

  const currPlayList = useRef<SimplifiedPlayList | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { authorized } = useAuth();
  const { playTracks } = usePlayback();
  const { listPlayLists, getPlayListItemsIds } = usePlayLists();
  const theme = useColorScheme() ?? "dark";
  const { fitsInPreset } = useTracks();

  const updateValue = (featureName: keyof TrackFeatures, value: number) => {
    setSliderValues((prev) => ({
      ...prev,
      [featureName]: value,
    }));
  };

  const resetSliders = () => {
    setSliderValues(PRESETS.default);
  };

  const setSlidersTo = (mood: keyof typeof PRESETS) => {
    setSliderValues(PRESETS[mood]);
  };

  const fetchPlaylists = async () => {
    const response = await listPlayLists();
    setPlaylists(response);
  };

  const onPlay = async () => {
    if (currPlayList.current) {
      const tracks = await getPlayListItemsIds(currPlayList.current.id);
      if (!tracks) return;
      console.log("Getting tracks with sliders: ", sliderValues);
      console.log("Before filtering: ", tracks);

      const promises = tracks.map(async (t) => ({
        track: t,
        fits: await fitsInPreset(sliderValues, t),
      }));

      const results = await Promise.all(promises);
      const filteredTracks = results.filter((r) => r.fits).map((r) => r.track);
      console.log("After filtering: ", filteredTracks);

      playTracks(filteredTracks);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchPlaylists();
    }
  }, []);

  useEffect(() => {
    if (sliderValues) {
      console.log("Value: ", sliderValues);
    }
  }, [sliderValues]);

  return (
    <BrandGradient style={{ flex: 1, alignItems: "center", gap: 30 }}>
      <Text style={{ fontSize: 35, color: Colors[theme]["light"] }}>Mood</Text>
      <ThemedText text="Pick a playlist:" type="subtitle" />
      <ScrollView
        contentContainerStyle={styles.playListScrollContainer}
        style={{ flex: 1, width: "100%" }}
      >
        {playlists &&
          playlists.map((item, index) => {
            return (
              <Card
                key={index}
                title={item.name}
                subtitle={item.owner.display_name}
                imageUri={item.images[0].url}
                onPress={() => {
                  currPlayList.current = item;
                  bottomSheetRef.current?.expand();
                }}
                width={90}
              />
            );
          })}
      </ScrollView>
      <MoodCustomizer
        bottomSheetRef={bottomSheetRef}
        onPlay={onPlay}
        resetSliders={resetSliders}
        setSlidersTo={setSlidersTo}
        sliderValues={sliderValues}
        updateValue={updateValue}
      />
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  playListScrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    width: "100%",
  },
});
