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
import { TrackFeatureResponse } from "@/interfaces/tracks";

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
  const { getTrack, getRecent, getTracksNames, getSeveralTrackFeatures } = useTracks();
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

  const getInfoAllTracks = async (trackIds: string[]) => {
    console.log(`Getting features of ${trackIds.length} tracks`);
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
  //   for (let i = 0; i < features.length; i++) {
  //     console.log(`Matching name of ${features[i].id} (${i} / ${features.length})`);
  //     if (!features[i]?.artist || !features[i]?.name) {
  //       const response = await getTrack(features[i].id);
  //       features[i].name = response.name;
  //       features[i].artist = response.artists[0].name;
  //     }
  //     if (i % 200 == 0 && i != 0) {
  //       console.log(JSON.stringify(features));
  //     }
  //   }
  //   console.log(JSON.stringify(features));
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

const dummy = [
  {
    danceability: 0.696,
    energy: 0.859,
    key: 1,
    loudness: -2.999,
    mode: 1,
    speechiness: 0.0408,
    acousticness: 0.159,
    instrumentalness: 0,
    liveness: 0.0583,
    valence: 0.654,
    tempo: 92.048,
    type: "audio_features",
    id: "2dhhLFPhKgHI6uSBmTuNUJ",
    uri: "spotify:track:2dhhLFPhKgHI6uSBmTuNUJ",
    track_href: "https://api.spotify.com/v1/tracks/2dhhLFPhKgHI6uSBmTuNUJ",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/2dhhLFPhKgHI6uSBmTuNUJ",
    duration_ms: 200980,
    time_signature: 4,
  },
  {
    danceability: 0.624,
    energy: 0.909,
    key: 4,
    loudness: -3.079,
    mode: 0,
    speechiness: 0.0745,
    acousticness: 0.158,
    instrumentalness: 0,
    liveness: 0.0972,
    valence: 0.65,
    tempo: 93.982,
    type: "audio_features",
    id: "5YH1A3YttSay4lgAR75tk3",
    uri: "spotify:track:5YH1A3YttSay4lgAR75tk3",
    track_href: "https://api.spotify.com/v1/tracks/5YH1A3YttSay4lgAR75tk3",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/5YH1A3YttSay4lgAR75tk3",
    duration_ms: 188787,
    time_signature: 4,
  },
  {
    danceability: 0.692,
    energy: 0.931,
    key: 9,
    loudness: -3.499,
    mode: 1,
    speechiness: 0.0556,
    acousticness: 0.205,
    instrumentalness: 0,
    liveness: 0.0561,
    valence: 0.854,
    tempo: 90.007,
    type: "audio_features",
    id: "5EAiS7X3AveqJ0UjH7LusA",
    uri: "spotify:track:5EAiS7X3AveqJ0UjH7LusA",
    track_href: "https://api.spotify.com/v1/tracks/5EAiS7X3AveqJ0UjH7LusA",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/5EAiS7X3AveqJ0UjH7LusA",
    duration_ms: 187920,
    time_signature: 4,
  },
  {
    danceability: 0.742,
    energy: 0.859,
    key: 10,
    loudness: -4.942,
    mode: 1,
    speechiness: 0.0482,
    acousticness: 0.0824,
    instrumentalness: 0,
    liveness: 0.359,
    valence: 0.652,
    tempo: 95.046,
    type: "audio_features",
    id: "0JcNysfWVWaMS7R6vzGB2k",
    uri: "spotify:track:0JcNysfWVWaMS7R6vzGB2k",
    track_href: "https://api.spotify.com/v1/tracks/0JcNysfWVWaMS7R6vzGB2k",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/0JcNysfWVWaMS7R6vzGB2k",
    duration_ms: 194742,
    time_signature: 4,
  },
  {
    danceability: 0.759,
    energy: 0.648,
    key: 11,
    loudness: -3.955,
    mode: 0,
    speechiness: 0.0854,
    acousticness: 0.327,
    instrumentalness: 0,
    liveness: 0.0884,
    valence: 0.948,
    tempo: 167.825,
    type: "audio_features",
    id: "4MEhpZib6vCBCUhQfgF5fR",
    uri: "spotify:track:4MEhpZib6vCBCUhQfgF5fR",
    track_href: "https://api.spotify.com/v1/tracks/4MEhpZib6vCBCUhQfgF5fR",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/4MEhpZib6vCBCUhQfgF5fR",
    duration_ms: 188080,
    time_signature: 4,
  },
  {
    danceability: 0.774,
    energy: 0.931,
    key: 7,
    loudness: -2.48,
    mode: 1,
    speechiness: 0.0512,
    acousticness: 0.195,
    instrumentalness: 0,
    liveness: 0.0793,
    valence: 0.744,
    tempo: 92.026,
    type: "audio_features",
    id: "1fVN4Cv3vJ3KOXd6VY5o9U",
    uri: "spotify:track:1fVN4Cv3vJ3KOXd6VY5o9U",
    track_href: "https://api.spotify.com/v1/tracks/1fVN4Cv3vJ3KOXd6VY5o9U",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/1fVN4Cv3vJ3KOXd6VY5o9U",
    duration_ms: 187027,
    time_signature: 4,
  },
  {
    danceability: 0.702,
    energy: 0.914,
    key: 7,
    loudness: -2.934,
    mode: 0,
    speechiness: 0.0376,
    acousticness: 0.153,
    instrumentalness: 0,
    liveness: 0.0625,
    valence: 0.563,
    tempo: 96.991,
    type: "audio_features",
    id: "6tT4Ks1N04Ut0lSQ3xjSaZ",
    uri: "spotify:track:6tT4Ks1N04Ut0lSQ3xjSaZ",
    track_href: "https://api.spotify.com/v1/tracks/6tT4Ks1N04Ut0lSQ3xjSaZ",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/6tT4Ks1N04Ut0lSQ3xjSaZ",
    duration_ms: 190916,
    time_signature: 4,
  },
  {
    danceability: 0.725,
    energy: 0.76,
    key: 7,
    loudness: -7.462,
    mode: 1,
    speechiness: 0.0401,
    acousticness: 0.00255,
    instrumentalness: 0.0000377,
    liveness: 0.0764,
    valence: 0.449,
    tempo: 99.99,
    type: "audio_features",
    id: "7jVgYXrpn8T0ySdtLQH2kv",
    uri: "spotify:track:7jVgYXrpn8T0ySdtLQH2kv",
    track_href: "https://api.spotify.com/v1/tracks/7jVgYXrpn8T0ySdtLQH2kv",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/7jVgYXrpn8T0ySdtLQH2kv",
    duration_ms: 199227,
    time_signature: 4,
  },
  {
    danceability: 0.796,
    energy: 0.587,
    key: 5,
    loudness: -8.088,
    mode: 0,
    speechiness: 0.0462,
    acousticness: 0.0329,
    instrumentalness: 0,
    liveness: 0.0609,
    valence: 0.466,
    tempo: 113.036,
    type: "audio_features",
    id: "6hkr3LNGKUn1492Cr6YSAi",
    uri: "spotify:track:6hkr3LNGKUn1492Cr6YSAi",
    track_href: "https://api.spotify.com/v1/tracks/6hkr3LNGKUn1492Cr6YSAi",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/6hkr3LNGKUn1492Cr6YSAi",
    duration_ms: 190760,
    time_signature: 4,
  },
  {
    danceability: 0.715,
    energy: 0.787,
    key: 6,
    loudness: -5.253,
    mode: 1,
    speechiness: 0.0681,
    acousticness: 0.247,
    instrumentalness: 0,
    liveness: 0.106,
    valence: 0.567,
    tempo: 91.978,
    type: "audio_features",
    id: "2AXj2OER5TOKOK265UJLhQ",
    uri: "spotify:track:2AXj2OER5TOKOK265UJLhQ",
    track_href: "https://api.spotify.com/v1/tracks/2AXj2OER5TOKOK265UJLhQ",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/2AXj2OER5TOKOK265UJLhQ",
    duration_ms: 224027,
    time_signature: 4,
  },
  {
    danceability: 0.616,
    energy: 0.989,
    key: 9,
    loudness: -1.698,
    mode: 0,
    speechiness: 0.0483,
    acousticness: 0.166,
    instrumentalness: 0,
    liveness: 0.172,
    valence: 0.902,
    tempo: 95.036,
    type: "audio_features",
    id: "0OMRAvrtLWE2TvcXorRiB9",
    uri: "spotify:track:0OMRAvrtLWE2TvcXorRiB9",
    track_href: "https://api.spotify.com/v1/tracks/0OMRAvrtLWE2TvcXorRiB9",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/0OMRAvrtLWE2TvcXorRiB9",
    duration_ms: 203160,
    time_signature: 4,
  },
  {
    danceability: 0.656,
    energy: 0.877,
    key: 0,
    loudness: -3.231,
    mode: 0,
    speechiness: 0.0342,
    acousticness: 0.345,
    instrumentalness: 0,
    liveness: 0.349,
    valence: 0.894,
    tempo: 105.018,
    type: "audio_features",
    id: "3QHMxEOAGD51PDlbFPHLyJ",
    uri: "spotify:track:3QHMxEOAGD51PDlbFPHLyJ",
    track_href: "https://api.spotify.com/v1/tracks/3QHMxEOAGD51PDlbFPHLyJ",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/3QHMxEOAGD51PDlbFPHLyJ",
    duration_ms: 252347,
    time_signature: 4,
  },
  {
    danceability: 0.663,
    energy: 0.92,
    key: 11,
    loudness: -4.07,
    mode: 0,
    speechiness: 0.226,
    acousticness: 0.00431,
    instrumentalness: 0.0000169,
    liveness: 0.101,
    valence: 0.533,
    tempo: 99.935,
    type: "audio_features",
    id: "7DM4BPaS7uofFul3ywMe46",
    uri: "spotify:track:7DM4BPaS7uofFul3ywMe46",
    track_href: "https://api.spotify.com/v1/tracks/7DM4BPaS7uofFul3ywMe46",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/7DM4BPaS7uofFul3ywMe46",
    duration_ms: 259196,
    time_signature: 4,
  },
  {
    danceability: 0.718,
    energy: 0.792,
    key: 7,
    loudness: -3.519,
    mode: 1,
    speechiness: 0.105,
    acousticness: 0.0467,
    instrumentalness: 0.00000365,
    liveness: 0.0399,
    valence: 0.96,
    tempo: 90.949,
    type: "audio_features",
    id: "5M830cD7MNeiiwIGHzH9TV",
    uri: "spotify:track:5M830cD7MNeiiwIGHzH9TV",
    track_href: "https://api.spotify.com/v1/tracks/5M830cD7MNeiiwIGHzH9TV",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/5M830cD7MNeiiwIGHzH9TV",
    duration_ms: 243387,
    time_signature: 4,
  },
  {
    danceability: 0.689,
    energy: 0.808,
    key: 0,
    loudness: -3.28,
    mode: 1,
    speechiness: 0.0572,
    acousticness: 0.0721,
    instrumentalness: 0,
    liveness: 0.241,
    valence: 0.674,
    tempo: 91.012,
    type: "audio_features",
    id: "0mnAmQX1pciMncT2qFCNmK",
    uri: "spotify:track:0mnAmQX1pciMncT2qFCNmK",
    track_href: "https://api.spotify.com/v1/tracks/0mnAmQX1pciMncT2qFCNmK",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/0mnAmQX1pciMncT2qFCNmK",
    duration_ms: 207680,
    time_signature: 4,
  },
  {
    danceability: 0.766,
    energy: 0.756,
    key: 5,
    loudness: -5.861,
    mode: 1,
    speechiness: 0.132,
    acousticness: 0.213,
    instrumentalness: 0,
    liveness: 0.349,
    valence: 0.716,
    tempo: 94.027,
    type: "audio_features",
    id: "1RouRzlg8OKFeqc6LvdxmB",
    uri: "spotify:track:1RouRzlg8OKFeqc6LvdxmB",
    track_href: "https://api.spotify.com/v1/tracks/1RouRzlg8OKFeqc6LvdxmB",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/1RouRzlg8OKFeqc6LvdxmB",
    duration_ms: 230000,
    time_signature: 4,
  },
  {
    danceability: 0.563,
    energy: 0.877,
    key: 1,
    loudness: -2.082,
    mode: 0,
    speechiness: 0.12,
    acousticness: 0.0293,
    instrumentalness: 0,
    liveness: 0.0749,
    valence: 0.646,
    tempo: 93.832,
    type: "audio_features",
    id: "6f4UPdDBQONKJBRqwZGjaJ",
    uri: "spotify:track:6f4UPdDBQONKJBRqwZGjaJ",
    track_href: "https://api.spotify.com/v1/tracks/6f4UPdDBQONKJBRqwZGjaJ",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/6f4UPdDBQONKJBRqwZGjaJ",
    duration_ms: 209033,
    time_signature: 4,
  },
  {
    danceability: 0.722,
    energy: 0.738,
    key: 9,
    loudness: -6.073,
    mode: 0,
    speechiness: 0.247,
    acousticness: 0.328,
    instrumentalness: 0.0000147,
    liveness: 0.198,
    valence: 0.748,
    tempo: 198.075,
    type: "audio_features",
    id: "5cepAtqnEQ6yVG6088zMMu",
    uri: "spotify:track:5cepAtqnEQ6yVG6088zMMu",
    track_href: "https://api.spotify.com/v1/tracks/5cepAtqnEQ6yVG6088zMMu",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/5cepAtqnEQ6yVG6088zMMu",
    duration_ms: 184720,
    time_signature: 4,
  },
  {
    danceability: 0.799,
    energy: 0.807,
    key: 1,
    loudness: -3.981,
    mode: 1,
    speechiness: 0.0561,
    acousticness: 0.103,
    instrumentalness: 0.00000804,
    liveness: 0.0514,
    valence: 0.754,
    tempo: 94.016,
    type: "audio_features",
    id: "5VZvuKUJ3ulfBwfKhuVi1t",
    uri: "spotify:track:5VZvuKUJ3ulfBwfKhuVi1t",
    track_href: "https://api.spotify.com/v1/tracks/5VZvuKUJ3ulfBwfKhuVi1t",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/5VZvuKUJ3ulfBwfKhuVi1t",
    duration_ms: 198093,
    time_signature: 4,
  },
  {
    danceability: 0.663,
    energy: 0.86,
    key: 11,
    loudness: -5.711,
    mode: 0,
    speechiness: 0.127,
    acousticness: 0.00934,
    instrumentalness: 0.00000189,
    liveness: 0.0776,
    valence: 0.591,
    tempo: 100.017,
    type: "audio_features",
    id: "6Od2CkrUQYMYKu2GhwVMnp",
    uri: "spotify:track:6Od2CkrUQYMYKu2GhwVMnp",
    track_href: "https://api.spotify.com/v1/tracks/6Od2CkrUQYMYKu2GhwVMnp",
    analysis_url: "https://api.spotify.com/v1/audio-analysis/6Od2CkrUQYMYKu2GhwVMnp",
    duration_ms: 249048,
    time_signature: 4,
  },
];
