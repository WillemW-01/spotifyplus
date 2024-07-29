import { View, Text } from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";

interface Props {
  label: string;
  setValue: (key: string, value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  initial?: number;
}

export default function SettingSlider({
  label,
  setValue,
  min,
  max,
  step,
  initial,
}: Props) {
  const [internalSlideValue, setInternalSlideValue] = useState(initial);

  return (
    <View
      style={
        {
          // alignItems: "center",
          // justifyContent: "space-between",
        }
      }
    >
      <Text style={{ fontSize: 15, color: "black", flex: 1 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Slider
          style={{
            flex: 1,
            backgroundColor: "white",
            maxHeight: 40,
          }}
          onValueChange={(value: number) => setInternalSlideValue(value)}
          onSlidingComplete={(value: number) => setValue(label, value)}
          minimumValue={min || 0}
          maximumValue={max || 5}
          step={step || 0.05}
          value={initial || 0.5}
          minimumTrackTintColor="#dedede"
          maximumTrackTintColor="#000000"
        />
        <Text style={{ width: 60, textAlign: "right" }}>
          {internalSlideValue && internalSlideValue.toFixed(3)}
        </Text>
      </View>
    </View>
  );
}
