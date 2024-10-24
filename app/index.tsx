import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

import BrandGradient from "@/components/BrandGradient";
import { useAuth } from "@/hooks/AuthContext";
import { useLogger } from "@/hooks/useLogger";
import Button from "@/components/Button";
import MoodModal from "@/components/mood/Modal";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "@/components/ThemedText";
// import { useDb } from "@/hooks/useDb";

export default function App() {
  const { request, promptAsync, authorized } = useAuth();
  const { addLog } = useLogger();
  const [modalVisible, setModalVisible] = useState(false);

  // const { name } = useDb();
  // console.log(name);

  const handleLogin = () => {
    addLog("Login button pressed", "index");
    if (!authorized) {
      promptAsync();
    } else {
      router.navigate("/(tabs)/");
    }
  };

  const goToDebug = () => {
    router.navigate("/debug");
  };

  // useEffect(() => {
  //   if (authorized) {
  //     addLog("Navigating to home", "index");
  //     router.navigate("/(tabs)/");
  //   } else {
  //     addLog("Token not ready. Need to request", "index");
  //   }
  // }, [authorized]);

  interface ParagraphProps {
    text: string;
  }
  const Paragraph = ({ text }: ParagraphProps) => {
    return <ThemedText style={{ color: "black" }} text={text} />;
  };

  return (
    <BrandGradient style={{ alignItems: "center" }}>
      <View
        style={{
          position: "absolute",
          top: "25%",
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
        }}
      >
        <Text style={{ fontSize: 35, color: "white" }}>Welcome to Spotify+</Text>
        <Button
          title="Why this app?"
          color="dark"
          textLight
          width={"auto"}
          onPress={() => setModalVisible(true)}
        />
      </View>
      <TouchableOpacity style={styles.button} disabled={!request} onPress={handleLogin}>
        <Text style={{ color: "#0d1030", fontSize: 25 }}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ position: "absolute", bottom: 0, height: 100, width: "100%" }}
        onPress={goToDebug}
      />
      <MoodModal visible={modalVisible}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <ThemedText
            type="body"
            text="Hey there! Thanks for using Spotify+"
            style={{ color: "black", textAlign: "left", flex: 1, fontWeight: "bold" }}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={30} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ width: "100%", height: "auto" }}
          contentContainerStyle={{ gap: 10 }}
        >
          <Paragraph
            text={`This app grew out of a place where I wanted more features than what spotify could offer, and the idea partly came from my honour's research project using network graphs. I had two wishes regarding my music: `}
          />
          <Paragraph
            text={`1) I wanted to visualize my music (whole library, playlist, etc) as a network graph. Simply so that I can visualize relationships and extract more information out of my music, and potentially help me find new music I like. `}
          />
          <Paragraph
            text={`2) I wanted to play a certain mood, *from my own music*. There was this feature on my old Samsung A8 that could do this, where you could choose the mood for your own library, not necessarily from all of Spotify (which might include songs you don't like). `}
          />
          <Paragraph
            text={`Therefore, I created this app. You'll see these two main features in the "Graph" and "Mood" pages, respectively. `}
          />
          <Paragraph
            text={`Just note that you need to download playlists onto the device's storage, so that you don't exceed my API limits. If you get the error of the API limit, just follow the instructions there. `}
          />
          <Paragraph
            text={`Please give me feedback on what you like and don't like! Some things are buggy, so please report that too to me. `}
          />
          <Paragraph
            text={`This started out as something for myself, but I might in the end actually publish it. `}
          />
          <Paragraph text={`Enjoy your Spotify+ experience!`} />
        </ScrollView>
      </MoodModal>
    </BrandGradient>
  );
}

const window = Dimensions.get("window");

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#dedede",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: "absolute",
    top: window.height / 2 - 40,
    left: window.width / 2 - 75,
  },
});
