import { useState } from "react";
import { useGlobals } from "@/hooks/Globals";
import { SafeAreaView, Text, View, Button, Alert } from "react-native";

import { usePlayback } from "@/hooks/usePlayback";

export default function Home() {
  const { isPlaying, curr, getPlayBackState, playTracks } = usePlayback();
  const { token, authorized } = useGlobals();

  const playSong = () => {
    playTracks([
      "spotify:track:0TVFCP4LM2CTn4uOhdQP4k",
      "spotify:track:5HD4hzwB33Jyr4vhQqLQit",
    ]);
  };

  return (
    <SafeAreaView>
      <View>
        <Text>Home : {token}</Text>
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

        <Text>Is playing? {isPlaying}</Text>
        {isPlaying && (
          <View>
            <Text>Song: {curr.title}</Text>
            <Text>Artist: {curr.artist}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
