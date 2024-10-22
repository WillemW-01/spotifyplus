import { useEffect, useState } from "react";
import { Data } from "react-native-vis-network";
import { CustomArtist } from "@/interfaces/tracks";
import { Connection } from "@/constants/graphConnections";
import { useDb } from "./useDb";
import { BuildGraphArtistsProps, Edge, Node } from "@/interfaces/graphs";
import { TopArtist } from "@/interfaces/topItems";
import { useUser } from "./useUser";
import { Artist, useArtist } from "./useArtist";

export default function useGraphPlaylist() {
  const [graphArtist, setGraphArtist] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  const { getTopArtistsAll } = useUser();
  const { getArtistGenres, getRelatedArtists } = useArtist();
  const { getRelatedArtists: getLocalRelatedArtists, insertRelatedArtists } = useDb();

  const fromTo = (edge, from, to) => edge.from === from && edge.to === to;
  const toFrom = (edge, from, to) => edge.from === to && edge.to === from;

  const isConnected = (
    from: number,
    to: number,
    edges: Edge[],
    directed = true
  ): boolean => {
    return edges.some(
      (edge) => fromTo(edge, from, to) || (!directed && toFrom(edge, from, to))
    );
  };

  const findEdgeIndex = (
    from: number,
    to: number,
    edges: Edge[],
    directed = true
  ): number => {
    return edges.findIndex(
      (edge) => fromTo(edge, from, to) || (!directed && toFrom(edge, from, to))
    );
  };

  const buildNode = (
    id: number,
    guid: string,
    name: string,
    group: "artist" | "song" = "song"
  ) =>
    ({
      id: id,
      guid: guid,
      label: name,
      shape: "dot",
      group: group,
    } as Node);

  const packNodes = (artists: TopArtist[]) => {
    return artists.map(
      (artist, i) => ({ ...buildNode(i, artist.id, artist.name, "artist") } as Node)
    );
  };

  const formatNodes = (artists: TopArtist[]) => {
    return packNodes(artists);
  };

  const pushEdge = (tempEdges: Edge[], from: number, to: number, weight?: number) => {
    tempEdges.push({ from, to, value: weight ?? 1 });
  };

  const connectRelatedArtists = (
    from: TopArtist,
    to: TopArtist,
    relatedArtists: Artist[],
    edge: Edge[]
  ) => {
    return [{} as Edge];
  };

  const connectByGenres = (
    from: TopArtist,
    fromIndex: number,
    to: TopArtist,
    toIndex: number,
    edges: Edge[]
  ) => {
    for (const genre of from.genres) {
      if (to.genres.includes(genre)) {
        const connected = findEdgeIndex(fromIndex, toIndex, edges, false);
        if (connected >= 0) {
          edges[connected].value += 1;
        } else {
          pushEdge(edges, fromIndex, toIndex, 1);
        }
      }
    }
  };

  const downloadRelatedArtists = async (artistId: string) => {
    const localRelated = await getLocalRelatedArtists(artistId);
    const inDb = localRelated.length != 0;
    if (!inDb) {
      const onlineRelated = await getRelatedArtists(artistId);
      await insertRelatedArtists(artistId, onlineRelated);
      return onlineRelated;
    } else {
      return localRelated;
    }
  };

  const connectNodes = async (connectionTypes: Connection[], artists: TopArtist[]) => {
    const toConnect = connectionTypes.map((c) => c.name);
    const doAlbumGenres = toConnect.includes("Album Genres");
    const doRelated = toConnect.includes("Related Artists");

    const tempEdges = [] as Edge[];
    for (let i = 0; i < artists.length; i++) {
      console.log(`> Getting related artists for ${artists[i].name}`);
      const relatedArtists = doRelated ? await downloadRelatedArtists(artists[i].id) : [];
      doAlbumGenres && console.log("\tConnecting by album genres");
      doRelated && console.log("\tConnecting by related artists");
      for (let j = 0; j < artists.length; j++) {
        if (i !== j) {
          doAlbumGenres && connectByGenres(artists[i], i, artists[j], j, tempEdges);
          doRelated &&
            connectRelatedArtists(artists[i], artists[j], relatedArtists, tempEdges);
        }
      }
    }
    return tempEdges;
  };

  const buildGraphArtist = async ({
    timeFrame,
    artists,
    connectionTypes,
  }: BuildGraphArtistsProps) => {
    setLoading(true);
    try {
      console.log(`Connection type: ${connectionTypes[0].name}`);

      const localArtists = !artists ? await getTopArtistsAll(timeFrame) : artists;

      const nodes = formatNodes(localArtists);
      const edges = await connectNodes(connectionTypes, localArtists);
      console.log(`Made ${edges.length} connections`);

      setGraphArtist({
        nodes: nodes,
        edges: edges,
      });
      console.log("Done connecting!");
      setLoading(false);
    } catch (error) {
      console.log("Failed to fetch playlists: ", error);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`In useGraphArtist: ${JSON.stringify(graphArtist)}`);
  }, [graphArtist]);

  return {
    graphArtist,
    setGraphArtist,
    loading,
    buildGraphArtist,
  };
}
