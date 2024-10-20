import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import {
  PREDICATES,
  PRESETS,
  TrackFeatures,
  PresetItem,
  Preset,
} from "@/constants/sliderPresets";

import MoodButton from "@/components/mood/MoodButton";
import MoodSlider from "@/components/mood/MoodSlider";
import Button from "../Button";
import GridBox from "../GridBox";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onPlay: (mood?: keyof typeof PRESETS) => void;
  resetSliders: () => void;
  setSlidersTo: (mood: keyof typeof PRESETS) => void;
  sliderValues: Preset;
  updateValue: (featureName: keyof TrackFeatures, value: number) => void;
}

export default function MoodCustomizer({
  bottomSheetRef,
  onPlay,
  resetSliders,
  setSlidersTo,
  sliderValues,
  updateValue,
}: Props) {
  const [showMore, setShowMore] = useState(false);

  function toggleAdvanced() {
    if (showMore) {
      setShowMore(false);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      setShowMore(true);
      bottomSheetRef.current?.snapToIndex(1);
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["40%", "90%"]}
      index={-1}
      backgroundStyle={{
        backgroundColor: Colors.light.brand,
      }}
    >
      <BottomSheetView
        style={{
          ...styles.sheetContainer,
          backgroundColor: Colors.dark.text,
        }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Pick a mood</Text>
          </View>

          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <Ionicons name="close-circle-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.moodButtonContainer}>
            {Object.keys(PRESETS).map((mood: keyof typeof PRESETS) => {
              return (
                mood != "default" && (
                  <MoodButton key={mood} label={mood} onPress={() => onPlay(mood)} />
                )
              );
            })}
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={toggleAdvanced} style={styles.playButton}>
              <Text style={{ fontSize: 20 }}>{showMore ? "Hide" : "Advanced"}</Text>
            </TouchableOpacity>
            {showMore && (
              <View style={styles.playButtonContainer}>
                <TouchableOpacity onPress={resetSliders} style={{ marginRight: 15 }}>
                  <Ionicons name="refresh-outline" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onPlay()} style={styles.playButton}>
                  <Ionicons name="play" size={30} color={Colors.light.background} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {showMore && (
            <>
              <View>
                <Text style={styles.title}>Presets:</Text>
                <GridBox cols={3} gap={20}>
                  {Object.keys(PRESETS).map((mood: keyof typeof PRESETS, i) => {
                    return (
                      <Button
                        key={i}
                        title={mood as string}
                        color="dark"
                        height={40}
                        onPress={() => setSlidersTo(mood)}
                      />
                    );
                  })}
                </GridBox>
              </View>
              {Object.entries(sliderValues).map(([k, v], i) => {
                return (
                  <MoodSlider
                    key={k}
                    label={k as keyof TrackFeatures}
                    setValue={updateValue}
                    value={v.value}
                    useNew={false}
                  />
                );
              })}
            </>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 20,
  },
  moodButtonContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    rowGap: 10,
    gap: 10,
    flex: 1,
  },
  contentContainer: { flexDirection: "row", alignItems: "center", gap: 20 },
  header: { flexDirection: "row", flex: 1, gap: 20, alignItems: "center" },
  title: { color: "black", fontSize: 30 },
  playButtonContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  playButton: {
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.brand,
    borderRadius: 8,
  },
  scrollContent: {
    gap: 20,
    alignItems: "flex-start",
    paddingBottom: 20,
  },
});
