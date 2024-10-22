import { useState } from "react";
import { Data } from "react-native-vis-network";

import { Connection } from "@/constants/graphConnections";

import { useArtist } from "@/hooks/useArtist";
import { useDb } from "@/hooks/useDb";
import { useLogger } from "@/hooks/useLogger";
import { useUser } from "@/hooks/useUser";

import { BuildGraphArtistsProps, Edge, Node } from "@/interfaces/graphs";
import { TopArtist } from "@/interfaces/topItems";
import { CustomArtist } from "@/interfaces/tracks";

import { buildNode, findEdgeIndex, pushEdge } from "@/utils/graphUtils";

export default function useGraphPlaylist() {
  const [graphArtist, setGraphArtist] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  const { getTopArtistsAll } = useUser();
  const { getRelatedArtists } = useArtist();
  const { getRelatedArtists: getLocalRelatedArtists, insertRelatedArtists } = useDb();
  const { addLog, logError } = useLogger();

  const packNodes = (artists: TopArtist[]) => {
    return artists.map(
      (artist, i) => ({ ...buildNode(i, artist.id, artist.name, "artist") } as Node)
    );
  };

  const formatNodes = (artists: TopArtist[]) => {
    return packNodes(artists);
  };

  const connectRelatedArtists = (
    fromIndex: number,
    to: TopArtist,
    toIndex: number,
    relatedArtists: CustomArtist[],
    edges: Edge[]
  ) => {
    if (relatedArtists.some((relatedArtist) => relatedArtist.id === to.id)) {
      const connected = findEdgeIndex(fromIndex, toIndex, edges, false);
      if (connected >= 0) {
        edges[connected].value += 1;
      } else {
        pushEdge(edges, fromIndex, toIndex);
      }
    }
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

  const downloadRelatedArtists = async (artist: TopArtist) => {
    const localRelated = await getLocalRelatedArtists(artist.id);
    const inDb = localRelated.length != 0;
    if (!inDb) {
      const onlineRelated = await getRelatedArtists(artist.id);
      await insertRelatedArtists(artist, onlineRelated);
      const customArtists = onlineRelated.map(
        (artist) => ({ id: artist.id, name: artist.name } as CustomArtist)
      );
      return customArtists;
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
      addLog(`> Working with ${artists[i].name} (${artists[i].id})`, "connectNodes");
      const relatedArtists = doRelated ? await downloadRelatedArtists(artists[i]) : [];
      doAlbumGenres && addLog("Connecting by album genres", "connectNodes", 1);
      doRelated && addLog("Connecting by related artists", "connectNodes");
      for (let j = 0; j < artists.length; j++) {
        if (i !== j) {
          doAlbumGenres && connectByGenres(artists[i], i, artists[j], j, tempEdges);
          doRelated && connectRelatedArtists(i, artists[j], j, relatedArtists, tempEdges);
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
      addLog(`Connection types: ${connectionTypes.map((c) => c.name)}`, "buildArtist");

      const localArtists = !artists ? await getTopArtistsAll(timeFrame) : artists;

      const nodes = formatNodes(localArtists);
      const edges = await connectNodes(connectionTypes, localArtists);
      console.log(`Made ${edges.length} connections between ${nodes.length} nodes`);

      setGraphArtist({
        nodes: nodes,
        edges: edges,
      });
      addLog("Done connecting!", "buildArtist");
    } catch (error) {
      logError("Failed to fetch playlists: ", error, "buildArtist");
    } finally {
      addLog("Setting loading to false", "buildArtist");
      setLoading(false);
    }
  };

  return {
    graphArtist,
    setGraphArtist,
    loading,
    buildGraphArtist,
  };
}
