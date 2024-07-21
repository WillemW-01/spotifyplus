import React, { useEffect, useRef, useState } from "react";
import VisNetwork, { VisNetworkRef } from "react-native-vis-network";
import BrandGradient from "@/components/BrandGradient";
import { usePlayback } from "@/hooks/usePlayback";
import { useGraphData } from "@/hooks/useGraphData";
import { useArtist } from "@/hooks/useArtist";
import { Text, View, StyleSheet } from "react-native";
import { getNeighbours } from "@/utils/graphUtils";
import GraphButtonPlay from "@/components/GraphButtonPlay";
import { shuffleArray } from "@/utils/miscUtils";
import ZoomControls from "@/components/ZoomControls";

export default function Graph() {
  const [selectedArtist, setSelectedArtist] = useState<number>(-1);
  const visNetworkRef = useRef<VisNetworkRef>(null);
  const [graphReady, setGraphReady] = useState(false);

  const { graphData, loading, artists, fetchArtists } = useGraphData();

  const { getTopTracks } = useArtist();
  const { playTracks } = usePlayback();

  const playArtistAndNeighbours = async (nodeId: number, degree = 1 | 2) => {
    if (selectedArtist == -1) {
      return;
    }
    const neighbours = getNeighbours(nodeId, degree, graphData.edges);
    console.log("Neighbours: ", neighbours);
    if (neighbours.length === 0) {
      neighbours.push(nodeId);
    }

    if (artists.length > 0) {
      const tracks = [] as string[];
      for (const neighbour of neighbours) {
        const currArtist = artists[neighbour];
        const topTracks = await getTopTracks(currArtist.guid);
        const ids = topTracks.map((t) => t.id);
        tracks.push(...ids);
      }
      console.log("All ids: ", tracks);
      if (tracks.length > 0) {
        const shuffledTracks = shuffleArray(tracks);
        await playTracks(shuffledTracks);
      }
    } else {
      console.log("Artists not loaded");
    }
  };

  useEffect(() => {
    if (!loading && graphReady && visNetworkRef.current) {
      const subscription = visNetworkRef.current.addEventListener(
        "click",
        async (event: any) => {
          console.log(JSON.stringify(event));

          if (event.nodes.length > 0) {
            const currNode = event.nodes[0];
            // const neighbours = await getImmediateNeighbours(currNode);
            setSelectedArtist(currNode);
          } else if (event.nodes.length == 0) {
            setSelectedArtist(-1);
          }
        }
      );

      return subscription.remove;
    }
  }, [graphReady]);

  useEffect(() => {
    fetchArtists();
  }, []);

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <BrandGradient>
      <VisNetwork
        data={graphData}
        options={{
          nodes: { color: { background: "#0d1030" } },
          edges: {
            color: { color: "#0d1030", highlight: "#e9495f" },
            scaling: { min: 1, max: 6 },
          },
          physics: { enabled: true },
        }}
        onLoad={() => setGraphReady(true)}
        ref={visNetworkRef}
      />
      <View style={styles.bottomContainer}>
        <Text style={{ fontSize: 22, color: "#0d1030", flex: 1 }}>
          Selected: {selectedArtist >= 0 ? artists[selectedArtist].title : ""}
        </Text>
        <GraphButtonPlay
          playImmediate={() => playArtistAndNeighbours(selectedArtist, 1)}
          playSecondDegree={() => playArtistAndNeighbours(selectedArtist, 2)}
          iconName="play-outline"
        />
      </View>
      <ZoomControls graphRef={visNetworkRef} />
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: 20,
  },
});
