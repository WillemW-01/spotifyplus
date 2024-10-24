import { Connection, ConnectionName } from "@/constants/graphConnections";

import { useDb } from "@/hooks/useDb";
import { useLogger } from "@/hooks/useLogger";

import { BuildGraphPlaylistProps, Edge, Node } from "@/interfaces/graphs";
import { CustomArtist, TrackFeature } from "@/interfaces/tracks";

import { connect } from "@/scripts/connect";
import { normaliseEdges } from "@/scripts/normalise";

import { buildNode, isConnected, pushEdge } from "@/utils/graphUtils";
import { printObj } from "@/utils/miscUtils";

import { useState } from "react";
import { Alert } from "react-native";
import { Data } from "react-native-vis-network";

export default function useGraphPlaylist() {
  const [graphPlaylist, setGraphPlaylist] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  const { getPlaylistSongs } = useDb();
  const { addLog, logError } = useLogger();

  const dedupArtists = (list: CustomArtist[], key: keyof CustomArtist) => {
    return list.reduce((accumulator: CustomArtist[], curr: CustomArtist) => {
      const exists = accumulator.some((item) => curr[key] === item[key]);
      if (!exists) accumulator.push(curr);
      return accumulator;
    }, []);
  };

  const dedupSongs = (list: TrackFeature[], key: keyof TrackFeature) =>
    list.reduce((accumulator: TrackFeature[], curr: TrackFeature) => {
      const exists = accumulator.some((item) => curr[key] === item[key]);
      if (!exists) {
        accumulator.push(curr);
      } else {
        console.log(`${curr.name} is duplicated`);
      }
      return accumulator;
    }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const hasConnection = (connectionTypes: Connection[], name: ConnectionName) =>
    connectionTypes.some((c) => c.name === name);

  const packNodes = (songs: TrackFeature[]) => {
    const uniqueSongs = dedupSongs(songs, "id");
    return uniqueSongs.map(
      (song, i) => ({ ...buildNode(i, song.id, song.name) } as Node)
    );
  };

  const packArtists = (songs: TrackFeature[]) => {
    const start = songs.length;
    const artists = dedupArtists(songs.map((s) => s.artists).flat(), "id");
    return artists.map(
      (artist, i) =>
        ({ ...buildNode(start + i, artist.id, artist.name, "artist") } as Node)
    );
  };

  const formatNodes = (connectionType: Connection, songs: TrackFeature[]) => {
    switch (connectionType.name) {
      case "Song Features":
      case "Album Genres":
        return packNodes(songs);
      case "Shared Artists": {
        const artistNodes = packArtists(songs);
        return packNodes(songs).concat(artistNodes);
      }
    }
  };

  const connectByDistance = (songs: TrackFeature[]) => {
    const edges = [] as Edge[];
    connect(songs, edges, pushEdge);
    normaliseEdges(edges);
    return edges;
  };

  const connectTracksToArtists = (songs: TrackFeature[], nodes: Node[]) => {
    const tempEdges = [] as Edge[];
    songs.forEach((from, i) => {
      from.artists.forEach((artist) => {
        const index = nodes.findIndex((a) => a.guid === artist.id);
        const already = isConnected(i, index, tempEdges);
        if (index >= 0 && !already) {
          pushEdge(tempEdges, i, index);
        }
      });
    });
    return tempEdges;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const connectByGenres = (songs: TrackFeature[], nodes: Node[]) => [{} as Edge];

  const connectNodes = (
    connectionType: Connection,
    songs: TrackFeature[],
    nodes: Node[]
  ) => {
    switch (connectionType.name) {
      case "Song Features":
        return connectByDistance(songs);
      case "Shared Artists":
        return connectTracksToArtists(songs, nodes);
      case "Album Genres":
        return connectByGenres(songs, nodes);
    }
  };

  const buildGraphPlaylist = async ({
    playlistIds,
    connectionTypes,
  }: BuildGraphPlaylistProps) => {
    setLoading(true);
    try {
      addLog(`Connection type: ${connectionTypes[0].name}`, "buildPlaylist");
      if (connectionTypes[0].name === "Album Genres") {
        Alert.alert(
          "Not implemented yet!",
          "This type of graph is not implemented yet. Coming soon.",
          [
            {
              text: "Ok",
              style: "default",
            },
          ]
        );
        setLoading(false);
        return;
      }

      addLog(
        `Sent: ${playlistIds.length} playlists, with ${playlistIds.flat()} songs`,
        "buildPlaylist"
      );
      const songs = [] as TrackFeature[];
      for (const playlist of playlistIds) {
        const response = await getPlaylistSongs(playlist);
        addLog(`Got back ${response.length} songs)}`, "buildPlaylist");
        songs.push(...response);
      }

      const nodes = formatNodes(connectionTypes[0], songs);
      const edges = connectNodes(connectionTypes[0], songs, nodes);
      addLog(
        `Made ${edges.length} connections between ${nodes.length} nodes`,
        "buildPlaylist"
      );

      setGraphPlaylist({
        nodes: nodes,
        edges: edges,
      });
      addLog("Done connecting!", "buildPlaylist");
    } catch (error) {
      logError("Failed to fetch playlists: ", error, "buildPlaylist");
    } finally {
      addLog("Setting loading to false", "buildPlaylist");
      setLoading(false);
    }
  };

  return {
    graphPlaylist,
    setGraphPlaylist,
    loading,
    buildGraphPlaylist,
  };
}
