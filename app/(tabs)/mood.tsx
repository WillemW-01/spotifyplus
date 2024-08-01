import { useAuth } from "@/hooks/AuthContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  useColorScheme,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Card from "@/components/Card";
import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { usePlayLists } from "@/hooks/usePlayList";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MoodSlider from "@/components/MoodSlider";
import { Ionicons } from "@expo/vector-icons";
import { PRESETS, TrackFeatures } from "@/constants/sliderPresets";
import MoodButton from "@/components/MoodButton";

export default function Mood() {
  const [playlists, setPlaylists] = useState<SimplifiedPlayList[]>([]);
  const [sliderValues, setSliderValues] = useState<TrackFeatures>(PRESETS.default);

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

  useEffect(() => {
    if (sliderValues) {
      console.log("Value: ", sliderValues);
    }
  }, [sliderValues]);

  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <BrandGradient style={{ flex: 1, alignItems: "center", gap: 30 }}>
      <Text style={{ fontSize: 35, color: Colors[theme]["light"] }}>Mood</Text>
      <ThemedText text="Pick a playlist:" type="subtitle" />
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
                onPress={() => {
                  bottomSheetRef.current?.expand();
                }}
                width={90}
              />
            );
          })}
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["90%"]}
        index={-1}
        backgroundStyle={{
          backgroundColor: Colors[theme].brand,
        }}
      >
        <BottomSheetView
          style={{
            ...styles.contentContainer,
            backgroundColor: Colors[theme].text,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <View
              style={{ flexDirection: "row", flex: 1, gap: 20, alignItems: "center" }}
            >
              <Text style={{ color: "black", fontSize: 30 }}>Customise</Text>
              <TouchableOpacity
                onPress={resetSliders}
                style={{
                  width: 80,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: Colors.light.brand,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="play" size={30} color={Colors.light.background} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={resetSliders}>
              <Ionicons name="refresh-outline" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Ionicons name="close-circle-outline" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={{
              gap: 20,
              alignItems: "flex-start",
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.moodButtonContainer}>
              {Object.keys(PRESETS).map((mood) => {
                return (
                  mood != "default" && (
                    <MoodButton
                      key={mood}
                      label={mood}
                      onPress={() => setSlidersTo(mood)}
                    />
                  )
                );
              })}
            </View>
            {Object.entries(sliderValues).map(([k, v]) => {
              return (
                <MoodSlider
                  key={k}
                  label={k as keyof TrackFeatures}
                  setValue={updateValue}
                  value={v}
                />
              );
            })}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 20,
  },
  moodButtonContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 10,
    gap: 10,
  },
});
