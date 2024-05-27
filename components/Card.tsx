import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";

interface CardProps {
  title: string;
  subtitle: string;
  imageUri: string;
  onPress: () => void;
  width?: number;
  height?: number;
}

export default function Card({
  title,
  subtitle,
  imageUri,
  onPress,
  width = 50,
  height = 50,
}: CardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { maxWidth: width }]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      <Image
        source={{ uri: imageUri }}
        style={{
          width: width,
          height: height,
          borderRadius: 12,
        }}
      />
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
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
