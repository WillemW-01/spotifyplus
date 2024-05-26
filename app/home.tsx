import { useState } from "react";
import { useGlobals } from "@/hooks/Globals";
import { SafeAreaView, Text, View, Button, Alert } from "react-native";

import { usePlayback } from "@/hooks/usePlayback";
import { useTracks } from "@/hooks/useTracks";

export default function Home() {
  const { isPlaying, curr, getPlayBackState, playTracks } = usePlayback();
  const { authorized } = useGlobals();
  const { getRecent, getTracksNames } = useTracks();

  const [recent, setRecent] = useState<string[]>([]);

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
      </View>
    </SafeAreaView>
  );
}
