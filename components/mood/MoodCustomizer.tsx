import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
import Animated from "react-native-reanimated";
import MoodModal from "./Modal";

interface Props {
  // bottomSheetRef: React.RefObject<BottomSheet>;
  // modalRef: React.MutableRefObject<IHandles>;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onPlay: (mood?: keyof typeof PRESETS) => void;
  resetSliders: () => void;
  setSlidersTo: (mood: keyof typeof PRESETS) => void;
  sliderValues: Preset;
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
    if (showMore) {
      setShowMore(false);
    } else {
      setShowMore(true);
    }
  }

  return (
    // <View style={styles.sheetContainer}>
    //   <Modal visible={visible} transparent animationType="slide">
    //     <View
    //       style={{
    //         padding: 20,
    //         justifyContent: "center",
    //         alignItems: "center",
    //         maxHeight: "80%",
    //       }}
    //     >
    //       <View style={{ ...styles.modalView, backgroundColor: Colors.dark.light }}>
    <MoodModal visible={visible} setVisible={setVisible}>
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
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={toggleAdvanced} style={styles.playButton}>
            <Text style={{ fontSize: 16 }}>{showMore ? "Hide" : "Advanced"}</Text>
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
                  stdDev={v.stdDev}
                />
              );
            })}
          </>
        )}
      </ScrollView>
    </MoodModal>
    //       </View>

    //     </View>
    //   </Modal>
    // </View>
  );
}

const styles = StyleSheet.create({
  moodButtonContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "space-evenly",
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
    // width: 80,
    // height: 40,
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
