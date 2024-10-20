import React from "react";
import { LocalState } from "@/app/(tabs)/mood";
import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface Props {
  title: string;
  subtitle: string;
  imageUri: string;
  onPress: () => void;
  width?: number;
  synced: LocalState;
}

const colors = {
  synced: "green",
  unsynced: "orange",
  online: "white",
};

const names = {
  synced: "checkmark-circle",
  unsynced: "alert-circle",
  online: "globe",
};

const opacities = {
  synced: 0.0,
  unsynced: 0.5,
  online: 0.1,
};

export default function SyncedCard({
  title,
  subtitle,
  imageUri,
  onPress,
  width,
  synced,
}: Props) {
  return (
    <View>
      <Card
        title={title}
        subtitle={subtitle}
        imageUri={imageUri}
        onPress={onPress}
        width={width ?? 90}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          backgroundColor: colors[synced],
          opacity: opacities[synced],
          width: width,
          height: width,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      ></View>
      <Ionicons
        name={names[synced]}
        color="white"
        size={25}
        style={{ position: "absolute", top: 0, right: 0 }}
      />
    </View>
  );
}
