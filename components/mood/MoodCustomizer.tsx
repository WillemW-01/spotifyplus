import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Button from "@/components/Button";
import GridBox from "@/components/GridBox";
import MoodModal from "@/components/mood/Modal";
import MoodButton from "@/components/mood/MoodButton";
import MoodSlider from "@/components/mood/MoodSlider";

import { Colors } from "@/constants/Colors";
import { Preset, PRESETS, TrackFeatures } from "@/constants/sliderPresets";

interface Props {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  onPlay: (mood?: keyof typeof PRESETS) => void;
  resetSliders: () => void;
  // eslint-disable-next-line no-unused-vars
  setSlidersTo: (mood: keyof typeof PRESETS) => void;
  sliderValues: Preset;
  // eslint-disable-next-line no-unused-vars
  updateValue: (featureName: keyof TrackFeatures, value: number) => void;
}

export default function MoodCustomizer({
  visible,
  setVisible,
  onPlay,
  resetSliders,
  setSlidersTo,
  sliderValues,
  updateValue,
}: Props) {
  const [showMore, setShowMore] = useState(false);

  function toggleAdvanced() {
    setShowMore((prev) => !prev);
  }

  return (
    <MoodModal visible={visible}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Pick a mood</Text>
        </View>

        <TouchableOpacity onPress={() => setVisible(false)}>
          <Ionicons name="close-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ width: "100%" }}
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Button
            onPress={toggleAdvanced}
            title={showMore ? "Hide" : "Advanced"}
            textLight={false}
            textStyle={{ fontSize: 16 }}
            padding={15}
            style={{ minWidth: 80 }}
          />
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
                  stdDev={v.stdDev}
                />
              );
            })}
          </>
        )}
      </ScrollView>
    </MoodModal>
  );
}

const styles = StyleSheet.create({
  moodButtonContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
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
    padding: 10,
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
