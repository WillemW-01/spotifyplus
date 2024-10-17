import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInput,
} from "react-native";
import { ModalBaseProps } from "react-native";
import BrandGradient from "./BrandGradient";
import { usePlayLists } from "@/hooks/usePlayList";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { Colors } from "@/constants/Colors";
import ThemedText from "./ThemedText";
import Card, { CardProps } from "./Card";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/graph/Button";

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onArtist?: () => void;
  onPlaylist?: (playlistId: string) => void;
  setHasChosen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ConnectionProps {
  title: string;
  body: string;
  onPress: () => void;
  selected: boolean;
}

function ConnectionButton({ title, body, onPress, selected }: ConnectionProps) {
  return (
    <View style={{ width: "100%", alignItems: "flex-end" }}>
      <Button
        title={title}
        onPress={onPress}
        selected={selected}
        style={{ width: "100%", borderBottomRightRadius: 0 }}
        textStyle={{ fontSize: 25 }}
      />
      <View
        style={{
          width: "90%",
          backgroundColor: Colors.dark.lightMedium,
          borderBottomRightRadius: 10,
          borderBottomLeftRadius: 10,
          padding: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>{body}</Text>
      </View>
    </View>
  );
}

interface SelectableCardProps extends CardProps {
  selected?: boolean;
}

function SelectableCard({
  selected,
  title,
  subtitle,
  imageUri,
  onPress,
  width,
}: SelectableCardProps) {
  return (
    <TouchableOpacity
      onPress={() => console.log("Card Pressed")}
      style={{ width: width }}
    >
      <Card title={title} subtitle={subtitle ?? ""} imageUri={imageUri} width={width} />
      <View
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          width: 30,
          height: 30,
          backgroundColor: selected ? Colors.dark.backgroundAlt : Colors.dark.grey,
          borderRadius: 8,
        }}
      />
    </TouchableOpacity>
  );
}

export default function GraphBuilder({
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
    <BrandGradient style={{ alignItems: "center" }}>
      <ThemedText text="Graph Builder" type="title" style={{ marginBottom: 15 }} />
      <ScrollView
        style={{ ...styles.centeredView }}
        contentContainerStyle={{ alignItems: "center", gap: 25, paddingBottom: 80 }}
      >
        <View style={{ alignItems: "flex-start", width: "100%", gap: 15 }}>
          <Text style={styles.textStyle}>Foundation:</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
              paddingHorizontal: 20,
              gap: 20,
            }}
          >
            <Button
              title="Playlist"
              onPress={() => {}}
              style={{
                height: 60,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              selected
              textStyle={{ fontSize: 25 }}
            />
            <Button
              title="Top Artists"
              onPress={() => {}}
              style={{
                height: 60,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              textStyle={{ fontSize: 25 }}
            />
          </View>
        </View>
        <View style={{ width: "100%", alignItems: "flex-start", gap: 15 }}>
          <Text style={styles.textStyle}>Connection:</Text>
          <ConnectionButton
            title="Song Features"
            body="This is my body text"
            selected={true}
            onPress={() => {}}
          />
          <ConnectionButton
            title="Shared Artists"
            body="This is my body text"
            selected={false}
            onPress={() => {}}
          />
          <ConnectionButton
            title="Album Genres"
            body="This is my body text"
            selected={false}
            onPress={() => {}}
          />
        </View>
        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            gap: 15,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text style={styles.textStyle}>Playlist(s):</Text>
            <TextInput
              placeholder="search"
              style={{
                ...styles.textStyle,
                borderBottomWidth: 1,
                borderColor: "white",
                flex: 1,
                textAlign: "left",
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <SelectableCard width={100} selected />
            <SelectableCard width={100} />
            <SelectableCard width={100} />
            <SelectableCard width={100} selected />
            <SelectableCard width={100} />
            <SelectableCard width={100} />
            <SelectableCard width={100} />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          backgroundColor: Colors.dark.background,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderRadius: 12,
          padding: 15,
          gap: 10,
          position: "absolute",
          bottom: 10,
        }}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: "white", fontSize: 25 }}>Build</Text>
        <Ionicons name="build" color="white" size={30} />
      </TouchableOpacity>
    </BrandGradient>
  );
}

/**
 * 
 * 
 *       <Modal
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
 */

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    paddingHorizontal: 15,
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
    borderRadius: 12,
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
    fontSize: 28,
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
