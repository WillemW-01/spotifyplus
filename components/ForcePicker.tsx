import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { PHYSICS } from "@/constants/resolverObjects";

interface Props {
  parentWidth: number;
  setForce: React.Dispatch<React.SetStateAction<string>>;
  internalForce: string;
  setInternalForce: React.Dispatch<React.SetStateAction<string>>;
}

export default function ForcePicker({
  parentWidth,
  setForce,
  internalForce,
  setInternalForce,
}: Props) {
  return (
    <View style={{ width: parentWidth, height: "100%", padding: 10, maxHeight: 171 }}>
      <Text style={{ fontSize: 20, color: "black" }}>Physics resolver:</Text>
      <RNPickerSelect
        onValueChange={(value) => setInternalForce(value)}
        items={[
          { label: "Barnes Hut", value: PHYSICS.barnesHut },
          { label: "ForceAtlas2Based", value: PHYSICS.forceAtlas2Based },
          { label: "Repulsion", value: PHYSICS.repulsion },
          { label: "Hierarchical Repulsion", value: PHYSICS.hierarchicalRepulsion },
        ]}
        style={pickerInput}
        onDonePress={() => setForce(internalForce)}
        onClose={() => setForce(internalForce)}
      />
    </View>
  );
}

const pickerInput = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#e3e3e3",
    color: "#000000",
    paddingRight: 30,
  },
  placeholder: {
    color: "#686868",
    fontSize: 16,
  },
} as {
  [key: string]: ViewStyle | TextStyle;
};