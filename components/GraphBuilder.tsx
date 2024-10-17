import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/graph/Button";
import ConnectionButton from "@/components/graph/ConnectionButton";
import SelectableCard from "@/components/graph/SelectableCard";
import GridBox from "./GridBox";
import { useUser } from "@/hooks/useUser";
import { TopArtist } from "@/interfaces/topItems";
import { SelectButtons } from "./graph/SelectButtons";
import { Connection, CONNECTION_TYPES } from "@/constants/graphConnections";

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

type TimeFrame = "short_term" | "medium_term" | "long_term";
export type Foundation = "artist" | "playlist";

export default function GraphBuilder({
  visible,
  setVisible,
  onArtist,
  onPlaylist,
  setHasChosen,
}: ModalProps) {
  const [secondVisible, setSecondVisible] = useState(false);
  const [playlists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [artists, setArtists] = useState<TopArtist[]>([]);
  const [foundation, setFoundation] = useState<Foundation>("playlist");
  const [connection, setConnection] = useState<Connection>(
    CONNECTION_TYPES[foundation][0]
  );
  const [selectedPlaylists, setSelectedPlaylists] = useState<SimplifiedPlayList[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<TopArtist[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("short_term");

  const { listPlayLists } = usePlayLists();
  const { getTopArtistsAll } = useUser();

  const toggleFoundation = () => {
    setFoundation((prev) => {
      const newValue = prev === "playlist" ? "artist" : "playlist";
      setConnection(CONNECTION_TYPES[newValue][0]);
      setSelectedPlaylists([]);
      setSelectedArtists([]);
      return newValue;
    });
  };

  const addPlaylist = (p: SimplifiedPlayList) => {
    if (!selectedPlaylists.includes(p)) {
      console.log(`Adding ${p.name}`);
      setSelectedPlaylists([...selectedPlaylists, p]);
    } else {
      console.log(`Removing ${p.name}`);
      const updated = selectedPlaylists.filter((p1) => p1 !== p);
      setSelectedPlaylists(updated);
    }
  };

  const addArtist = (a: TopArtist) => {
    if (!selectedArtists.includes(a)) {
      console.log(`Adding ${a.name}`);
      setSelectedArtists([...selectedArtists, a]);
    } else {
      console.log(`Removing ${a.name}`);
      const updated = selectedArtists.filter((a1) => a1 !== a);
      setSelectedArtists(updated);
    }
  };

  const loadPlaylists = async () => {
    console.log("Loading playlists");
    // setVisible(false);
    // setSecondVisible(true);

    const response = await listPlayLists();
    response.sort((a, b) => (b.name > a.name ? -1 : 1));
    setPlayLists(response);
  };

  const loadArtists = async (timeFrame: "short_term" | "medium_term" | "long_term") => {
    setTimeFrame(timeFrame);
    console.log("Loading artists with timeframe ", timeFrame);
    const response = await getTopArtistsAll(timeFrame);
    response.sort((a, b) => (a.popularity > b.popularity ? -1 : 1));
    setArtists(response);
  };

  // const onPlayListSecond = (playlistId: string) => {
  //   setSecondVisible(false);
  //   onPlaylist && onPlaylist(playlistId);
  //   setHasChosen(true);
  // };

  // const onArtistChosen = () => {
  //   console.log("Selected artists");
  //   setVisible(false);
  //   onArtist && onArtist();
  //   setHasChosen(true);
  // };

  useEffect(() => {
    if (
      foundation == "playlist" &&
      (!playlists || (playlists && playlists.length == 0))
    ) {
      loadPlaylists();
    } else if (foundation == "artist" && (!artists || (artists && artists.length == 0))) {
      loadArtists("short_term");
    }
  }, [foundation]);

  return (
    <BrandGradient style={{ alignItems: "center", width: "100%" }}>
      <ThemedText text="Graph Builder" type="title" style={{ marginBottom: 15 }} />
      <ScrollView
        style={styles.centeredView}
        contentContainerStyle={styles.scrollContent}
      >
        <Section title="Foundation:">
          <View style={styles.foundationButtonContainer}>
            <Button
              title="Playlist"
              onPress={toggleFoundation}
              style={styles.foundationButton}
              selected={foundation == "playlist"}
              textStyle={{ fontSize: 25 }}
            />
            <Button
              title="Top Artists"
              onPress={toggleFoundation}
              style={styles.foundationButton}
              selected={foundation == "artist"}
              textStyle={{ fontSize: 25 }}
            />
          </View>
        </Section>
        <Section title="Connection:">
          {CONNECTION_TYPES[foundation].map((c, i) => (
            <ConnectionButton
              key={i}
              title={c.name}
              body={c.description}
              selected={connection.name == c.name}
              onPress={() => setConnection(c)}
            />
          ))}
        </Section>
        <View style={styles.section}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text style={styles.textStyle}>
              {foundation.charAt(0).toUpperCase() + foundation.slice(1)}(s):
            </Text>
            <TextInput
              placeholder="search"
              style={[styles.textStyle, styles.playlistInput]}
            />
          </View>
          <SelectButtons
            foundation={foundation}
            playlists={playlists}
            artists={artists}
            selectedPlaylists={selectedPlaylists}
            selectedArtists={selectedArtists}
            setSelectedPlaylists={setSelectedPlaylists}
            setSelectedArtists={setSelectedArtists}
          />
          {foundation == "artist" && (
            <View style={styles.buttonContainer}>
              <Button
                title="recent"
                selected={timeFrame == "short_term"}
                onPress={() => timeFrame != "short_term" && loadArtists("short_term")}
              />
              <Button
                title="medium"
                selected={timeFrame == "medium_term"}
                onPress={() => timeFrame != "medium_term" && loadArtists("medium_term")}
              />
              <Button
                title="all time"
                selected={timeFrame == "long_term"}
                onPress={() => timeFrame != "long_term" && loadArtists("long_term")}
              />
            </View>
          )}

          <GridBox cols={4} gap={10} rowGap={10}>
            {foundation == "playlist"
              ? playlists &&
                playlists.map((p, i) => {
                  return (
                    <SelectableCard
                      key={i}
                      selected={selectedPlaylists.includes(p)}
                      title={p.name}
                      imageUri={p.images[0].url}
                      onPress={() => addPlaylist(p)}
                    />
                  );
                })
              : artists &&
                artists.map((a, i) => {
                  return (
                    <SelectableCard
                      key={i}
                      selected={selectedArtists.includes(a)}
                      title={a.name}
                      imageUri={a.images[0].url}
                      onPress={() => addArtist(a)}
                    />
                  );
                })}
          </GridBox>
        </View>
      </ScrollView>
      {(selectedArtists.length > 0 || selectedPlaylists.length > 0) && (
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buildButton}
          onPress={() => setVisible(true)}
        >
          <Text style={{ color: "white", fontSize: 25 }}>Build</Text>
          <Ionicons name="build" color="white" size={30} />
        </TouchableOpacity>
      )}
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    paddingHorizontal: 15,
    width: "100%",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  selectButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    gap: 20,
  },
  cardContainer: {
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
