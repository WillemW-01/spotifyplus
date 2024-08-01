import { router } from "expo-router";
import React, { useState } from "react";
import { Button, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";

import { SimplifiedPlayList } from "@/interfaces/playlists";

import { useAuth } from "@/hooks/AuthContext";
import { usePlayLists } from "@/hooks/usePlayList";
import { usePlayback } from "@/hooks/usePlayback";
import { useTracks } from "@/hooks/useTracks";
import { useArtist } from "@/hooks/useArtist";

const KAHAN_ARTIST_ID = "2RQXRUsr4IW1f3mKyKsy4B";
const KAHAN_ALBUM_ID = "50ZenUP4O2Q5eCy2NRNvuz";

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
  const { getRecent, getTracksNames, getTrackFeatures } = useTracks();
  const { listPlayLists, getPlayListItemsIds } = usePlayLists();
  const { getArtistGenres } = useArtist();

  const [recent, setRecent] = useState<string[]>([]);
  const [playLists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [ids, setIds] = useState<string[] | null>([]);

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
    console.log("Got response: ", res);
    setPlayLists(res);
  };

  const getSongIds = async (playListId: string) => {
    const ids = await getPlayListItemsIds(playListId);
    console.log(ids);
    setIds(ids);
  };

  const getInfoAllTracks = async (trackIds: string[]) => {
    for (const track in trackIds) {
      const info = await getTrackFeatures(trackIds[track]);
      return info;
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

  interface PlayListProps {
    playList: SimplifiedPlayList;
  }

  function PlayListButton({ playList }: PlayListProps) {
    return (
      <TouchableOpacity onPress={() => getSongIds(playList.id)}>
        <Text>
          {playList.name} | {playList.id}
        </Text>
      </TouchableOpacity>
    );
  }

  const toTabs = () => {
    router.navigate("/(tabs)/");
  };

  return (
    <SafeAreaView>
      <View>
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

        {playLists &&
          playLists.map((item, idx) => <PlayListButton playList={item} key={idx} />)}
      </View>
    </SafeAreaView>
  );
}
