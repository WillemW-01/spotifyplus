import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { ModalBaseProps } from "react-native";
import BrandGradient from "./BrandGradient";
import { usePlayLists } from "@/hooks/usePlayList";
import { SimplifiedPlayList } from "@/interfaces/playlists";

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onArtist?: () => void;
  onPlaylist?: (playlistId: string) => void;
  setHasChosen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GraphModal({
  visible,
  setVisible,
  onArtist,
  onPlaylist,
  setHasChosen,
}: ModalProps) {
  const [secondVisible, setSecondVisible] = useState(false);
  const [playLists, setPlayLists] = useState<SimplifiedPlayList[]>([]);

  const { listPlayLists } = usePlayLists();

  const onPlaylistFirst = async () => {
    console.log("Selected playlists");
    setVisible(false);
    setSecondVisible(true);

    const response = await listPlayLists();
    response.sort((a, b) => (b.name > a.name ? -1 : 1));
    setPlayLists(response);
  };

  const onPlayListSecond = (playlistId: string) => {
    setSecondVisible(false);
    onPlaylist && onPlaylist(playlistId);
    setHasChosen(true);
  };

  const onArtistChosen = () => {
    console.log("Selected artists");
    setVisible(false);
    onArtist && onArtist();
    setHasChosen(true);
  };

  return (
    <BrandGradient style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          setVisible((prev) => !prev);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>What to use for building for graph?</Text>
            <View style={{ flexDirection: "row", gap: 20 }}>
              <TouchableOpacity
                style={styles.choiceButton}
                activeOpacity={0.7}
                onPress={onPlaylistFirst}
              >
                <Text style={styles.textStyle}>Playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.choiceButton}
                activeOpacity={0.7}
                onPress={onArtistChosen}
              >
                <Text style={styles.textStyle}>Top Artists</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setVisible((prev) => !prev)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={secondVisible}
        onRequestClose={() => {
          setSecondVisible((prev) => !prev);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView
              style={{ width: "100%", height: "50%" }}
              contentContainerStyle={{ gap: 10 }}
            >
              {playLists.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.listItem}
                  onPress={() => onPlayListSecond(p.id)}
                >
                  <Image
                    source={{ uri: p.images[0].url }}
                    style={{
                      width: 50,
                      height: 50,
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                    }}
                  />
                  <Text style={{ fontSize: 20, flex: 1 }} numberOfLines={2}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setSecondVisible((prev) => !prev)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={{ ...styles.button, ...styles.buttonOpen }}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.textStyle}>Choose graph mode</Text>
      </TouchableOpacity>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 20,
  },
  choiceButton: {
    flex: 1,
    height: 200,
    backgroundColor: "#e9495f",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#e9495f",
  },
  buttonClose: {
    backgroundColor: "#2c1e48",
  },
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 25,
  },
  modalText: {
    textAlign: "center",
    fontSize: 25,
  },
  listItem: {
    width: "100%",
    backgroundColor: "#2c1e4850",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: 10,
    paddingRight: 10,
  },
});
