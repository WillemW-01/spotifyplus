import { useColorScheme, Text, StyleProp, TextStyle } from "react-native";
import { Colors } from "@/constants/Colors";

interface Styles {
  default: StyleProp<TextStyle>; // not going to type all these unnecessarily
  title: StyleProp<TextStyle>;
  subtitle: StyleProp<TextStyle>;
  body: StyleProp<TextStyle>;
  bodySmaller: StyleProp<TextStyle>;
  cardTitle: StyleProp<TextStyle>;
  cardSubtitle: StyleProp<TextStyle>;
}

interface ThemedTextProps {
  text: string;
  type?: keyof Styles;
  style?: StyleProp<TextStyle>;
}

export default function ThemedText({
  text,
  type = "default",
  style,
}: ThemedTextProps) {
  const theme = useColorScheme() ?? "dark";

  const styles: Styles = {
    default: { fontSize: 15 },
    title: { fontSize: 35 },
    subtitle: { fontSize: 25 },
    body: { fontSize: 15 },
    bodySmaller: { fontSize: 12 },
    cardTitle: { fontSize: 15 },
    cardSubtitle: { fontSize: 15 },
  };

  function getColor(type: keyof Styles): string {
    switch (type) {
      case "cardSubtitle":
        return Colors[theme]["grey"];
      default:
        return Colors[theme]["text"];
    }
  }

  return (
    <Text style={[styles[type], { color: getColor(type) }, style]}>{text}</Text>
  );
}
