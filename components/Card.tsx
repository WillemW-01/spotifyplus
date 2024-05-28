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

export interface CardProps {
  title?: string;
  subtitle?: string;
  imageUri?: string;
  onPress?: () => void;
  width?: number;
  height?: number;
}

export default function Card({
  title = "Title",
  subtitle = "Subtitle",
  imageUri,
  onPress,
  width = 100,
  height = 100,
}: CardProps) {
  const theme = useColorScheme() ?? "dark";

  return (
    <TouchableOpacity
      style={[styles.container, { maxWidth: width, height: height + 40 }]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: width,
            height: height,
            borderRadius: 12,
          }}
        />
      ) : (
        <View
          style={{
            backgroundColor: Colors[theme]["grey"],
            width: width,
            height: height,
            borderRadius: 12,
          }}
        />
      )}
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 15,
            height: 18,
            flexWrap: "nowrap",
            color: "white",
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 11, height: 14, color: "white" }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
