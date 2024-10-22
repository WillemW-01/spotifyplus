import React, { useState } from "react";
import { LocalState } from "@/app/(tabs)/mood";
import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { ColorValue, TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";
import { IoniconType } from "@/interfaces/ionicon";
import OnlineChecker from "./OnlineChecker";
import { SimplifiedPlayList } from "@/interfaces/playlists";

interface Props {
  title: string;
  subtitle: string;
  imageUri: string;
  onPress: () => void;
  width?: number;
  synced: LocalState;
  playlist: SimplifiedPlayList;
  // eslint-disable-next-line no-unused-vars
  downloadPlaylist: (
    // eslint-disable-next-line no-unused-vars
    playlist: SimplifiedPlayList,
    // eslint-disable-next-line no-unused-vars
    progressCallback?: React.Dispatch<React.SetStateAction<number>>
  ) => Promise<void>;
}

interface IconStyle {
  color: ColorValue;
  name: IoniconType;
  opacity: number;
}

const iconStyles = {
  synced: {
    color: "green",
    name: "checkmark-circle",
    opacity: 0.0,
  },
  unsynced: {
    color: "orange",
    name: "alert-circle",
    opacity: 0.5,
  },
  online: {
    color: "black",
    name: "globe",
    opacity: 0.0,
  },
} as { [key: string]: IconStyle };

const getShadowStyle = (synced: LocalState): ViewStyle => ({
  shadowColor: iconStyles[synced].color,
  shadowOpacity: synced == "online" ? 0.0 : 0.9,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 10,
});

export default function SyncedCard({
  title,
  subtitle,
  imageUri,
  onPress,
  width,
  synced,
  playlist,
  downloadPlaylist,
}: Props) {
  const style = iconStyles[synced] ?? {
    color: "orange",
    name: "alert-circle",
    opacity: 0.5,
  };

  const [show, setShow] = useState(false);

  const askForDownload = (synced: LocalState) => {
    console.log(`Asking for download with state ${synced}`);
    if (synced == "online" || synced == "unsynced") {
      setShow(true);
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Pressing button");
        askForDownload(synced);
      }}
      style={getShadowStyle(synced)}
    >
      <Card
        title={title}
        subtitle={subtitle}
        imageUri={imageUri}
        width={width ?? 90}
        onPress={() => askForDownload(synced)}
      />
      <View style={[styles.iconContainer, { backgroundColor: style.color }]}>
        <Ionicons name={style.name} color="white" size={25} />
      </View>
      <OnlineChecker
        show={show}
        setShow={setShow}
        playlist={playlist}
        downloadPlaylist={downloadPlaylist}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    top: 2,
    right: 2,
    borderRadius: 12,
  },
});
