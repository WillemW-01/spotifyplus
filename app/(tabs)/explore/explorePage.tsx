import ThemedText from "@/components/ThemedText";
import {
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from "react-native";
import GradientView from "@/components/GradientView";
import { CardProps } from "@/components/Card";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import CardScroll from "@/components/CardScroll";
import { router } from "expo-router";

const CARDHEIGHT = 90;

const cardProps = {
  height: CARDHEIGHT,
  width: CARDHEIGHT,
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
}

export default function Explore() {
  return (
    <GradientView style={{ alignItems: "center", gap: 30 }}>
      <ThemedText text="Explore Your Library" type="title" />
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
      >
        <Section
          name="playlists"
          cards={[cardProps, cardProps, cardProps, cardProps, cardProps]}
        />
        <Section
          name="artists"
          cards={[cardProps, cardProps, cardProps, cardProps, cardProps]}
        />
        <Section
          name="genres"
          cards={[cardProps, cardProps, cardProps, cardProps, cardProps]}
        />
        <Section
          name="genres"
          cards={[cardProps, cardProps, cardProps, cardProps, cardProps]}
        />
      </ScrollView>
    </GradientView>
  );
}
