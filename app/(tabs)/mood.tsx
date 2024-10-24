import React, { useEffect, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import BrandGradient from "@/components/BrandGradient";
import MoodCustomizer from "@/components/mood/MoodCustomizer";
import SortPicker from "@/components/mood/SortPicker";
import SyncedCard from "@/components/mood/SyncedCard";
import ThemedText from "@/components/ThemedText";

import { Colors } from "@/constants/Colors";
import { PREDICATES, Preset, PRESETS, TrackFeatures } from "@/constants/sliderPresets";

import { useAuth } from "@/hooks/AuthContext";
import { useDb } from "@/hooks/useDb";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayLists } from "@/hooks/usePlayList";
import { useTracks } from "@/hooks/useTracks";

import { SimplifiedPlayList } from "@/interfaces/playlists";
import { CustomPlaylist } from "@/interfaces/tracks";
import { useLogger } from "@/hooks/useLogger";
import useGraphUtils from "@/hooks/useGraphUtils";

export type LocalState = "online" | "unsynced" | "synced";
export type SortCritera = "alpha" | "size";
export type UpdateStatus = "" | "downloading" | "inserting" | "done";

const SORT_PREDICATES: {
  // eslint-disable-next-line no-unused-vars
  [K in SortCritera]: (a: SimplifiedPlayList, b: SimplifiedPlayList) => -1 | 1;
} = {
  alpha: (a, b) => {
    return b.name > a.name ? 1 : -1;
  },
  size: (a, b) => {
    return b.tracks.total > a.tracks.total ? 1 : -1;
  },
};

