import React from "react";
import { Alert, Platform, TouchableOpacity, View } from "react-native";

import Card, { CardProps } from "@/components/Card";
import { Colors } from "@/constants/Colors";
import { LocalState } from "@/app/(tabs)/mood";
import { getShadowStyle, iconStyles } from "../mood/SyncedCard";
import { Ionicons } from "@expo/vector-icons";

const NUDGE = 10;

interface SelectableCardProps extends CardProps {
  selected?: boolean;
  synced: LocalState;
}

export default function SelectableCard({
  selected,
  synced,
  title,
  subtitle,
  imageUri,
  onPress,
  width,
}: SelectableCardProps) {
  const style = iconStyles[synced] ?? {
    color: "orange",
    name: "alert-circle",
    opacity: 0.5,
  };

  return (
    <TouchableOpacity
      onPress={() => {
        synced == "synced"
          ? onPress()
          : Alert.alert(
              "Download the playlist",
              "In order to use this playlist in the graph, you must first download it from the Mood page. Then come back and refresh this page.",
              [{ text: "Ok" }]
            );
      }}
      style={[
        Platform.OS == "ios" && getShadowStyle(synced),
        {
          justifyContent: "center",
          alignItems: "center",
          height: "auto",
          width: width + NUDGE,
        },
      ]}
      activeOpacity={0.7}
    >
      {Platform.OS == "android" && synced != "online" && (
        <View
          style={{
            width: width + NUDGE,
            height: width + NUDGE,
            left: 0,
            top: -NUDGE / 2,
            borderRadius: 16,
            opacity: 0.6,
            backgroundColor: iconStyles[synced].color,
            position: "absolute",
          }}
        />
      )}
      <Card
        title={title}
        subtitle={subtitle ?? ""}
        imageUri={imageUri}
        width={width}
        disabled
      />
      <View
        style={{
          backgroundColor: style.color,
          position: "absolute",
          top: 2,
          right: 2,
          borderRadius: 12,
        }}
      >
        <Ionicons name={style.name} color="white" size={25} />
      </View>
      <View
        style={{
          position: "absolute",
          width: width,
          height: width,
          left: NUDGE / 2,
          top: 0,
          borderRadius: 12,
          opacity: selected ? 0 : 0.5,
          backgroundColor: selected ? null : Colors.dark.grey,
        }}
      />
    </TouchableOpacity>
  );
}
