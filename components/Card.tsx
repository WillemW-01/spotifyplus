import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";
import ThemedText from "./ThemedText";
import RandomGradient from "./RandomGradient";

export interface CardProps {
  title?: string;
  subtitle?: string;
  imageUri?: string;
  onPress?: () => void;
  width?: number;
}

export default function Card({
  title = "Title",
  subtitle = "Subtitle",
  imageUri,
  onPress,
  width,
}: CardProps) {
  const theme = useColorScheme() ?? "dark";
  const calcWidth = width ? width : 50;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { maxWidth: calcWidth, height: calcWidth + 40 },
      ]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: calcWidth,
            height: calcWidth,
            borderRadius: 12,
          }}
        />
      ) : (
        <RandomGradient
          style={{
            backgroundColor: Colors[theme]["grey"],
            width: calcWidth,
            height: calcWidth,
            borderRadius: 12,
          }}
        />
      )}
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <ThemedText type="cardTitle" text={title} />
        <ThemedText type="cardSubtitle" text={subtitle} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#222",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
