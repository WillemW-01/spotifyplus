import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

import { Colors } from "@/constants/Colors";
import { PREDICATES, PRESETS, TrackFeatures } from "@/constants/sliderPresets";

import { SimplifiedPlayList } from "@/interfaces/playlists";

import BrandGradient from "@/components/BrandGradient";
import Card from "@/components/Card";
import ThemedText from "@/components/ThemedText";

import { useAuth } from "@/hooks/AuthContext";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlayLists } from "@/hooks/usePlayList";
import { useTracks } from "@/hooks/useTracks";

import MoodCustomizer from "@/components/mood/MoodCustomizer";

// import data from "@/scripts/features/features_main_jam.json";
import { CustomPlaylist, TrackFeature } from "@/interfaces/tracks";
import { useDb } from "@/hooks/useDb";
import SelectableCard from "@/components/graph/SelectableCard";
import SyncedCard from "@/components/mood/SyncedCard";
import Button from "@/components/Button";
import SortPicker from "@/components/mood/SortPicker";

interface Feature {
  index: number;
  artist: string;
  name: string;
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}

export type LocalState = "online" | "unsynced" | "synced";
export type SortCritera = "alpha" | "size";

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
  const [sliderValues, setSliderValues] = useState<TrackFeatures>(PRESETS.default);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currPlayList = useRef<SimplifiedPlayList | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { authorized } = useAuth();
  const { playTracks } = usePlayback();
  const {
    listPlayLists,
    getPlayListItemsIds,
    getPlayListItemsAll,
    fetchPlaylistFeatures,
  } = usePlayLists();
  const theme = useColorScheme() ?? "dark";
  const { fitsInPreset } = useTracks();
  const { getPlaylists, insertNewSongs, getPlaylistSongs } = useDb();

  const updateValue = (featureName: keyof TrackFeatures, value: number) => {
    setSliderValues((prev) => ({
      ...prev,
      [featureName]: value,
    }));
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
    console.log(`Status of ${playlist.name} = ${status}`);
    if (playlists.length > 0 && outOfDate.length > 0) {
      const index = playlists.findIndex((online) => online.id == playlist.id);
      setOutOfDate((prev) => {
        const temp = [...prev];
        temp[index] = status;
        console.log(`Setting outofdate[${index}] = ${status}`);
        return temp;
      });
    } else {
      console.log(
        `Cant set updated status because playlists and outofdate are not loaded`
      );
    }
  };

  const checkStatus = async (
    playlist: SimplifiedPlayList,
    dbResponse?: CustomPlaylist[]
  ) => {
    if (!dbResponse) {
      console.log(`Checking status of ${playlist.name}`);
      dbResponse = await getPlaylists();
    }
    const online: CustomPlaylist = {
      name: playlist.name,
      id: playlist.id,
      snapshot: playlist.snapshot_id,
    };

    const index = dbResponse.findIndex((local) => local.id === online.id);
    if (index >= 0) {
      const local = dbResponse[index];
      if (local.snapshot != online.snapshot) {
        console.log(
          `${online.name} is out of date! ${local.snapshot} vs ${online.snapshot}`
        );
        return "unsynced";
      } else {
        console.log(`${online.name} is synced (${online.snapshot} == ${local.snapshot})`);
        return "synced";
      }
    } else {
      return "online";
    }
  };

  const fetchSinglePlaylist = async (
    playlist: SimplifiedPlayList,
    progressCallback?: React.Dispatch<React.SetStateAction<number>>
  ) => {
    try {
      const trackFeatures = await fetchPlaylistFeatures(playlist, progressCallback);
      const response = await insertNewSongs(trackFeatures);
      if (!response) {
        console.log(`Something went wrong with inserting new songs:`, response);
      }

      await checkStatusOutside(playlist);
    } catch (error) {
      console.log(`An error occured with inserting new songs:`, error);
    }
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

  const onPlay = async (mood?: keyof typeof PREDICATES) => {
    if (currPlayList.current) {
      const tracks = await getPlaylistSongs(currPlayList.current.id); // local
      if (!tracks) return;
      console.log("Getting tracks with sliders: ", sliderValues);
      console.log("Before filtering: ", tracks.length);
      let filteredTracks = [] as string[];
      if (mood) {
        filteredTracks = tracks.filter(PREDICATES[mood]).map((t) => t.id);
        console.log(`After: ${filteredTracks.length}`);
        playTracks(filteredTracks);
      } else {
        // const batchSize = 10;
        // for (let i = 0; i < tracks.length; i += batchSize) {
        //   const batch = tracks.slice(i, i + batchSize);
        //   console.log("Should be checking ids: ", batch);
        //   const batchPromises = batch.map(async (t) => ({
        //     track: t,
        //     fits: await fitsInPreset(sliderValues, t),
        //   }));
        //   const batchResults = await Promise.all(batchPromises);
        //   filteredTracks.push(...batchResults.filter((r) => r.fits).map((r) => r.track));
        //   // Add a delay between batches to further reduce the risk of rate limiting
        //   if (i + batchSize < tracks.length) {
        //     await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        //   }
        // }
        Alert.alert(
          "Mood Slider",
          "This function unfortunately doesn't work at the moment"
        );
      }
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

  useEffect(() => {
    if (sliderValues) {
      console.log("Value: ", sliderValues);
    }
  }, [sliderValues]);

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
    <BrandGradient style={{ flex: 1, alignItems: "center", gap: 30 }}>
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
        {/* <Button title="sort" onPress={() => reOrderPlaylists("size", true)} />
         */}
        <SortPicker
          reOrderPlaylists={reOrderPlaylists}
          style={{ position: "absolute", right: 0 }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.playListScrollContainer}
        style={{ flex: 1, width: "100%" }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      >
        {playlists &&
          playlists.map((item, index) => {
            return (
              <SyncedCard
                key={index}
                title={item.name}
                subtitle={item.owner.display_name}
                imageUri={item.images[0].url}
                onPress={() => {
                  currPlayList.current = item;
                  bottomSheetRef.current?.snapToIndex(0);
                }}
                width={90}
                synced={outOfDate[index]}
                playlist={item}
                downloadPlaylist={fetchSinglePlaylist}
              />
            );
          })}
      </ScrollView>
      <MoodCustomizer
        bottomSheetRef={bottomSheetRef}
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
  },
});

const savedTracks = [
  "05u81UgU27g8uL5twJ7ABz",
  "7oekneJCJO74ycdLzdk16v",
  "6Od2OWvoT4embWAgIGeFRd",
  "5J7zqPpQkN9JZiaELHNKSL",
  "7zWYskRENVPyJUh8FLzuoT",
  "5Ewz5ms8XpjtkihWFLnJJs",
  "4BdGO1CaObRD4La9l5Zanz",
  "5Ny6HXUK1LMW3opDVnQCvi",
  "3uVEtIOcyE7rGAqcWJt95h",
  "4GvCKO2vlWeMpI46X8xQKK",
  "7w87IxuO7BDcJ3YUqCyMTT",
  "3dEFa9KjOLEZl980ctEEv1",
  "6dux5viG3Ku3IefPx3gFNT",
  "4YeUVRpVxaDx6zu6CtB01j",
  "5YjnnWg091lEmPrTSTLHgc",
  "7Afr3PKTtlFGHGiXYgnv6P",
  "6VoonmHLcrkzKEfPWnV5SE",
  "7wF4asYZw8cAHEljYd2Wid",
  "4S5LEWgXWQkqC2EEOmRCF9",
  "07m8PuXxxv5J4qPEDq6ZkK",
  "3CRJORXJpagbUMYZuj2lwX",
  "77Y57qRJBvkGCUw9qs0qMg",
  "3SktMqZmo3M9zbB7oKMIF7",
  "2jdAk8ATWIL3dwT47XpRfu",
  "0bYDebBlQxsDR4hCgbbpOW",
  "7kr3xZk4yb3YSZ4VFtg2Qt",
  "0CKPLoYW0nsAnjnr00HRWV",
  "7ylOCfpjsuxM6w7W7b3W91",
  "2BkyYZmU4JuWW2sYi9EzpC",
  "0hNOP5epEjX8Zj5aSGr6JU",
  "6dIZb64N6ICAWrf1RJrKfB",
  "2smpiAZfaN0GFi15MqAq6E",
  "4VNu1KwwmGgHjImpQotEsn",
  "7rpZJ7nSe2m5he3OHEz8Yv",
  "07m8PuXxxv5J4qPEDq6ZkK",
  "1GgoypuXSxpTKOxEYiZ3JJ",
  "35RrDnREM1xxx4YBxDHikm",
  "5pjETtb5hpSStfFlAAU0J7",
  "2lxBZVbkiCXC1soks2RXwV",
  "4BdGO1CaObRD4La9l5Zanz",
  "0qDG9MjRZISlT31enV6xOA",
  "3tbJoFjD9ea2TRMsbf0z0H",
  "6CFkHFZqvv5LTTzDGggLP6",
  "4RE3vueod5PL48rvHtuu9C",
  "1xgT3Hn05j9ypY3lNuCfqc",
  "3tbJoFjD9ea2TRMsbf0z0H",
  "6CFkHFZqvv5LTTzDGggLP6",
  "41Va4mcT3GyKVu6u6LoLJ6",
  "5KxcMQlpKTEIkLEGE5nset",
  "37kLxS3IntmCnoE4a5XMKy",
  "7k89nEaNK54kLKXHFbERzQ",
  "2msdr19RehOAL1RTTRwfCg",
  "3CN9WtSBqCI6TXne9XNomb",
  "6K0b2FYLwAbq90OgmrMvdg",
  "05tKse2mbMxPPDqJDPunMD",
  "48ce9gtBjXhq73lTBLM09x",
  "4qwjkpSiA4XZXNmk0Cmpfi",
  "5Ms8gtJUCzJ4IVWd7gCSR6",
  "18gbbV2VidYvGSblo3aGVt",
  "7xT7S9uNrRkYTl4U4xps4M",
  "7vh8aA3VMof7m2JR8hX8Nm",
  "3ZUPnClu1aKF2Fmt7cFsLP",
  "4bsDH8p2my1U5QDMZpBxYT",
  "1zlgJFFI9jNGVFeAMOIoxt",
  "4BEI01RMjIuA2geFPZIVHS",
  "4ltyZZtnOj9PtqOvDtOd4t",
  "2K28PAjVBhB6jOUVyj7PLT",
  "0XwrsfUtf47y3z1kS81Hql",
  "04JhvPreqxWlAV5SdK4mNo",
  "3brmDf3GLNsiWxJobTCn4a",
  "0iULaBlXOJFxqXPWDE325p",
  "1XZeBXHGMqYVvVqeBe2QoS",
  "1DQzw4dCdY5iGnOPNHEoPz",
  "5WfRUXwgd5KWRPG9bAmWst",
  "5o792XuwxIxqwr73ZsACfJ",
  "7onS7sAXzPt7Qf3ngWqu8Q",
  "2rBIC9Uc5qZeBjJvWulFTN",
  "3up9PVg6BatOruFRxi4oLY",
  "0Io5aNyPCvK31w1hffcTbC",
  "0pipZCAXwFPd4efn3xU4x3",
  "3sz2roCk5tyGeMhHftbJye",
  "5lalGRKfTwohXUhiNttBXn",
  "14uhiVl5NwPDCmlRUgo4l6",
  "7pwv8qF2fnu4Pbo43rd7i1",
  "4gXpkXmHvaktsmmA1TJ2nv",
  "0VONB1WEbtmatvlsmaPZKj",
  "3pVfjLi9msLtXG1h5yNn4d",
  "0JXmh947In51NEtBgQyud4",
  "5gza85soOXdZTE2TMfqDWM",
  "4gYJWH66QxTo87XlVFtziu",
  "27BrerRuQ8H2nqXuiKtBah",
  "0z3cJsLM4vvmdZJ8lulR5t",
  "3yXeVwlkiat9lJmU3gWNU3",
  "1BrU8tQjSCR2kEkouF0ldN",
  "77kB9ndJCAwkZk1k0i8igr",
  "12rcsuv4QgpfAGlYaYj43c",
  "2BVxCW4Yry9SaMVETrybRR",
  "55zgIXyhi8z6snmSx0iXQi",
  "1dkdkugKNWnTtymesLcxGG",
  "42bbDWZ8WmXTH7PkYAlGLu",
  "22GUd9JOxhSidGguHxf3Nu",
  "2z74tRiKWd5Yv6d3qbNUCy",
  "5zT5cMnMKoyruPj13TQXGx",
  "6e98Eg40UdsdXqnfamel4E",
  "4WN7sK5S0oQ74hT6brZ46K",
  "0B4oP0rG4y7oxugGDNNw78",
  "1ySdKj9IbvIRCyjPBe6NpV",
  "3lw0CSMQ88LcN0ZMP6DlWi",
  "6Nbvi82Fs1sUOTkGYog85E",
  "7tjD0hvDyA9LecANtqIaEh",
  "0roPf0bwAsBDZv1bR15m15",
  "6c6t0aQOtVUZTxRQTlEkZQ",
  "5bZeugrr7oIATt1CLJuhT4",
  "5NsvxfpGzOXalL32GAH8Fr",
  "2Dad2dzctBwgh4EvrYkq5M",
  "1mkwI947OIcgdzBvRjRPPx",
  "0vXx9GT0HPlkEsdkpfylU6",
  "1HbcclMpw0q2WDWpdGCKdS",
  "58J2it1iBwQ9QoEm1gelbD",
  "00cBcYOlnHoXX9ver3cmdE",
  "4ewpVpVKmIpA6HaKqUnt5L",
  "4G1wFvcZmoMvItaRTxAGao",
  "4kcnySwaXAKatz4c5U8MSI",
  "48Rz0VfdkUPwW81e70c8lZ",
  "7fsDd3jNcfOnRIJ17kPkbo",
  "7x46YkKAwp3yZpaa72n5Mu",
  "3hVrC8e2aBK2suo7EMMXLj",
  "38zsOOcu31XbbYj9BIPUF1",
  "600oiqLkQIJ85HvQGIQWvO",
  "7CEIn4lDK1nZQRfc6XVTqU",
  "6fjLKdbtosUNaCfypOPqvn",
  "7DZ8n63a46dU6iUyN9OeRl",
  "2oZsDq0pwp9yLgHGoI2Y5F",
  "0yGODiR387R0pcOPkU1Tt3",
  "66zJFuhki4Yaskr20Yo0eH",
  "2CEEKREL8eUBhNvsafRAsb",
  "0NL2M63Em2rH5PD8idftkm",
  "2cXcizftGUHRwgDgXLSHVb",
  "3TKjLfmtDd0hhTU2D3UjsF",
  "1BYNqzIR1Pawhzx44YvXdw",
  "608JEuAS9UXSt39HvUw9aX",
  "3PWlwy0DdP4vIhzp0RrrOh",
  "0v8iaQnFPT8qkicB880pAr",
  "52BtapS0Wy7LM8R6QvJRpp",
  "23KE83mQ6w9bk6bdMCZ0CU",
  "6OPCPWHHpFeRm60hiZuRrP",
  "61CVlBAPN1rIJdJdpU2MHx",
  "3qGRToYhVCGj41pKzXqua8",
  "5igrAKYGCpB81myxGig5Mw",
  "1jzo5QmpKa8eLSF3NOJzPe",
  "42UaitnwvuKqNcD5Oa2HlD",
  "6Y5chnfpGt3f6HM5xA8Pd1",
  "20zcj4PSozTDNFGjML8fJS",
  "5w3VUZNrbbbfURsJ8CPbQy",
  "0rM6Q9AmKWhCs1Yla9r3Pr",
  "74iZuPGwyL33VlTr6jTnab",
  "05FiTaRgf61OkgSDiN9RXR",
  "6YfSuIS9WW0JClHpJpULxM",
  "63q3GlHZstxXzfb0zt7ZYY",
  "2iCcbMCYkRYIHatUoWfKIL",
  "72NfA7H7MNNRivi623c34g",
  "57Gcs9Mo5wvO8gvp3fsle5",
  "4APVVf3tigYrkWKY9CA5SF",
  "3xMwMtR0Z30FF8HlQ09wWE",
  "6Ek1l5BODK5Y0BErHkOWrj",
  "1ApB2QRPQi3MlBUFeegVUr",
  "2Ak6HZreZATE3X1hxzGWVc",
  "1b4QFVYQHqmLMn7exYauCj",
  "1teEKotmDNiPOECzlV9Q9P",
  "55oLoWqGQ3unkMunMzgKeY",
  "1kEM39SfejDKRNwrWLkISI",
  "1rEA1VSVUMpeKcBBG1Huaz",
  "2Ct8N1IDU0a9vakWJY7gFp",
  "1xXSof69SqdGxJAdAIukRQ",
  "75yHLmXyBRvPa1e8czGlxu",
  "0R7EWhquaAICmyE5MZqt3q",
  "6UOkF086zUgYXnqFxqUvEI",
  "6vfmmwCPsz5xNLjKIlzwOF",
  "4ztgjcOsR0HGsm1vkzh0Ky",
  "6r4jouSQy2Hl77pwMwChcM",
  "3aA1dyHSCU6obV2HgARNdX",
  "2fipF2hExZjd8qLCFQBpJa",
  "7bcnTUSnxnt30Y4ynLCQ6T",
  "031tI90Tz4hlhPmvi3djr0",
  "1FB6JEDsy3w5YTgg9d9zGw",
  "7Cy46glHTiYmExbOMhLb5K",
  "3QEOUIgfTjcLR2eyUSujBd",
  "1Fh2slksBn9TpTu3tSHSMa",
  "6hZmapFfbOBqQiKR4eMcbJ",
  "50YBK8OKWYxD4eBNRwT7Qz",
  "3WSfX5RhR8vln6IaaRFjq8",
  "2JAeS9tZjjAiJ2RHDfJMbo",
  "2G7sptnwIKiPWrbKTlLhWQ",
  "2x0kzA6hfFhSgHLqdW6UwP",
  "4rypm0OAHbU1IXLA8atiGE",
  "5nsFJfYtAFZmL9PbtYKYcA",
  "3eNSC9m8CukWPWdef8znPg",
  "3p8Kv8GcO4obTLPmsS459h",
  "2E0Lr1ecydv5MjTYYM0WhN",
  "6nmukSDAmw3XtbGKGD8056",
  "6VhuP99TE6gYNQRJIlAWFD",
  "2KuDjmr5mllSNgpk1PtVd5",
  "3E3SMSm6FMRA9gkpaFRFrC",
  "4ZUUXUKXWc7YQuUY53Tfwx",
  "3OQmQTpwZBL3yTr5mCCvOH",
  "124KRi7jkm9Skq89xIK28V",
  "3eJ5D9HNQAJfHqUFCz8hi9",
  "6C9hKHg0L0JffoqL9uceE8",
  "6Vp0ofQMO9LY8EJOwokZq2",
  "7Hgn6MVuZTVHL17KlBsoSa",
  "4nWoYN8aF05BZgeMj7sbnp",
  "5SQkpKQP4woq7R4kG53HAy",
  "7mMZ8mAtEWwx16VNKQKCtQ",
  "3BAwNf0KLSp7SOnca0Q4j7",
  "5cKQeqXKhyclhejXHMlrI4",
  "783ICUdmtVQgg1meszkCfS",
  "4gSBbAnct4qt5XbkCbTdnc",
  "5sHlU2ejWIzJDHgSrwSxx6",
  "4fp615OQ4jgd3Xf55Uf9Cs",
  "170sne6Q3FktcEFxfK6oTR",
  "4K9YS0nkXZMgV0F9JQoirx",
  "7JrhgIcZbn8NEU7mLSmjNH",
  "1bzymgL9lQBAYNhJIXlNNG",
  "7ldIYiFIvxPyTiy0iO9UqV",
  "4abEe6s1Ja2qSxqC6BUzn1",
  "5NffPhg2C8T8GM8WTMvADQ",
  "0A3zAuF47kvuDVmnwPd1g1",
  "44alNkXsYnTyPnkMdohBcx",
  "0nJW01T7XtvILxQgC5J7Wh",
  "5imShWWzwqfAJ9gXFpGAQh",
  "4R1Y1sR53VJoqLjiJkaKrW",
  "2LTl1pU074hnzAdy0SpHAb",
  "2HnqhhoVPWwIxnpdSKfyGA",
  "3GKrqEZ0fZpVnD1A0BeAK9",
  "4MYUnIBcd3NsQbPJm6RGRZ",
  "0THzW6DgTrtGpl69aWFAvS",
  "4xq4DzQf2XkTKXwVZ5S7FT",
  "0ulLs8vN4SBtVHc5KDAamV",
  "4oVwdsQwrZAivpVy5paqL2",
  "4GonX4H1a5XivVwdqZ1Hzo",
  "4LDOieBPdFL4E8Z5raYuoq",
  "34PTkw8vVXf3jSy9G4KcKo",
  "0GZlSlTZdE43baosGAgQJa",
  "3MXJ1xMir1HdLkFRXPsewv",
  "4T6FWA703h6H7zk1FoSARw",
  "0tgBtQ0ISnMQOKorrN9HLX",
  "40FTPUBd1fWmaoWKdWteYl",
  "2TmhGoQFEc0Pr43v9Ub9Rd",
  "6TpyujRefwsflWFXbmjVpj",
  "06voX63M9lLDmlIt2zrHpe",
  "2b2uqeIFEPZAjKtUdfGoTD",
  "5MFW5SOyi2uPppqJib5pVw",
  "1rjg4eh7GNbiTJIVrwqSTR",
  "16u9nt8ZyBfrf3M4tnt6Td",
  "3zDSmvrJLefNhlhW14h5aM",
  "7xKH2vppMfhWsx6u7BFDIt",
  "3DJRR3CAwbu3m0azA7DHzL",
  "2wcRuegxLUW1IznkfPHTBc",
  "5OnyAcESvyIfRG3MkstEAC",
  "5063zWIUKknkMJ7D9GbGSG",
  "6H37tOnHZK67vNMN9Mjkgt",
  "6FRSh751lnqS0JGHRg8Dol",
  "1xVi1xnR1B6EECYOd5GUwI",
  "54hznmb8FaTCdwZvRGGUu9",
  "3SIuy1JW4rjGPjX2UA8bYK",
  "3AjlWSiT9RBW9JMZOvZkpe",
  "2cVBRjkwEdb4m5umqm10MD",
  "4jA0Ol7OXOMt2ZCHNiEVMU",
  "3P45QCRDLss7RA2Zg4yj4I",
  "5dlZWqrKiUY2xpCRFDcVLO",
  "3rm4a3WFvyx71gXPGXsrsd",
  "01LEUIGH4Mup0hV3gHNgx0",
  "3kO5Qsd9257k7ie7lFcFDr",
  "59rK5CDvt3z9BMadJlRjcL",
  "2RdcyZsOisQLRE8L2K456O",
  "3eDo0sBUGqFUnnScLAUy0f",
  "0HtGPWuefVqjV64QTD5i0v",
  "2RcEpOohSehGSfXnx9eA5k",
  "0dxaY8QH7eD9SE5HRjxNKI",
  "7AkPusgKsrTqbOcTTbRnFr",
  "2tTFLd7fZCB2yCQM2fhJ8s",
  "1C4VJyyTv66D32uIHkrAdC",
  "6NzO8H8HWe1hHaiZWiGpXH",
  "0E5qs1cpZclZrTRAlhuyMh",
  "47InLMACV8Tl2JgZL2tVPA",
  "2p5peGFsiSfp155oGdEdqZ",
  "6upqycHdFZkd1JzVeqjnGo",
  "6lTDzhs8J9mqHs4cShQFVO",
  "1OqpsF9qZ8tpiwiywtCiif",
  "4Tm5i27TUx2y3mCz9OweLR",
  "09yBr7jcbBNt8FCnC6Txcu",
  "4ZnEY01lDD6wkuzAUPppx3",
  "14PGuHlKGSYWFEVOWw40Va",
  "2eOYPlzlcyxjWkNlpz8Hyv",
  "4lzyue8f0NOU3xSpm0CVgV",
  "15JVqbFEDFosNfeWOaVo88",
  "3BRztJrZyWFwaRP6VYNsA1",
  "4aeXMlGikze99fS0PFergJ",
  "2VDKSRDTpqWgczc33Lk9h5",
  "0YPWqS1QVVB0LQ5h3gxbBH",
  "49tW2u59iX2z2thHLkYYo5",
  "7nYyorbIVpbo1PaowBE5c6",
  "30Ws4fQbAhaKWTS0hr0wJt",
  "5htghP7rThIe6oXBN6uYI5",
  "3e5yu9MkIvQx17mm7LF6KY",
  "30sxyKdIiwUIMDarYXO7F7",
  "5MfSZLVieda0XEtoaMX0oj",
  "7Mxht6E0pDbEb8vyP76Amm",
  "6k5o8YQhioUz54YY3CfcYB",
  "7iTZBQ5kH8ZYDRNwF1OSmw",
  "0y4zq960wgBj2gTdpshCZ1",
  "4I1MhYsQQ71wkE5DiCWw5T",
  "1ixD29DWr5eSZ1vZROT40I",
  "2clElTsD1qOztIwI9CuJvu",
];
