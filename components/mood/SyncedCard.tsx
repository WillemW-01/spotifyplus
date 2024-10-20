import React, { useState } from "react";
import { LocalState } from "@/app/(tabs)/mood";
import Card from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { ColorValue, TouchableOpacity, View } from "react-native";
import { IoniconType } from "@/interfaces/ionicon";
import OnlineChecker from "./OnlineChecker";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { CustomPlaylist } from "@/interfaces/tracks";

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
    if (synced == "online" || synced == "unsynced") {
      setShow(true);
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity onPress={() => askForDownload(synced)}>
      <Card title={title} subtitle={subtitle} imageUri={imageUri} width={width ?? 90} />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: width,
          height: width,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      ></View>
      <View
        style={{
          position: "absolute",
          top: 2,
          right: 2,
          backgroundColor: style.color,
          borderRadius: 12,
        }}
      >
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
