import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import VisNetwork, { VisNetworkRef } from "react-native-vis-network";

import { PHYSICS, resolvers, SettingsObjectType } from "@/constants/resolverObjects";

import BrandGradient from "@/components/BrandGradient";
import GraphButtonPlay from "@/components/graph/GraphButtonPlay";
import GraphBuilder, { TimeFrame } from "@/components/GraphBuilder";
import LoadingCircle from "@/components/LoadingCircle";
import SettingsView from "@/components/graph/SettingsView";
import GraphControls from "@/components/graph/GraphControls";

import { useArtist } from "@/hooks/useArtist";
import { BuildGraphArtistsProps, Edge, useGraphData } from "@/hooks/useGraphData";
import { usePlayback } from "@/hooks/usePlayback";

import { getNeighbours } from "@/utils/graphUtils";
import { shuffleArray } from "@/utils/miscUtils";

const getPhysicsOptions = (
  resolverType: keyof typeof PHYSICS,
  resolverObj: SettingsObjectType
) => {
  return {
    [`${resolverType}`]: resolverObj.values,
  };
};

export default function Graph() {
  const [key, setKey] = useState(0);
  const [selectedNode, setSelectedNode] = useState<number>(-1);
  const [graphReady, setGraphReady] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const [force, setForce] = useState<keyof typeof PHYSICS>("barnesHut");
  const [resolverObj, setResolverObj] = useState<SettingsObjectType>(resolvers.barnesHut);

  const visNetworkRef = useRef<VisNetworkRef>(null);

  const { graphData, loading, artists, buildGraphArtists, buildGraphPlaylist, tracks } =
    useGraphData();

  const { getTopTracks } = useArtist();
  const { playTracks } = usePlayback();

  const getNodeName = (nodeId: number): string => {
    console.log("Artists: ", artists.length, "Tracks: ", tracks.length);
    if (artists.length > 0) {
      console.log("Checking for the artist, id: ", nodeId, " name: ", artists[nodeId]);
      return artists[nodeId].title;
    }
    if (tracks.length > 0) {
      console.log("Checking for the track ");

      return tracks[nodeId].track.name;
    }
    return "";
  };

  const playArtistAndNeighbours = async (nodeId: number, degree = 1 | 2) => {
    if (selectedNode == -1) {
      return;
    }
    const neighbours = getNeighbours(nodeId, degree, graphData.edges as Edge[]);
    console.log("Playing neighbours: ", neighbours);
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

  const resetGraph = async () => {
    setSelectedNode(-1);
    setHasChosen(false);
    setGraphReady(false);
    setKey((prev) => prev + 1);
  };

  const setupEventListener = () => {
    if (visNetworkRef.current) {
      const subscription = visNetworkRef.current.addEventListener(
        "click",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (event: any) => {
          // console.log(JSON.stringify(event));

          if (event.nodes.length > 0) {
            const currNode = event.nodes[0];
            setSelectedNode(currNode);
            console.log("Selected node: ", currNode);
          } else if (event.nodes.length == 0) {
            setSelectedNode(-1);
          }
        }
      );

      visNetworkRef.current.setOptions({
        physics: {
          barnesHut: {},
        },
      });

      const progressSubscription = visNetworkRef.current.addEventListener(
        "stabilizationProgress",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ iterations, total }: any) => setProgress(iterations / total)
      );

      const doneSubscription = visNetworkRef.current.addEventListener(
        "stabilizationIterationsDone",
        () => setProgress(1)
      );

      return () => {
        subscription.remove();
        progressSubscription.remove();
        doneSubscription.remove();
      };
    }
  };

  useEffect(() => {
    console.log("Force: ", force);
    if (!loading && graphReady && visNetworkRef.current) {
      setResolverObj(resolvers[`${force}`]);
    }
  }, [force]);

  useEffect(() => {
    // console.log("Calling this effect");
    if (!loading && graphReady && visNetworkRef.current && resolverObj) {
      // console.log("Updating settings with resolverObj: ", resolverObj);
      visNetworkRef.current.setOptions({
        physics: {
          [`${force}`]: resolverObj.values,
        },
      });
    }
  }, [graphReady, loading, resolverObj]);

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!hasChosen) {
    return (
      <GraphBuilder
        visible={modalVisible}
        setVisible={setModalVisible}
        onArtist={({ timeFrame, artists, connectionTypes }: BuildGraphArtistsProps) =>
          buildGraphArtists({ timeFrame, artists, connectionTypes })
        }
        onPlaylist={(playlistId: string) =>
          buildGraphPlaylist(playlistId).then(() => {
            // setGraphReady(true);
            setHasChosen(true);
          })
        }
        setHasChosen={setHasChosen}
      />
    );
  }

  return (
    <BrandGradient>
      <VisNetwork
        key={key}
        data={graphData}
        options={{
          nodes: {
            borderWidthSelected: 4,
            color: {
              background: "#0d1030",
              highlight: { background: "white", border: "#0d1030" },
            },
          },
          edges: {
            color: { color: "#57585c44", highlight: "#e9495f" },
            scaling: { min: 1, max: 6 },
            hidden: false,
          },
          physics: {
            enabled: true,
            solver: force,
            ...getPhysicsOptions(force, resolverObj),
          },
          // layout: { improvedLayout: true },
          groups: {
            group1: { color: { background: "red", borderWidth: 3 } },
          },
        }}
        onLoad={() => {
          setGraphReady(true);
          setupEventListener();
        }}
        ref={visNetworkRef}
      />
      <View style={styles.bottomContainer}>
        <Text style={{ fontSize: 22, color: "#0d1030", flex: 1 }}>
          Selected: {selectedNode >= 0 ? getNodeName(selectedNode) : "-"}
        </Text>
        <GraphButtonPlay
          playImmediate={() => playArtistAndNeighbours(selectedNode, 1)}
          playSecondDegree={() => playArtistAndNeighbours(selectedNode, 2)}
          iconName="play-outline"
        />
      </View>
      <View style={styles.controlsContainer}>
        <GraphControls
          graphRef={visNetworkRef}
          resetGraph={resetGraph}
          showSettings={() => setSettingsVisible((prev) => !prev)}
        />
        <SettingsView
          visible={settingsVisible}
          setForce={setForce}
          resolverObj={resolverObj}
          setResolverObj={setResolverObj}
        />
      </View>
      {progress < 1 && <LoadingCircle progress={progress} />}
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
  controlsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    gap: 10,
    marginHorizontal: 10,
    marginVertical: 20,
    flexDirection: "row-reverse",
  },
});
