import React from "react";
import { Alert, Platform, TouchableOpacity, View } from "react-native";

import Card, { CardProps } from "@/components/Card";
import { Colors } from "@/constants/Colors";
import { LocalState } from "@/app/(tabs)/mood";
import { Ionicons } from "@expo/vector-icons";
import { getShadowStyle, iconStyles } from "@/utils/graphUtils";
import { Foundation } from "./GraphBuilder";

const NUDGE = 10;

interface SelectableCardProps extends CardProps {
  selected?: boolean;
  synced: LocalState;
  type: Foundation;
}

export default function SelectableCard({
  selected,
  type,
  synced,
  title,
  subtitle,
  imageUri,
  onPress,
  width,
}: SelectableCardProps) {
  return (
    iconStyles && (
      <TouchableOpacity
        onPress={() => {
          if (type == "artist") {
            onPress();
          } else {
            if (synced != "synced") {
              Alert.alert(
                "Download the playlist",
                "In order to use this playlist in the graph, you must first download it from the Mood page. Then come back and refresh this page.",
                [{ text: "Ok" }]
              );
            } else {
              onPress();
            }
          }
        }}
        style={[
          type != "artist" && "ios" && getShadowStyle(synced),
          {
            justifyContent: "center",
            alignItems: "center",
            height: "auto",
            width: width + NUDGE,
          },
        ]}
        activeOpacity={0.7}
      >
        {Platform.OS == "android" && type === "playlist" && synced != "online" && (
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
        {type != "artist" && (
          <View
            style={{
              backgroundColor: iconStyles[synced].color,
              position: "absolute",
              top: 2,
              right: 2,
              borderRadius: 12,
            }}
          >
            <Ionicons name={iconStyles[synced].name} color="white" size={25} />
          </View>
        )}
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
    )
  );
}
