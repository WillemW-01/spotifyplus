import React, { useState } from "react";
import { SafeAreaView, Text, View, Button, TouchableOpacity } from "react-native";

import { usePlayback } from "@/hooks/usePlayback";
import { useTracks } from "@/hooks/useTracks";
import { usePlayLists } from "@/hooks/usePlayList";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { useAuth } from "@/hooks/AuthContext";
import { router } from "expo-router";

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
  const { getRecent, getTracksNames, getTrackInfo } = useTracks();
  const { listPlayLists, getPlayListItemsIds } = usePlayLists();

  const [recent, setRecent] = useState<string[]>([]);
  const [playLists, setPlayLists] = useState<SimplifiedPlayList[]>([]);
  const [ids, setIds] = useState<string[] | null>([]);

  const playSong = () => {
    playTracks([
      "spotify:track:0TVFCP4LM2CTn4uOhdQP4k",
      "spotify:track:5HD4hzwB33Jyr4vhQqLQit",
    ]);
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
      const info = await getTrackInfo(trackIds[track]);
      return info;
    }
  };

  const clearTokens = async () => {
    console.log("Clearing tokens!");
    clearToken();
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