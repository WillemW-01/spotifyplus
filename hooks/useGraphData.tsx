import { TopArtist } from "@/interfaces/topItems";
import { useCallback, useRef, useState } from "react";
import { useUser } from "./useUser";
import { Data } from "react-native-vis-network";
import { getNeighbours, PackedArtist } from "@/utils/graphUtils";
import { useArtist } from "./useArtist";

interface Edge {
  from: number;
  to: number;
  value: number;
}

export function useGraphData() {
  const [graphData, setGraphData] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const artists = useRef<PackedArtist[]>([]);

  const { getTopArtistsAll } = useUser();
  const { getArtistGenres } = useArtist();

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

  const alreadyConnected = (
    artistFrom: PackedArtist,
    artistTo: PackedArtist,
    edges: Edge[]
  ): number => {
    for (let i = 0; i < edges.length; i++) {
      const fromTo = edges[i].from === artistFrom.id && edges[i].to === artistTo.id;
      const toFrom = edges[i].to === artistFrom.id && edges[i].from === artistTo.id;
      if (fromTo || toFrom) {
        return i;
      }
    }
    return -1;
  };

  const connectMutalGenres = useCallback(
    (artistFrom: PackedArtist, artistTo: PackedArtist, cumulatedEdges: Edge[]) => {
      // if (artistFrom.genres.length == 0) {
      //   console.log(`Artist ${artistFrom.guid} has no genres, skipping`);
      // }
      for (const genre of artistFrom.genres) {
        if (artistTo.genres.includes(genre)) {
          const connected = alreadyConnected(artistFrom, artistTo, cumulatedEdges);
          if (connected >= 0) {
            cumulatedEdges[connected].value += 1;
          } else {
            cumulatedEdges.push({
              from: artistFrom.id,
              to: artistTo.id,
              value: 1,
            });
          }
        }
      }
    },
    []
  );

  const connectArtists = useCallback(
    (artists: PackedArtist[]): Edge[] => {
      const tempEdges = [] as Edge[];

      for (let i = 0; i < artists.length; i++) {
        for (let j = 0; j < artists.length; j++) {
          if (i !== j) {
            connectMutalGenres(artists[i], artists[j], tempEdges);
          }
        }
      }

      return tempEdges;
    },
    [connectMutalGenres]
  );

  // Unused: because spotify doesn't give you genre info...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const buildArtistGenreMap = useCallback(
    async (artists: TopArtist[]) => {
      for (let i = 0; i < artists.length; i++) {
        console.log("Build progress: ", ((i / artists.length) * 100).toFixed(1), "%");
        const genres = await getArtistGenres(artists[i].id, 1);
        artists[i].genres = artists[i].genres.concat(...genres);
      }
    },
    [artists]
  );

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getTopArtistsAll();
      console.log("Got artists!");
      if (items) {
        console.log("Artsts came back");
        // await buildArtistGenreMap(items);
        // console.log(artists);
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
