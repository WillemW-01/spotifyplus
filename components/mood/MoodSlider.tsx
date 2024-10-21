import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { Button, Modal, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Slider as NewSlider } from "@miblanchard/react-native-slider";

import { Colors } from "@/constants/Colors";
import { DESCRIPTIONS, PARAMETERS, TrackFeatures } from "@/constants/sliderPresets";

interface Props {
  label: keyof TrackFeatures;
  value: number;
  setValue: (featureName: keyof TrackFeatures, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  stdDev?: number;
}

const other = {
  mode: 1,
  key: 5,
};

const round = (num: number) => Number(num.toFixed(3));

export default function MoodSlider({
  label,
  value,
  setValue,
  min,
  max,
  step,
  stdDev,
}: Props) {
  const actualMin = PARAMETERS ? PARAMETERS[label].min : 0;
  const actualMax = PARAMETERS ? PARAMETERS[label].max : 100;
  const actualStep = PARAMETERS ? PARAMETERS[label].step : 5;
  const actualUnit = PARAMETERS ? PARAMETERS[label].unit : "";

  const isTempoOrLoudness = ["tempo", "loudness"].includes(label);
  const fromSliderDefault = (value: number) =>
    round(isTempoOrLoudness ? value : value / 100);
  const toSliderDefault = (value: number) =>
    round(isTempoOrLoudness ? value : value * 100);

  const [internalValue, setInternalValue] = useState(toSliderDefault(value));
  const [modalVisible, setModalVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width); // Get container width in pixels
  };

  useEffect(() => {
    setInternalValue(toSliderDefault(value));
  }, [value]);

  const handleValueChange = (newValue: number | number[]) => {
    const toUse = Array.isArray(newValue) ? newValue[0] : newValue;
    setInternalValue(round(toUse));
  };

  const handleSlidingComplete = (newValue: number | number[]) => {
    const toUse = Array.isArray(newValue) ? newValue[0] : newValue;
    setValue(label, fromSliderDefault(toUse));
  };

  const calculateMidPoint = (
    value: number,
    min: number,
    max: number,
    variance: number
  ) => {
    const sliderRange = max - min;
    const normalizedValue = ((value - min) / sliderRange) * containerWidth;
    const width = calculateWidth(variance, min, max);
    return normalizedValue - width / 2;
  };

  const calculateWidth = (variance: number, min: number, max: number) => {
    const sliderRange = max - min;
    const toUse = isTempoOrLoudness ? variance : variance * 100;
    const widthInPixels = (toUse / sliderRange) * containerWidth;

    return widthInPixels;
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
        <View
          style={{
            flex: 1,
            overflow: "hidden",
          }}
          onLayout={handleLayout}
        >
          <View
            style={{
              position: "absolute",
              top: 28 / 2,
              backgroundColor: isDisabled ? Colors.dark.brand + "80" : Colors.dark.brand,
              borderRadius: 12,
              height: 14,
              left: calculateMidPoint(internalValue, actualMin, actualMax, stdDev),
              width: calculateWidth(stdDev, actualMin, actualMax),
            }}
          />
          <NewSlider
            // containerStyle={{ flex: 1 }}
            disabled={isDisabled}
            onValueChange={handleValueChange}
            onSlidingComplete={handleSlidingComplete}
            value={internalValue}
            minimumValue={actualMin}
            maximumValue={actualMax}
            step={actualStep}
            minimumTrackTintColor={isDisabled ? "#a0a0a0" : Colors.light.background}
            maximumTrackTintColor={isDisabled ? "#a0a0a0" : Colors.light.background}
            thumbStyle={{ width: 28, height: 28, borderRadius: 28 / 2 }}
            thumbTintColor="white"
            animationType="spring"
          />
        </View>

        <Text style={styles.sliderValue}>
          {internalValue.toFixed(0)} {PARAMETERS[label]?.unit ?? ""}
        </Text>
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
