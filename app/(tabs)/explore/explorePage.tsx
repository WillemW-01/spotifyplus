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
import { PackedArtist, PackedTrack } from "@/interfaces/topItems";

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

function SectionButton({ iconColor, title, onPress }: SectionButtonProps) {
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
      <ThemedText
        text={title.slice(0, 1).toUpperCase() + title.slice(1)}
        type="subtitle"
      />
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

export default function Explore() {
  const [refreshing, setRefreshing] = useState(false);
  const [playLists, setPlaylists] = useState<PackedPlayList[]>([]);
  const [artists, setArtists] = useState<PackedArtist[]>([]);

  const { authorized } = useAuth();
  const { listPlayLists } = usePlayLists();
  const { getTopArtists, getTopTracks } = useUser();

  const fetchArtists = async () => {
    const items = await getTopArtists();
    if (items) {
      setArtists(
        items.map((item) => {
          return { ...item, width: CARD_WIDTH };
        })
      );
    }
  };

  const packPlayListItem = (playListItem: SimplifiedPlayList) => {
    return {
      title: playListItem.name,
      subtitle: playListItem.owner.display_name,
      imageUri: playListItem.images[0].url,
      width: CARD_WIDTH,
    };
  };

  const packPlayLists = (playLists: SimplifiedPlayList[]) => {
    return playLists.map(packPlayListItem);
  };

  const fetchPlayLists = async () => {
    const items = await listPlayLists(10);
    console.log("Playlists came back: ", items[0]);
    const formattedPlayLists = packPlayLists(items);
    setPlaylists(formattedPlayLists);
  };

  const refresh = async () => {
    if (authorized) {
      setRefreshing(true);
      await fetchPlayLists();
      await fetchArtists();
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (playLists.length === 0 && artists.length === 0) {
      refresh();
    }
  }, []);

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
          <Section
            name="genres"
            cards={[cardProps, cardProps, cardProps, cardProps, cardProps]}
          />
          <Section
            name="tracks"
            cards={[cardProps, cardProps, cardProps, cardProps, cardProps]}
          />
        </ScrollView>
      )}
    </GradientView>
  );
}
