import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { Button, Modal, Text, TouchableOpacity, View, StyleSheet } from "react-native";

import { Colors } from "@/constants/Colors";
import { DESCRIPTIONS, PARAMETERS, TrackFeatures } from "@/constants/sliderPresets";

interface Props {
  label: keyof TrackFeatures;
  value: number;
  setValue: (featureName: keyof TrackFeatures, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const other = {
  mode: 1,
  key: 5,
};

export default function MoodSlider({ label, value, setValue }: Props) {
  const [internalValue, setInternalValue] = useState(value * 100);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setInternalValue(value * 100);
  }, [value]);

  const handleValueChange = (newValue: number) => {
    setInternalValue(newValue);
  };

  const handleSlidingComplete = (newValue: number) => {
    setValue(label, newValue / 100);
  };

  return (
    <View style={{ width: "100%" }}>
      <View style={styles.labelContainer}>
        <Text style={{ fontSize: 18 }}>{label.toUpperCase()}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.light.background}
          />
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="slide">
          <TouchableOpacity style={styles.infoButton} activeOpacity={1}>
            <View style={styles.infoButtonContent}>
              <Text style={styles.infoText}>{DESCRIPTIONS[label]}</Text>
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={{ flex: 1 }}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumValue={PARAMETERS ? PARAMETERS[label].min : 0}
          maximumValue={PARAMETERS ? PARAMETERS[label].max : 100}
          step={PARAMETERS ? PARAMETERS[label].step : 5}
          value={internalValue}
          minimumTrackTintColor={isDisabled ? "#a0a0a0" : Colors.light.background}
          maximumTrackTintColor={isDisabled ? "#a0a0a0" : Colors.light.lightDark}
          onTouchEndCapture={() => console.log("Touch end")}
        />

        <Text style={styles.sliderValue}>{internalValue.toFixed(0)}</Text>
        <TouchableOpacity onPress={() => setIsDisabled((prev) => !prev)}>
          <Ionicons
            name={isDisabled ? "add-circle-outline" : "remove-circle-outline"}
            size={30}
            color={Colors.light.background}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: { flexDirection: "row", alignItems: "center", gap: 20 },
  infoButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoButtonContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  infoText: { fontSize: 18, lineHeight: 28 },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderValue: { width: 50, textAlign: "center", fontSize: 18 },
});
