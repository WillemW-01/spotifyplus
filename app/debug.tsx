import { router } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

import { SimplifiedPlayList } from "@/interfaces/playlists";

import { useAuth } from "@/hooks/AuthContext";
import { usePlayLists } from "@/hooks/usePlayList";
import { usePlayback } from "@/hooks/usePlayback";
import { useTracks } from "@/hooks/useTracks";
import { useArtist } from "@/hooks/useArtist";
import { useLastFm } from "@/hooks/useLastFM";
import { Track, TrackFeatureResponse } from "@/interfaces/tracks";

import { TrackFeature } from "@/interfaces/tracks";
import { useSQLiteContext } from "expo-sqlite";
import { useDb } from "@/hooks/useDb";

// import data from "@/scripts/features/test.json";
// const sample = data as TrackFeature[];

export default function Debug() {
  const {
    isPlaying,
    curr,
    getPlayBackState,
    playTracks,
    skip,
    back,
    toggleShuffle,
    shouldShuffle,
  } = usePlayback();
  const { clearToken, authorized, shouldRefresh } = useAuth();
  const {
    getTrack,
    getSeveralTracks,
    getRecent,
    getTracksNames,
    getSeveralTrackFeatures,
  } = useTracks();
  const { listPlayLists, getPlayListItemsIds, fetchPlaylistFeatures } = usePlayLists();
  const { getArtistGenres } = useArtist();
  const { getTrackTopTags, getArtistTopTags } = useLastFm();

  const {
    statementsReady,
    insertNewSong,
    name,
    insertNewSongs,
    getSong,
    getPlaylistSongs,
    clearDb,
  } = useDb();

  const db = useSQLiteContext();
  useDrizzleStudio(db);

  const [recent, setRecent] = useState<string[]>([]);
  const [playLists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [ids, setIds] = useState<string[] | null>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlayList>(null);

  const playSong = () => {
    playTracks(["0TVFCP4LM2CTn4uOhdQP4k", "5HD4hzwB33Jyr4vhQqLQit"]);
  };

  const fetchRecent = async () => {
    const response = await getRecent(5);
    const names = getTracksNames(response.items);
    console.log(names);
    setRecent(names);
  };

  const getPlayLists = async () => {
    const res = await listPlayLists();
    // console.log("Got response: ", res);
    setPlayLists(res);
  };

  const getSongIds = async (playlist: SimplifiedPlayList) => {
    // console.log(`Getting ids of ${playlist.name}: ${JSON.stringify(playlist)}`);
    const ids = await getPlayListItemsIds(playlist.id);
    setSelectedPlaylist(playlist);
    console.log(ids);
    setIds(ids);
  };

  async function writeToFile(fileName: string, toWrite: string) {
    const response = await fetch("http://192.168.2.93:3000/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: fileName,
        content: toWrite,
      }),
    });
    if (!response.ok) {
      console.error(`Error: ${response.status}`);
    }
  }

  async function writeToAll(toWrite: string) {
    try {
      const response = await fetch("http://192.168.2.93:3000/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: toWrite,
        }),
      });
      if (!response.ok) {
        console.error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.log("errro at writeToAll: ", error);
    }
  }

  const getPlaylistFeatures = async () => {
    try {
      if (selectedPlaylist) {
        const result = await fetchPlaylistFeatures(selectedPlaylist);
        if (result) {
          console.log(
            `Sucessfully got all ${result.length} tracks. E.g.: ${JSON.stringify(
              result[0]
            )}`
          );

          console.log(
            `Statements exist on ${name} database. Inserting test sample: ${result.map(
              (s) => s.name
            )}`
          );
          const res = await insertNewSongs(result);
          console.log(JSON.stringify(res));
        }
      } else {
        console.log("no playlist selected");
      }
    } catch (error) {
      console.log("Error at debug: ", error);
    }
  };

  const clearTokens = async () => {
    console.log("Clearing tokens!");
    clearToken();
  };

  const openSpotify = async () => {
    try {
      Linking.openURL("spotify://open");
    } catch (error) {
      console.log(error);
    }
  };

  const testLastFM = async () => {
    // const results = await getTrackTopTags("Dans in Afrikaans", "Kurt Darren");
    const results = await getArtistTopTags("Kurt Darren");
    console.log("results: ", JSON.stringify(results));
  };

  const testToken = async () => {
    const isExpired = await shouldRefresh();
    console.log(`Is expired: ${isExpired}`);

    const response = await listPlayLists();
    console.log(response ? `Response came back: ${response.length}` : `Error`);
  };

  const testStatement = async () => {
    if (statementsReady()) {
      // try {
      //   console.log(
      //     `Statements exist on ${name} database. Inserting test sample: ${sample.map(
      //       (s) => s.name
      //     )}`
      //   );
      //   const res = await insertNewSongs(sample);
      //   console.log(JSON.stringify(res));
      // } catch (error) {
      //   console.log(`Error at insert: `, error);
      // }
    } else {
      console.log("Statement not existing");
    }
  };

  const queryDb = async () => {
    if (statementsReady()) {
      console.log(`Statements exist on ${name} database. Fetching all songs`);
      const songs = (await getPlaylistSongs(selectedPlaylist.id)) as TrackFeature[];
      console.log(`Came back: ${JSON.stringify(songs)}`);
    }
  };

  const clear = async () => {
    if (statementsReady()) {
      console.log("Clearing db");
      await clearDb();
    }
  };

  interface PlayListProps {
    playList: SimplifiedPlayList;
  }

  function PlayListButton({ playList }: PlayListProps) {
    return (
      <TouchableOpacity
        onPress={() => getSongIds(playList)}
        style={{
          height: 35,
          backgroundColor: "#dedede",
          width: 100,
          borderRadius: 5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>{playList.name}</Text>
      </TouchableOpacity>
    );
  }

  const toTabs = () => {
    router.navigate("/(tabs)/");
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Home</Text>
        <Button title="To Tabs" onPress={toTabs} />
        <Button title="Start playback" onPress={playSong} disabled={!authorized} />
        <Button
          title="Get playback state"
          onPress={getPlayBackState}
          disabled={!authorized}
        />

        <Button
          title="Get recently played"
          onPress={fetchRecent}
          disabled={!authorized}
        />

        <Button title="Skip" onPress={skip} disabled={!authorized} />
        <Button title="Back" onPress={back} disabled={!authorized} />
        <Button title="Toggle Shuffle" onPress={toggleShuffle} disabled={!authorized} />
        <Button title="List playlists" onPress={getPlayLists} disabled={!authorized} />
        <Button
          title="Get song features"
          onPress={getPlaylistFeatures}
          disabled={!authorized}
        />
        <Button title="Clear tokens" onPress={clearTokens} />
        <Button title="Open Spotify" onPress={openSpotify} />

        <Button
          title="Get Artist Genres"
          onPress={() => getArtistGenres("2RQXRUsr4IW1f3mKyKsy4B", 0)}
        />

        <Button title="Test LastFM" onPress={testLastFM} />

        <Button title="Test token expiration" onPress={testToken} />
        <Button title="Test db statement" onPress={testStatement} />
        <Button title="Get users" onPress={queryDb} />
        <Button title="Clear db" onPress={clear} />
        {/* <Button title="Match song names" onPress={matchSongIdsToNames} /> */}

        <Text>Should shuffle: {String(shouldShuffle)}</Text>

        <Text>Is playing? {isPlaying}</Text>
        {isPlaying && (
          <View>
            <Text>Song: {curr.title}</Text>
            <Text>Artist: {curr.artist}</Text>
          </View>
        )}

        {recent &&
          recent.map((item, idx) => (
            <View key={idx}>
              <Text>{JSON.stringify(item)}</Text>
            </View>
          ))}

        {playLists && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              width: "100%",
              justifyContent: "center",
            }}
          >
            {playLists.map((item, idx) => (
              <PlayListButton playList={item} key={idx} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
