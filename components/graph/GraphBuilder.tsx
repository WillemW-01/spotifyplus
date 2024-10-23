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
import { useLogger } from "@/hooks/useLogger";
import { useDb } from "@/hooks/useDb";
import { LocalState } from "@/app/(tabs)/mood";
import useGraphUtils from "@/hooks/useGraphUtils";

interface FoundationButtonProps {
  toggleFoundation: () => void;
  foundationState: Foundation;
  assigned: Foundation;
}

function FoundationButton({
  toggleFoundation,
  foundationState,
  assigned,
}: FoundationButtonProps) {
  return (
    <Button
      title={assigned == "playlist" ? "Playlist" : "Top Artists"}
      onPress={toggleFoundation}
      style={styles.foundationButton}
      selected={foundationState == assigned}
      textStyle={{ fontSize: 25 }}
    />
  );
}

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line no-unused-vars
  onArtist?: ({ timeFrame, artists }: BuildGraphArtistsProps) => Promise<void>;
  onPlaylist?: ({
    // eslint-disable-next-line no-unused-vars
    playlistIds,
    // eslint-disable-next-line no-unused-vars
    connectionTypes,
  }: BuildGraphPlaylistProps) => Promise<void>;
  setHasChosen: React.Dispatch<React.SetStateAction<boolean>>;
  setGraphType: React.Dispatch<React.SetStateAction<Foundation>>;
}

export type TimeFrame = "short_term" | "medium_term" | "long_term";
export type Foundation = "artist" | "playlist";

export default function GraphBuilder({
  setVisible,
  onArtist,
  onPlaylist,
  setHasChosen,
  setGraphType,
}: ModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [isSynced, setIsSynced] = useState<LocalState[]>([]);
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
  const { addLog } = useLogger();
  const { getPlaylists } = useDb();
  const { checkStatus } = useGraphUtils();

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
      addLog(`Adding ${newConnection.name}`, "newArtistConnection");
      temp.push(newConnection);
    } else {
      addLog(`Removing ${newConnection.name}`, "newArtistConnection");
      temp.splice(temp.indexOf(newConnection), 1);
    }
    return temp;
  };

  const handleNewPlaylistConnection = (newConnection: Connection, temp: Connection[]) => {
    if (temp.length > 0) {
      addLog("Resetting playlist connection list", "newPlaylistConnection");
      temp.splice(0);
    }
    addLog(`Adding ${newConnection.name}`, "newPlaylistConnection");
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

  const fetchPlaylists = async () => {
    console.log("Loading playlists");
    const response = await listPlayLists();
    const dbResponse = await getPlaylists();
    const states: LocalState[] = await Promise.all(
      response.map((r) => checkStatus(r, dbResponse))
    );
    response.sort((a, b) => (b.name > a.name ? -1 : 1));

    setIsSynced(states);
    setPlayLists(response);
  };

  const loadArtists = async (timeFrame: "short_term" | "medium_term" | "long_term") => {
    setTimeFrame(timeFrame);
    console.log("Loading artists with timeframe ", timeFrame);
    const response = await getTopArtistsAll(timeFrame);
    response.sort((a, b) => (a.popularity > b.popularity ? -1 : 1));
    setArtists(response);
  };

  const onTermClick = (clickedTime: TimeFrame) => {
    if (timeFrame != clickedTime) {
      setSelectedArtists([]);
      setArtists([]);
      loadArtists(clickedTime);
    }
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
    setGraphType(foundation);
    onArtist && onPlaylist && buildFunction(foundation);
  };

  useEffect(() => {
    if (foundation == "playlist" && (!playlists || playlists?.length == 0)) {
      fetchPlaylists();
    } else if (foundation == "artist" && (!artists || artists?.length == 0)) {
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
            <FoundationButton
              assigned="playlist"
              toggleFoundation={toggleFoundation}
              foundationState={foundation}
            />
            <FoundationButton
              assigned="artist"
              toggleFoundation={toggleFoundation}
              foundationState={foundation}
            />
          </View>
        </Section>
        <Section title="Connection:">
          {CONNECTION_TYPES[foundation].map((c, i) => (
            <ConnectionButton
              key={i}
              title={
                c.name == "Album Genres" && c.type == "playlist"
                  ? c.name + " (WIP)"
                  : c.name
              }
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
                onPress={() => onTermClick("short_term")}
              />
              <Button
                title="medium"
                selected={timeFrame == "medium_term"}
                onPress={() => onTermClick("medium_term")}
              />
              <Button
                title="all time"
                selected={timeFrame == "long_term"}
                onPress={() => onTermClick("long_term")}
              />
            </View>
          )}
          {playlists.length > 0 && isSynced.length > 0 && (
            <CardGrid
              foundation={foundation}
              playlists={playlists}
              artists={artists}
              selectedPlaylists={selectedPlaylists}
              selectedArtists={selectedArtists}
              addArtist={addArtist}
              addPlaylist={addPlaylist}
              searchTerm={searchTerm}
              isSynced={isSynced}
            />
          )}
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
