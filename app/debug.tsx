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

import { SimplifiedPlayList } from "@/interfaces/playlists";

import { useAuth } from "@/hooks/AuthContext";
import { usePlayLists } from "@/hooks/usePlayList";
import { usePlayback } from "@/hooks/usePlayback";
import { useTracks } from "@/hooks/useTracks";
import { useArtist } from "@/hooks/useArtist";
import { useLastFm } from "@/hooks/useLastFM";
import { Track, TrackFeatureResponse } from "@/interfaces/tracks";

// import data from "@/scripts/features/features_workout_4_jesus.json";
import { TrackFeature } from "@/scripts/features/interfaces";

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
  const { clearToken, authorized } = useAuth();
  const {
    getTrack,
    getSeveralTracks,
    getRecent,
    getTracksNames,
    getSeveralTrackFeatures,
  } = useTracks();
  const { listPlayLists, getPlayListItemsIds } = usePlayLists();
  const { getArtistGenres } = useArtist();
  const { getTrackTopTags, getArtistTopTags } = useLastFm();

  const [recent, setRecent] = useState<string[]>([]);
  const [playLists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [ids, setIds] = useState<string[] | null>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

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
    setSelectedPlaylist(playlist.name);
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

  const getInfoAllTracks = async (trackIds: string[]) => {
    try {
      for (let i = 0; i < trackIds.length; i += 80) {
        const localMax = Math.min(i + 80, trackIds.length);
        console.log(`Getting ${i} - ${localMax} / ${trackIds.length}`);
        const info = await getSeveralTrackFeatures(trackIds.slice(i, localMax));
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        writeToFile(selectedPlaylist, JSON.stringify(info));
      }
      console.log("Sucessfully got all features");
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

  // async function matchSongIdsToNames() {
  //   const jump = 50;
  //   const features = data as TrackFeatureResponse[];
  //   try {
  //     for (let i = 0; i < features.length; i += jump) {
  //       const localFeatures = [] as TrackFeature[];
  //       const localMax = Math.min(i + jump, features.length);
  //       console.log(`Getting ${i} - ${localMax} / ${features.length}`);
  //       const ids = features.slice(i, localMax).map((f) => f.id);
  //       const tracksResponse = await getSeveralTracks(ids);
  //       const newTracks = tracksResponse.map((t, j) => {
  //         const { album, name, popularity, preview_url } = t;
  //         const customArtists = t.artists.map((a) => ({
  //           genres: a.genres,
  //           id: a.id,
  //           name: a.name,
  //           images: a.images,
  //         }));
  //         const newObj = {
  //           index: i + j,
  //           name,
  //           album: {
  //             name: album.name,
  //             id: album.id,
  //             artists: album.artists.map((a) => ({
  //               genres: a.genres,
  //               id: a.id,
  //               name: a.name,
  //               images: a.images,
  //             })),
  //           },
  //           artists: customArtists,
  //           popularity,
  //           preview_url,
  //           ...features[i + j],
  //           playlist: "workout_4_jesus",
  //         };
  //         return newObj;
  //       });
  //       console.log(newTracks[0]);
  //       localFeatures.push(...newTracks);
  //       writeToAll(JSON.stringify(localFeatures));
  //     }
  //   } catch (error) {
  //     console.log("Error at matching: ", error);
  //   }
  // }

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
          onPress={() => {
            ids && getInfoAllTracks(ids);
          }}
          disabled={!authorized}
        />
        <Button title="Clear tokens" onPress={clearTokens} />
        <Button title="Open Spotify" onPress={openSpotify} />

        <Button
          title="Get Artist Genres"
          onPress={() => getArtistGenres("2RQXRUsr4IW1f3mKyKsy4B", 0)}
        />

        <Button title="Test LastFM" onPress={testLastFM} />
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
