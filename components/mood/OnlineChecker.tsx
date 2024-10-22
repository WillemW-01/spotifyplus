import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import ThemedProgressBar from "../ThemedProgressBar";
import Button from "@/components/Button";
import { CustomPlaylist } from "@/interfaces/tracks";

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  playlist: SimplifiedPlayList;
  downloadPlaylist: (
    // eslint-disable-next-line no-unused-vars
    playlist: SimplifiedPlayList,
    // eslint-disable-next-line no-unused-vars
    progressCallback?: React.Dispatch<React.SetStateAction<number>>
  ) => Promise<void>;
}

export default function OnlineChecker({
  show,
  setShow,
  playlist,
  downloadPlaylist,
}: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const step = 0.1;

  const onClose = () => {
    console.log("Closing online checker");
    setShow(false);
    setProgress(null);
  };

  const onDownload = async () => {
    console.log("Fetching features of playlist: ", playlist.name);
    setProgress(0);
    await downloadPlaylist(playlist, setProgress);
  };

  useEffect(() => {
    if (progress) {
      console.log(`Progress called: ${progress}`);
      if (progress >= 1) {
        console.log(`Progress is done: ${progress}`);
      }
    }
  }, [progress]);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Modal visible={show} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View
            style={{
              ...styles.modalView,
              backgroundColor: Colors.dark.backgroundLight,
            }}
          >
            <View style={{ flex: 1, justifyContent: "center" }}>
              {progress == null ? (
                <>
                  <Text style={styles.paragraph}>
                    The current playlist is either not downloaded yet, or is out of sync
                    with the latest online version.
                  </Text>
                  <Text style={styles.paragraph}>Do you wish to download it?</Text>
                </>
              ) : progress == 1 ? (
                <Text style={styles.paragraph}>Finished</Text>
              ) : (
                <Text style={styles.paragraph}>Downloading...</Text>
              )}
            </View>
            {progress == null ? (
              <View style={{ flexDirection: "row", gap: 20 }}>
                <Button title="Yes!" onPress={onDownload} />
                <Button title="Not now" onPress={onClose} />
              </View>
            ) : (
              <View style={{ gap: 10, alignItems: "center", width: "100%" }}>
                <ThemedProgressBar progress={progress} color="brand" showValue />
                <Button
                  title={progress == 1 ? "Done" : "Cancel"}
                  onPress={onClose}
                  paddingHorizontal={40}
                  height={40}
                  // disabled={progress < 1}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    padding: 30,
  },
  modalView: {
    width: "100%",
    height: "35%",
    margin: 20,
    borderRadius: 12,
    padding: 35,
    flexDirection: "column",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  paragraph: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: "white",
  },
});
