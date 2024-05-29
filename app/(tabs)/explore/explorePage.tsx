import ThemedText from "@/components/ThemedText";
import {
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  RefreshControl,
} from "react-native";
import GradientView from "@/components/GradientView";
import { CardProps } from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import CardScroll from "@/components/CardScroll";
import { router } from "expo-router";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { usePlayLists } from "@/hooks/usePlayList";
import { useUser } from "@/hooks/useUser";
import { TopArtist, TopTrack } from "@/interfaces/topItems";
import { useRecommendations } from "@/hooks/useRecommendations";
import { usePlayback } from "@/hooks/usePlayback";
import useSpotifyAuth from "@/hooks/useSpotifyAuth";

const soundsOfSpotify = require("@/constants/playlists.json");

const CARD_WIDTH = 90;

const cardProps = {
  height: CARD_WIDTH,
  width: CARD_WIDTH,
  // imageUri: "https://i.scdn.co/image/ab67616d0000b273c990dac05b4de8c7af5ff17d",
};

interface SectionButtonProps {
  iconColor: string;
  title: string;
  onPress?: () => void;
}

const capitalize = (str: string) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};

function SectionButton({ iconColor, title, onPress }: SectionButtonProps) {
  const needToChange = ["artists", "genres", "tracks"].includes(title);
  const newTitle = needToChange
    ? `Top ${capitalize(title)}`
    : capitalize(title);

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        paddingLeft: 10,
      }}
      activeOpacity={0.5}
      onPress={onPress}
    >
      <ThemedText text={newTitle} type="subtitle" />
      <Ionicons name="caret-forward-outline" size={25} color={iconColor} />
    </TouchableOpacity>
  );
}

interface SectionProps {
  name: keyof Routes;
  cards: CardProps[];
}

function Section({ name, cards }: SectionProps) {
  const theme = useColorScheme() ?? "dark";
  const iconColor = Colors[theme]["light"];

  const to = (name: keyof Routes) => {
    router.navigate(`/explore/${name}`);
  };

  return (
    <View style={{ flexShrink: 0, flexGrow: 0, gap: 20 }}>
      <SectionButton
        iconColor={iconColor}
        title={name}
        onPress={() => to(name)}
      />
      <CardScroll cards={cards} />
    </View>
  );
}

interface Routes {
  artists: string;
  genres: string;
  playlists: string;
  tracks: string;
}

interface PackedPlayList {
  title: string;
  subtitle: string;
  imageUri: string;
  width: number;
}
export interface PackedArtist {
  title: string;
  subtitle: string;
  id: string;
  popularity: number;
  imageUri: string;
  genres: string[];
}

export interface PackedTrack {
  title: string;
  subtitle: string;
  id: string;
  popularity: number;
  imageUri: string;
  width: number;
}

export interface Genre {
  title: string;
  subtitle: string;
}

export default function Explore() {
  const [refreshing, setRefreshing] = useState(false);
  const [playLists, setPlaylists] = useState<PackedPlayList[]>([]);
  const [artists, setArtists] = useState<PackedArtist[]>([]);
  const [tracks, setTracks] = useState<PackedTrack[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const { authorized } = useSpotifyAuth();
  const { listPlayLists, getPlayListItemsIds } = usePlayLists();
  const { getTopArtists, getTopTracks } = useUser();
  const { playPlayList, playArtist, playTrack } = usePlayback();

  const fetchRecommendationsGenre = async (genre: string) => {
    try {
      const url = soundsOfSpotify[genre].href;
      console.log(soundsOfSpotify[genre]);
      const regex = /(?<=playlists\/)[^\/]+/;
      const match = url.match(regex)[0];
      console.log(match);
      match && playPlayList(match);
    } catch (error) {
      console.log(error);
    }
  };

  const packPlayListItem = (playListItem: SimplifiedPlayList) => {
    return {
      title: playListItem.name,
      subtitle: playListItem.owner.display_name,
      imageUri: playListItem.images[0].url,
      width: CARD_WIDTH,
      onPress: () => playPlayList(playListItem.id),
    };
  };

  const packPlayLists = (playLists: SimplifiedPlayList[]) =>
    playLists.map(packPlayListItem);

  const packArtistItem = (artistItem: TopArtist) => {
    return {
      title: artistItem.name,
      subtitle: String(artistItem.popularity),
      id: artistItem.id,
      popularity: artistItem.popularity,
      genres: artistItem.genres,
      imageUri: artistItem.images[0].url,
      width: CARD_WIDTH,
      onPress: () => playArtist(artistItem.id),
    };
  };

  const packArtists = (artists: TopArtist[]) => artists.map(packArtistItem);

  const packTrackItem = (trackItem: TopTrack) => {
    return {
      title: trackItem.name,
      subtitle: trackItem.artists[0].name,
      id: trackItem.id,
      popularity: trackItem.popularity,
      imageUri: trackItem.album.images[0].url,
      width: CARD_WIDTH,
      onPress: () => playTrack(trackItem.id),
    };
  };

  const packTracks = (tracks: TopTrack[]) => tracks.map(packTrackItem);

  const fetchPlayLists = async () => {
    const items = await listPlayLists(10);
    console.log("Playlists came back");
    const formattedPlayLists = packPlayLists(items);
    setPlaylists(formattedPlayLists);
  };

  const fetchArtists = async () => {
    const items = await getTopArtists();
    if (items) {
      console.log("Artsts came back");
      const formattedArtists = packArtists(items);
      setArtists(formattedArtists);
    }
  };

  const fetchTracks = async () => {
    const items = await getTopTracks();
    if (items) {
      console.log("Tracks came back");
      const formattedTracks = packTracks(items);
      setTracks(formattedTracks);
    }
  };

  const calculateGenres = () => {
    if (artists.length > 0) {
      const counts: { [key: string]: number } = {};
      artists.forEach((artist) => {
        artist.genres.forEach((genre) => {
          counts[genre] = (counts[genre] || 0) + 1;
        });
      });

      const genreCountsArray = Object.entries(counts);
      genreCountsArray.sort(([, valueA], [, valueB]) => valueB - valueA);
      const sortedGenres = genreCountsArray.map(
        (item: [key: string, value: number]) => {
          return {
            title: item[0],
            subtitle: `${soundsOfSpotify[item[0]].total} | ${item[1]}`,
            width: CARD_WIDTH,
            onPress: () => fetchRecommendationsGenre(item[0]),
          };
        }
      ) as Genre[];
      setGenres(sortedGenres);
    }
  };

  const refresh = async () => {
    if (authorized) {
      setRefreshing(true);
      await fetchPlayLists();
      await fetchArtists();
      await fetchTracks();
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (playLists.length === 0 && artists.length === 0) {
      refresh();
    }
  }, []);

  useEffect(() => {
    if (artists.length > 0) {
      calculateGenres();
    }
  }, [artists]);

  return (
    <GradientView style={{ alignItems: "center", gap: 30 }}>
      <ThemedText text="Explore Your Library" type="title" />
      {refreshing ? (
        <ThemedText type="default" text="Refreshing" />
      ) : (
        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingBottom: 10,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 15,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
        >
          <Section name="playlists" cards={playLists} />
          <Section name="artists" cards={artists} />
          <Section name="genres" cards={genres} />
          <Section name="tracks" cards={tracks} />
        </ScrollView>
      )}
    </GradientView>
  );
}
