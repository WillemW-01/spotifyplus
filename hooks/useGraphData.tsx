import { TopArtist } from "@/interfaces/topItems";
import { useCallback, useRef, useState } from "react";
import { useUser } from "./useUser";
import { Data } from "react-native-vis-network";
import { getNeighbours, PackedArtist } from "@/utils/graphUtils";

interface Edge {
  from: number;
  to: number;
}

export function useGraphData() {
  const [graphData, setGraphData] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const artists = useRef<PackedArtist[]>([]);

  const { getTopArtistsAll } = useUser();

  const packArtistItem = useCallback(
    (artistItem: TopArtist, index: number) => ({
      title: artistItem.name,
      id: index,
      guid: artistItem.id,
      popularity: artistItem.popularity,
      genres: artistItem.genres,
      imageUri: artistItem.images[0]?.url,
      width: 90,
    }),
    []
  );

  const packArtists = useCallback(
    (artists: TopArtist[]): PackedArtist[] => artists.map(packArtistItem),
    [packArtistItem]
  );

  const connectMutalGenres = useCallback(
    (artistFrom: PackedArtist, artistTo: PackedArtist): Edge[] => {
      const edges = [] as Edge[];

      artistFrom.genres.forEach((genre) => {
        if (artistTo.genres.includes(genre)) {
          edges.push({ from: artistFrom.id, to: artistTo.id });
        }
      });
      return edges;
    },
    []
  );

  const connectArtists = useCallback(
    (artists: PackedArtist[]): Edge[] => {
      const tempEdges = [] as Edge[];
      for (let i = 0; i < artists.length; i++) {
        for (let j = 0; j < artists.length; j++) {
          if (i !== j) {
            const edges = connectMutalGenres(artists[i], artists[j]);
            if (edges.length > 0) {
              tempEdges.push(...edges);
            }
          }
        }
      }

      return tempEdges;
    },
    [connectMutalGenres]
  );

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
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

        setGraphData({
          nodes: tempNodes,
          edges: tempEdges,
        });
        console.log("Done connecting!");
      }
    } catch (error) {
      console.log("Failed to fetch artists: ", error);
    } finally {
      setLoading(false);
    }
  }, [getTopArtistsAll, packArtists, connectArtists]);

  const getArtistNeighbours = useCallback(
    (nodeId: number, degree = 1) => getNeighbours(nodeId, degree, graphData.edges),
    [getNeighbours, graphData.edges]
  );

  return {
    graphData,
    artists: artists.current,
    loading,
    fetchArtists,
    getArtistNeighbours,
  };
}
