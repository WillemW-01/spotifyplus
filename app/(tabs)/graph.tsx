import React, { useEffect, useRef, useState } from "react";
import VisNetwork, { Data, VisNetworkRef } from "react-native-vis-network";
import BrandGradient from "@/components/BrandGradient";
import { TopArtist } from "@/interfaces/topItems";
import { usePlayback } from "@/hooks/usePlayback";
import { useUser } from "@/hooks/useUser";
import { useGraphMetrics } from "@/hooks/useGraphMetrics";
import { useArtist } from "@/hooks/useArtist";

export interface PackedArtist {
  title: string;
  id: number;
  guid: string;
  popularity: number;
  imageUri: string;
  genres: string[];
}

interface Edge {
  from: number;
  to: number;
}

interface Node {
  id: number;
  label: string;
  shape: string;
}

export default function Graph() {
  const [showGraph, setShowGraph] = useState(false);
  const data = useRef<Data>({
    edges: [],
    nodes: [],
  });
  const artists = useRef<PackedArtist[]>([]);

  const { getNeighbours } = useGraphMetrics();
  const { getTopTracks } = useArtist();
  const { playTracks } = usePlayback();

  const [loading, setLoading] = useState<boolean>(false);
  const visNetworkRef = useRef<VisNetworkRef>(null);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  useEffect(() => {
    if (loading || visNetworkRef.current) {
      const subscription = visNetworkRef.current.addEventListener(
        "click",
        async (event: any) => {
          if (event.nodes.length > 0) {
            const currNode = event.nodes[0];
            // const neighbours = await getImmediateNeighbours(currNode);
            console.log("current edge length: ", data.current.edges.length);
            const neighbours = getNeighbours(currNode, data.current.edges);
            console.log("Neighbours: ", neighbours);
            if (neighbours.length > 0 && artists.current.length > 0) {
              const tracks = [] as string[];
              for (const neighbour of neighbours) {
                const currArtist = artists.current[neighbour];
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
          }
        }
      );

      return subscription.remove;
    }
  }, [loading]);

  const { getTopArtistsAll } = useUser();

  const packArtistItem = (artistItem: TopArtist, index: number) => {
    return {
      title: artistItem.name,
      // subtitle: String(artistItem.popularity),
      id: index,
      guid: artistItem.id,
      popularity: artistItem.popularity,
      genres: artistItem.genres,
      imageUri: artistItem.images[0].url,
      width: 90,
    };
  };

  const packArtists = (artists: TopArtist[]): PackedArtist[] =>
    artists.map(packArtistItem);

  const connectMutalGenres = (
    artistFrom: PackedArtist,
    artistTo: PackedArtist
  ): Edge[] => {
    const edges = [] as Edge[];

    artistFrom.genres.forEach((genre) => {
      if (artistTo.genres.includes(genre)) {
        edges.push({ from: artistFrom.id, to: artistTo.id });
      }
    });
    return edges;
  };

  const connectArtists = (artists: PackedArtist[]): Edge[] => {
    const tempEdges = [] as Edge[];
    for (let i = 0; i < artists.length; i++) {
      // console.log(`From: ${artists[i].title}`);
      for (let j = 0; j < artists.length; j++) {
        if (i !== j) {
          // console.log(`To: ${artists[j].title}`);
          const edges = connectMutalGenres(artists[i], artists[j]);
          if (edges.length > 0) {
            // console.log("Mutal genres: ", edges);
            tempEdges.push(...edges);
          }
        }
      }
    }

    return tempEdges;
  };

  const fetchArtists = async () => {
    const items = await getTopArtistsAll();
    console.log("Got artists!");
    if (items) {
      console.log("Artsts came back");
      const formattedArtists = packArtists(items);
      artists.current = formattedArtists;
      console.log("artists length: ", artists.current.length);
      const tempEdges = connectArtists(formattedArtists);
      const tempNodes = formattedArtists.map((item) => {
        return {
          id: item.id,
          label: item.title,
          shape: "dot",
        };
      });
      // console.log(tempEdges);
      // console.log(tempNodes);
      data.current = {
        nodes: tempNodes,
        edges: tempEdges,
      };
      console.log("Done connecting!");
      setShowGraph(true);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return (
    <BrandGradient>
      {/* // <ThemedText type="title" text="Graph" /> */}
      {showGraph && (
        <VisNetwork
          data={data.current}
          options={{ nodes: { color: { background: "black" } } }}
          onLoad={() => setLoading(true)}
          ref={visNetworkRef}
        />
      )}
    </BrandGradient>
  );
}
