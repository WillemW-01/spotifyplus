import React, { useState } from "react";
import { LocalState } from "@/app/(tabs)/mood";
import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import OnlineChecker from "./OnlineChecker";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { iconStyles, NUDGE, getShadowStyle } from "@/utils/graphUtils";

interface Props {
  title: string;
  subtitle: string;
  imageUri: string;
  onPress: () => void;
  width?: number;
  synced: LocalState;
  playlist: SimplifiedPlayList;
  // eslint-disable-next-line no-unused-vars
  finishDownloadingPlaylist: (
    // eslint-disable-next-line no-unused-vars
    playlist: SimplifiedPlayList
    // eslint-disable-next-line no-unused-vars
  ) => Promise<void>;
}

export default function SyncedCard({
  title,
  subtitle,
  imageUri,
  onPress,
  width,
  synced,
  playlist,
  finishDownloadingPlaylist,
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
      style={[
        Platform.OS == "ios" && getShadowStyle(synced),
        {
          justifyContent: "center",
          alignItems: "center",
          height: "auto",
          width: width + NUDGE,
        },
      ]}
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
        finishDownloadingPlaylist={finishDownloadingPlaylist}
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
