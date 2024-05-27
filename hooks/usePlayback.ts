import { useState } from "react";
import { Alert } from "react-native";

import { useGlobals } from "@/hooks/Globals";
import { useRequestBuilder } from "@/hooks/useRequestBuilder";

import { PlaybackStateResponse } from "@/interfaces/player.me";
import { useAuth } from "./AuthContext";
import { PlayHistoryObject, RecentlyPlayed } from "@/interfaces/tracks";

interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  supports_volume: boolean;
  type: string;
  volume_percent: number;
}

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [curr, setCurr] = useState({
    title: "",
    artist: "",
  });
  const [phoneId, setPhoneId] = useState("");
  const [shouldShuffle, setShouldShuffle] = useState(false);

  const { token, authorized } = useAuth();
  const { buildPut, buildPost, buildGet } = useRequestBuilder();

  const getDevices = async (): Promise<Device[] | undefined> => {
    const response = await buildGet(
      "https://api.spotify.com/v1/me/player/devices"
    );

    if (response.ok) {
      console.log("sent okay!");
      const data = await response.json();
      return data.devices;
    } else {
      console.log("Not sent okay!");
      console.log(response.status);
    }
  };

  const getPhoneId = async (): Promise<string | null> => {
    if (phoneId) {
      return phoneId;
    }

    const devices = (await getDevices()) ?? [];
    const smartPhones = devices.filter((d) => d.type === "Smartphone");
    if (smartPhones.length > 0) {
      setPhoneId(smartPhones[0].id);
      return smartPhones[0].id;
    } else {
      return null;
    }
  };

  const getPlayBackState = async () => {
    if (!authorized) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    try {
      const response = await buildGet("https://api.spotify.com/v1/me/player");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(response);
      try {
        const data: PlaybackStateResponse = await response.json();
        console.log(data);
        setIsPlaying(Boolean(data.is_playing));
        setCurr({ title: data.item.name, artist: data.item.artists[0].name });
        console.log(`Is playing: `, data.is_playing);
        console.log(`Song name: `, data.item.name);
        console.log(`Artist: `, data.item.artists[0].name);
      } catch (err) {
        Alert.alert("You're not playing anything");
      }
    } catch (error) {
      Alert.alert("Playback error", (error as Error).message);
    }
  };

  const getRecent = async (): Promise<PlayHistoryObject[]> => {
    const url = `https://api.spotify.com/v1/me/player/recently-played?limit=30`;
    const response = await buildGet(url);

    if (!response.ok) {
      console.log("Didn't fetch recent okay! ", response.status);
    }

    const data: RecentlyPlayed = await response.json();

    console.log(data.items);

    return data.items;
  };

  const playTracks = async (uris: string[]) => {
    try {
      const phone = phoneId ?? (await getPhoneId());
      console.log(`Phone ID: `, phone);

      const url = `https://api.spotify.com/v1/me/player/play${
        phone ? `?device_id=${phone}` : ""
      }`;

      const requestBody = { uris: uris };

      const response = await buildPut(url, requestBody);

      if (response.ok) {
        console.log("sent okay!");
      } else {
        console.log("Not sent okay!");
        console.log(response.status);
      }
    } catch (err) {
      console.error("Error in playtrack: ", err);
    }
  };

  const playTrack = async (uri: string) => {
    return await playTracks([`spotify:track:${uri}`]);
  };

  const skipOrBack = async (isSkip: boolean) => {
    const phone = await getPhoneId();
    const url = `https://api.spotify.com/v1/me/player/${
      isSkip ? "next" : "previous"
    }?device_id=${phone}`;
    const response = await buildPost(url);
    if (!response.ok) {
      if (!isSkip && response.status == 403) {
        Alert.alert("There aren't any songs further back");
        return response.status;
      }

      console.log("Didn't skip properly! ", response.status);
      console.log(response);
    }
    return response.status;
  };

  const skip = async () => {
    return await skipOrBack(true);
  };

  const back = async () => {
    return await skipOrBack(false);
  };

  const toggleShuffle = async () => {
    console.log(`Toggling shuffle from ${shouldShuffle} to ${!shouldShuffle}`);
    const url = `https://api.spotify.com/v1/me/player/shuffle?state=${!shouldShuffle}`;
    console.log(url);
    const response = await buildPut(url, {});

    if (!response.ok) {
      console.log("Didn't toggle shuffle okay!");
      console.log(response.status);
      return;
    }

    setShouldShuffle((prev) => !prev);
  };

  return {
    getPlayBackState,
    getRecent,
    playTrack,
    playTracks,
    skip,
    back,
    toggleShuffle,
    shouldShuffle,
    isPlaying,
    curr,
  };
}