export default function Mood() {
  const [playlists, setPlaylists] = useState<SimplifiedPlayList[]>([]);
  const [localPlaylists, setLocalPlaylists] = useState<CustomPlaylist[]>([]);
  const [outOfDate, setOutOfDate] = useState<LocalState[]>([]);
  const [sliderValues, setSliderValues] = useState<Preset>(PRESETS.default);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customerizerVisible, setCustomizerVisible] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("");

  const currPlayList = useRef<SimplifiedPlayList | null>(null);

  const { authorized } = useAuth();
  const { playTracks } = usePlayback();
  const { listPlayLists, fetchPlaylistFeatures } = usePlayLists();
  const theme = useColorScheme() ?? "dark";
  const { fitsInPreset } = useTracks();
  const { getPlaylists, insertNewSongs, getPlaylistSongs } = useDb();
  const { addLog, logWarn, logError } = useLogger();
  const { checkStatus } = useGraphUtils();

  const updateValue = (featureName: keyof TrackFeatures, value: number) => {
    setSliderValues((prev) => {
      return {
        ...prev,
        [featureName]: { value: value, stdDev: prev[featureName].stdDev },
      };
    });
  };

  const resetSliders = () => {
    setSliderValues(PRESETS.default);
  };

  const setSlidersTo = (mood: keyof typeof PRESETS) => {
    setSliderValues(PRESETS[mood]);
  };

  const checkStatusOutside = async (playlist: SimplifiedPlayList) => {
    const dbResponse = await getPlaylists();
    const status = await checkStatus(playlist, dbResponse);
    addLog(`Status of ${playlist.name} = ${status}`, "checkStatusOutside");
    if (playlists.length > 0 && outOfDate.length > 0) {
      const index = playlists.findIndex((online) => online.id == playlist.id);
      setOutOfDate((prev) => {
        const temp = [...prev];
        temp[index] = status;
        addLog(`Setting outofdate[${index}] = ${status}`, "checkStatusOutside");
        return temp;
      });
    } else {
      logWarn(
        `Cant set updated status because playlists and outofdate are not loaded`,
        "checkStatusOutside"
      );
    }
  };

  const finishDownloadingPlaylist = async (playlist: SimplifiedPlayList) => {
    await checkStatusOutside(playlist);
  };

  const fetchPlaylists = async () => {
    const response = await listPlayLists();
    const dbResponse = await getPlaylists();
    const states: LocalState[] = await Promise.all(
      response.map((r) => checkStatus(r, dbResponse))
    );

    setPlaylists(response);
    setOutOfDate(states);
  };

  const reOrderPlaylists = async (criteria: SortCritera, ascending = false) => {
    setPlaylists((prev) => {
      const temp = [...prev];
      const tempOutOfDate = [...outOfDate];

      const order = ascending ? 1 : -1;

      const indices = temp.map((_, i) => i);

      indices.sort((i, j) => order * SORT_PREDICATES[criteria](temp[i], temp[j]));

      const sortedPlaylists = indices.map((i) => temp[i]);
      const sortedOtherArray = indices.map((i) => tempOutOfDate[i]);

      setOutOfDate(sortedOtherArray);
      return sortedPlaylists;
    });
  };

  const onPlay = async (mood?: keyof typeof PRESETS) => {
    if (currPlayList.current) {
      const tracks = await getPlaylistSongs(currPlayList.current.id); // local
      if (!tracks) return;
      addLog(`Getting tracks with sliders: ${sliderValues}`, "onPlay");
      addLog(`Before filtering: ${tracks.length}`, "onPlay");
      let filteredTracks = [] as string[];
      if (mood) {
        filteredTracks = tracks.filter(PREDICATES[mood]).map((t) => t.id);
      } else {
        const batchSize = 100;
        for (let i = 0; i < tracks.length; i += batchSize) {
          const batch = tracks.slice(i, i + batchSize);
          const batchPromises = batch.map((t) => ({
            trackId: t.id,
            fits: fitsInPreset(sliderValues, t),
          }));
          const batchResults = await Promise.all(batchPromises);
          filteredTracks.push(
            ...batchResults.filter((r) => r.fits).map((r) => r.trackId)
          );
        }
      }
      addLog(`After filtering: ${filteredTracks.length}`, "onPlay");
      filteredTracks.length > 0 && playTracks(filteredTracks);
    }
  };

  useEffect(() => {
    const everythingEmpty =
      playlists.length == 0 &&
      localPlaylists.length == 0 &&
      outOfDate.length == 0 &&
      isRefreshing == false &&
      !currPlayList.current;
    if (authorized && everythingEmpty) {
      fetchPlaylists();
    }
  }, []);

  const refresh = async () => {
    setIsRefreshing(true);
    setPlaylists([]);
    setLocalPlaylists([]);
    setOutOfDate([]);
    setSliderValues(PRESETS.default);
    currPlayList.current = null;

    await fetchPlaylists();
    setIsRefreshing(false);
  };

  return (
    <BrandGradient style={{ flex: 1, alignItems: "center", gap: 20 }}>
      <Text style={{ fontSize: 35, color: Colors[theme]["light"] }}>Mood</Text>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          paddingHorizontal: 15,
          alignItems: "center",
        }}
      >
        <ThemedText text="Pick a playlist:" type="subtitle" style={{ flex: 1 }} />
        <SortPicker reOrderPlaylists={reOrderPlaylists} />
      </View>
      {outOfDate.includes("unsynced") && (
        <View
          style={{
            backgroundColor: "#fdc356fc",
            opacity: 0.6,
            borderRadius: 12,
            padding: 10,
            justifyContent: "center",
            shadowColor: "orange",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 10,
          }}
        >
          <Text>Some of your local playlists are out of date!</Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.playListScrollContainer}
        style={{ height: "100%", width: "100%" }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      >
        {playlists.length > 0 &&
          outOfDate.length > 0 &&
          playlists.map((item, index) => {
            return (
              <SyncedCard
                key={index}
                title={item.name}
                subtitle={item.owner.display_name}
                imageUri={item.images[0].url}
                onPress={() => {
                  currPlayList.current = item;
                  setCustomizerVisible(true);
                }}
                width={90}
                synced={outOfDate[index]}
                playlist={item}
                finishDownloadingPlaylist={finishDownloadingPlaylist}
              />
            );
          })}
      </ScrollView>
      <MoodCustomizer
        visible={customerizerVisible}
        setVisible={setCustomizerVisible}
        onPlay={onPlay}
        resetSliders={resetSliders}
        setSlidersTo={setSlidersTo}
        sliderValues={sliderValues}
        updateValue={updateValue}
      />
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  playListScrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    width: "100%",
    flexShrink: 0,
    paddingVertical: 15,
  },
});
