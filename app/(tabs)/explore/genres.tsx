import ThemedText from "@/components/ThemedText";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CirclePackingChart, { DataNode } from "@/components/bubbles/CircularPacking";

import BrandGradient from "@/components/BrandGradient";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
  const selectedNode = useRef<DataNode | null>(null);

  const dataOld: DataNode = {
    name: "root",
    title: "",
    depth: 0,
    children: [
      { name: "A", title: "A", value: 10, depth: 1 },
      { name: "B", title: "A", value: 20, depth: 1 },
      { name: "C", title: "A", value: 50, depth: 1 },
      { name: "D", title: "A", value: 20, depth: 1 },
      { name: "E", title: "A", value: 20, depth: 1 },
      { name: "F", title: "A", value: 10, depth: 1 },
      { name: "G", title: "A", value: 20, depth: 1 },
      { name: "H", title: "A", value: 200, depth: 1 },
    ],
  };

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

  useEffect(() => {
    console.log(parsedGenres);
    if (parsedGenres) {
      const packed = packGenres(parsedGenres);
      console.log(packed);
      addNodes(packed);
    } else {
      console.log("no genres");
    }
  }, []);

  useEffect(() => {
    if (selectedNode && selectedNode.current) {
      console.log(`Selected changed: ${JSON.stringify(selectedNode.current)}`);
    }
  }, [selectedNode.current]);

  return (
    <BrandGradient>
      <CirclePackingChart
        data={data}
        width={width}
        height={height}
        selectedRef={selectedNode}
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
        }}
      >
        <Text style={{ flex: 1 }}>Selected: </Text>
        <TouchableOpacity
          style={{
            height: 40,
            width: 40,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          <Ionicons name="play" size={30} />
        </TouchableOpacity>
      </View>
    </BrandGradient>
  );
}
