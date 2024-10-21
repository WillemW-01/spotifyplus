import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { Colors } from "@/constants/Colors";
import { PRESETS } from "@/constants/sliderPresets";

interface Props {
  label: keyof typeof PRESETS;
  onPress?: () => void;
}

export default function MoodButton({ label, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.moodButton} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.moodButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  moodButton: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  moodButtonText: {
    color: Colors.dark.text,
    fontSize: 18,
  },
});
