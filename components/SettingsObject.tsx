import { Text, TouchableOpacity, View } from "react-native";
import SettingSlider from "./SettingSlider";
import React, { useState } from "react";
import { resolvers, SettingsObjectType } from "@/constants/resolverObjects";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  type: keyof typeof resolvers;
  resolverObj: SettingsObjectType;
  setResolverObj: React.Dispatch<React.SetStateAction<SettingsObjectType>>;
}

export default function SettingsObject({ type, resolverObj, setResolverObj }: Props) {
  const [slider, setSlider] = useState(0);
  const [key, setKey] = useState(0);

  const updateValue = (key: string, value: number) => {
    console.log(`Calling updateValue with key: ${key} and value: ${value}`);
    const tempObj = JSON.parse(JSON.stringify(resolverObj));
    console.log(`Before: `, tempObj.values[`${key}`]);
    tempObj.values[`${key}`] = value;
    console.log(`After: `, tempObj.values[`${key}`]);
    setResolverObj(tempObj);
  };

  const onReset = () => {
    console.log("Changing to default: ", resolvers[`${type}`]);
    setResolverObj(resolvers[`${type}`]);
    setKey((prev) => prev + 1);
  };

  return (
    <View key={key} style={{ flex: 1, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 20, color: "black" }}>Resolver settings:</Text>
        <TouchableOpacity onPress={onReset}>
          <Ionicons name="refresh-outline" size={25} color="black" />
        </TouchableOpacity>
      </View>
      {resolverObj.labels.map((label, index) => (
        <SettingSlider
          label={label}
          setValue={updateValue}
          min={resolverObj.params[label].min}
          max={resolverObj.params[label].max}
          step={resolverObj.params[label].step}
          initial={resolverObj.values[label]}
          key={index}
        />
      ))}
      {/* <SettingSlider label="theta" setValue={setSlider} />
      <SettingSlider label="gravitationalConstant" setValue={setSlider} />
      <SettingSlider label="centralGravity" setValue={setSlider} />
      <SettingSlider label="springLength" setValue={setSlider} />
      <SettingSlider label="springConstant" setValue={setSlider} />
      <SettingSlider label="damping" setValue={setSlider} />
      <SettingSlider label="avoidOverlap" setValue={setSlider} /> */}
    </View>
  );
}
