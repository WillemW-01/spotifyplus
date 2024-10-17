import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { ModalBaseProps } from "react-native";
import BrandGradient from "@/components/BrandGradient";
import { usePlayLists } from "@/hooks/usePlayList";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { Colors } from "@/constants/Colors";
import ThemedText from "@/components/ThemedText";
import Card, { CardProps } from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/graph/Button";
import ConnectionButton from "@/components/graph/ConnectionButton";
import SelectableCard from "@/components/graph/SelectableCard";

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onArtist?: () => void;
  onPlaylist?: (playlistId: string) => void;
  setHasChosen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={{ alignItems: "flex-start", width: "100%", gap: 15 }}>
      <Text style={styles.textStyle}>{title}</Text>
      {children}
    </View>
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
        style={styles.centeredView}
        contentContainerStyle={styles.scrollContent}
      >
        <Section title="Foundation:">
          <View style={styles.foundationButtonContainer}>
            <Button
              title="Playlist"
              onPress={() => {}}
              style={styles.foundationButton}
              selected
              textStyle={{ fontSize: 25 }}
            />
            <Button
              title="Top Artists"
              onPress={() => {}}
              style={styles.foundationButton}
              textStyle={{ fontSize: 25 }}
            />
          </View>
        </Section>
        <Section title="Connection:">
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
        </Section>
        <View style={styles.section}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text style={styles.textStyle}>Playlist(s):</Text>
            <TextInput
              placeholder="search"
              style={[styles.textStyle, styles.playlistInput]}
            />
          </View>
          <View style={styles.cardContainer}>
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
        style={styles.buildButton}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: "white", fontSize: 25 }}>Build</Text>
        <Ionicons name="build" color="white" size={30} />
      </TouchableOpacity>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  scrollContent: { alignItems: "center", gap: 25, paddingBottom: 80 },
  foundationButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    gap: 20,
  },
  foundationButton: {
    height: 60,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    width: "100%",
    alignItems: "flex-start",
    gap: 15,
  },
  playlistInput: {
    borderBottomWidth: 1,
    borderColor: "white",
    flex: 1,
    textAlign: "left",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
  },
  buildButton: {
    backgroundColor: Colors.dark.background,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    gap: 10,
    position: "absolute",
    bottom: 10,
  },
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
  },
});

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
