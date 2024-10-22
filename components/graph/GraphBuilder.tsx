import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ModalBaseProps,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BrandGradient from "@/components/BrandGradient";
import ThemedText from "@/components/ThemedText";
import Button from "@/components/graph/Button";
import CardGrid from "@/components/graph/CardList";
import ConnectionButton from "@/components/graph/ConnectionButton";
import { SelectButtons } from "@/components/graph/SelectButtons";

import { Colors } from "@/constants/Colors";
import { Connection, CONNECTION_TYPES } from "@/constants/graphConnections";

import { BuildGraphArtistsProps, BuildGraphPlaylistProps } from "@/hooks/useGraphData";
import { usePlayLists } from "@/hooks/usePlayList";
import { useUser } from "@/hooks/useUser";

import { SimplifiedPlayList } from "@/interfaces/playlists";
import { TopArtist } from "@/interfaces/topItems";
import Section from "./sections/Section";

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onArtist?: ({ timeFrame, artists }: BuildGraphArtistsProps) => Promise<void>;
  onPlaylist?: ({
    playlistIds,
    connectionTypes,
  }: BuildGraphPlaylistProps) => Promise<void>;
  setHasChosen: React.Dispatch<React.SetStateAction<boolean>>;
}

export type TimeFrame = "short_term" | "medium_term" | "long_term";
export type Foundation = "artist" | "playlist";

export default function GraphBuilder({
  setVisible,
  onArtist,
  onPlaylist,
  setHasChosen,
}: ModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [artists, setArtists] = useState<TopArtist[]>([]);
  const [foundation, setFoundation] = useState<Foundation>("playlist");
  const [connections, setConnections] = useState<Connection[]>([
    CONNECTION_TYPES[foundation][0],
  ]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<SimplifiedPlayList[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<TopArtist[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("short_term");

  const { listPlayLists } = usePlayLists();
  const { getTopArtistsAll } = useUser();

  const updateConnections = (newConnection: Connection) => {
    setConnections((prev) => {
      console.log(prev);
      const temp = [...prev];
      console.log(`type: ${newConnection.type}`);
      switch (newConnection.type) {
        case "artist":
          return handleNewArtistConnection(newConnection, temp);
        case "playlist":
          return handleNewPlaylistConnection(newConnection, temp);
      }
    });
  };

  const handleNewArtistConnection = (newConnection: Connection, temp: Connection[]) => {
    if (!temp.includes(newConnection)) {
      console.log(`Adding ${newConnection.name}`);
      temp.push(newConnection);
    } else {
      console.log(`Removing ${newConnection.name}`);
      temp.splice(temp.indexOf(newConnection), 1);
    }
    return temp;
  };

  const handleNewPlaylistConnection = (newConnection: Connection, temp: Connection[]) => {
    if (temp.length > 0) {
      temp.splice(0);
    }
    temp.push(newConnection);
    return temp;
  };

  const toggleFoundation = () => {
    setFoundation((prev) => {
      const newValue = prev === "playlist" ? "artist" : "playlist";
      setConnections([CONNECTION_TYPES[newValue][0]]);
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

  const buildFunction = (foundation: Foundation) => {
    switch (foundation) {
      case "artist":
        onArtist({
          timeFrame,
          artists: selectedArtists,
          connectionTypes: connections.filter((c) => c.type == "artist"),
        });
        break;
      case "playlist":
        onPlaylist({
          playlistIds: selectedPlaylists.map((p) => p.id),
          connectionTypes: connections.filter((c) => c.type === "playlist"),
        });
        break;
    }
  };

  const buildGraph = () => {
    setVisible(false);
    setHasChosen(true);
    onArtist && onPlaylist && buildFunction(foundation);
  };

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
              selected={connections.map((c) => c.name).includes(c.name)}
              onPress={() => updateConnections(c)}
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
              // value={queryRef.current}
              onChangeText={setSearchTerm}
              value={searchTerm}
              clearButtonMode="while-editing"
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

          <CardGrid
            foundation={foundation}
            playlists={playlists}
            artists={artists}
            selectedPlaylists={selectedPlaylists}
            selectedArtists={selectedArtists}
            addArtist={addArtist}
            addPlaylist={addPlaylist}
            searchTerm={searchTerm}
          />
        </View>
      </ScrollView>
      {(selectedArtists.length > 0 || selectedPlaylists.length > 0) && (
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buildButton}
          onPress={buildGraph}
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