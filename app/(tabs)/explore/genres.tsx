import React, { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import CirclePackingChart, { DataNode } from "@/components/bubbles/SvgCirclePacking";

import BrandGradient from "@/components/BrandGradient";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { allGenres as soundsOfSpotify } from "@/constants/soundsOfSpotify";
import { usePlayback } from "@/hooks/usePlayback";

interface SentGenre {
  title: string;
  amount: number;
}

export default function Genres() {
  const { width, height } = Dimensions.get("window");
  const { genres } = useLocalSearchParams<{ genres: string }>();
  const parsedGenres = genres ? JSON.parse(genres) : ([] as SentGenre[]);
  const [data, setData] = useState<DataNode>({
    name: "root",
    title: "",
    depth: 0,
    children: [],
  });
  const [selectedNode, setSelectedNode] = useState("");

  const { playPlayList } = usePlayback();

  const addNodes = (nodes: DataNode[]) => {
    setData((prev) => {
      const newChildren = [...prev.children, ...nodes];
      return { ...prev, children: newChildren };
    });
  };

  const packGenres = (genres: SentGenre[]) => {
    try {
      if (genres && genres.length > 0) {
        return genres.map((g) => {
          return {
            name: g.title,
            depth: 1,
            value: g.amount,
          };
        }) as DataNode[];
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRecommendationsGenre = async (genre: string) => {
    try {
      const obj = soundsOfSpotify[genre];
      if (obj && obj.href) {
        console.log(obj);
        const regex = /(?<=playlists\/)[^/]+/;
        const match = obj.href.match(regex);
        console.log(match);
        match && playPlayList(match[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onPlay = async () => {
    if (selectedNode && selectedNode != "root") {
      console.log("Should play!");
      await fetchRecommendationsGenre(selectedNode);
    }
  };

  useEffect(() => {
    console.log(parsedGenres);
    if (parsedGenres && data.children.length == 0) {
      const packed = packGenres(parsedGenres);
      console.log(packed);
      addNodes(packed);
    } else {
      console.log("no genres");
    }
  }, []);

  useEffect(() => {
    console.log(`Selected changed: ${selectedNode}`);
  }, [selectedNode]);

  return (
    <BrandGradient>
      <CirclePackingChart
        data={data}
        width={width}
        height={height}
        setSelectedNode={setSelectedNode}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 8,
          backgroundColor: "orange",
          opacity: 1,
        }}
      >
        <Text style={{ flex: 1, fontSize: 22 }}>Selected: {selectedNode}</Text>
        <TouchableOpacity
          style={{
            height: 40,
            width: 40,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
          onPress={onPlay}
        >
          <Ionicons name="play" size={30} />
        </TouchableOpacity>
      </View>
    </BrandGradient>
  );
}
