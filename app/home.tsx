import { useEffect, useState } from "react";
import { useGlobals } from "@/hooks/Globals";
import {
  SafeAreaView,
  Text,
  View,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";

import { usePlayback } from "@/hooks/usePlayback";
import { useTracks } from "@/hooks/useTracks";
import { usePlayLists } from "@/hooks/usePlayList";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { useAuth } from "@/hooks/AuthContext";

export default function Home() {
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
  const { token } = useAuth();
  const { getRecent, getTracksNames } = useTracks();
  const { listPlayLists, getPlayListItemsIds } = usePlayLists();

  const [recent, setRecent] = useState<string[]>([]);
  const [playLists, setPlayLists] = useState<SimplifiedPlayList[]>([]);

  const authorized = Boolean(token);

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

  interface PlayListProps {
    playList: SimplifiedPlayList;
  }

  function PlayListButton({ playList }: PlayListProps) {
    return (
      <TouchableOpacity onPress={() => getPlayListItemsIds(playList.id)}>
        <Text>
          {playList.name} | {playList.id}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView>
      <View>
        <Text>Home</Text>
        <Button
          title="Start playback"
          onPress={playSong}
          disabled={!authorized}
        />
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
        <Button
          title="Toggle Shuffle"
          onPress={toggleShuffle}
          disabled={!authorized}
        />
        <Button
          title="List playlists"
          onPress={getPlayLists}
          disabled={!authorized}
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
          playLists.map((item, idx) => (
            <PlayListButton playList={item} key={idx} />
          ))}
      </View>
    </SafeAreaView>
  );
}
