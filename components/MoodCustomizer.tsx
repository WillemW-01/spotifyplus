import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { PRESETS, TrackFeatures } from "@/constants/sliderPresets";

import MoodButton from "@/components/MoodButton";
import MoodSlider from "@/components/MoodSlider";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onPlay: () => void;
  resetSliders: () => void;
  setSlidersTo: (mood: keyof typeof PRESETS) => void;
  sliderValues: TrackFeatures;
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
  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["90%"]}
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
            <Text style={styles.title}>Customise</Text>
            <TouchableOpacity onPress={onPlay} style={styles.playButton}>
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
          contentContainerStyle={styles.scrollContent}
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
    justifyContent: "flex-start",
    rowGap: 10,
    gap: 10,
  },
  contentContainer: { flexDirection: "row", alignItems: "center", gap: 20 },
  header: { flexDirection: "row", flex: 1, gap: 20, alignItems: "center" },
  title: { color: "black", fontSize: 30 },
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
