import ThemedText from "@/components/ThemedText";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import GradientView from "@/components/GradientView";

export default function Home() {
  return (
    <GradientView>
      <ThemedText text="Explore" type="title" />
    </GradientView>
  );
}
