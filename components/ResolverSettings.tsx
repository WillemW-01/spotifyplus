import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import SettingSlider from "./SettingSlider";
import React, { useState } from "react";
import { resolvers, SettingsObjectType } from "@/constants/resolverObjects";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  type: keyof typeof resolvers;
  resolverObj: SettingsObjectType;
  setResolverObj: React.Dispatch<React.SetStateAction<SettingsObjectType>>;
  parentWidth: number;
}

export default function ResolverSettings({
  type,
  resolverObj,
  setResolverObj,
  parentWidth,
}: Props) {
  const [key, setKey] = useState(0);

  const updateValue = (key: string, value: number) => {
    const tempObj = JSON.parse(JSON.stringify(resolverObj));
    tempObj.values[`${key}`] = value;
    setResolverObj(tempObj);
  };

  const onReset = () => {
    console.log("Changing back to default: ", resolvers[`${type}`].values);
    setResolverObj(resolvers[`${type}`]);
    setKey((prev) => prev + 1);
  };

  return (
    <ScrollView
      key={key}
      style={{ width: parentWidth, height: "100%", padding: 10, maxHeight: 171 }}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 20,
      }}
    >
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
    </ScrollView>
  );
}
