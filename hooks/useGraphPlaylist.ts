import { useState } from "react";
import { Data } from "react-native-vis-network";
import { CustomArtist, TrackFeature } from "@/interfaces/tracks";
import { Connection, ConnectionName } from "@/constants/graphConnections";
import { useDb } from "./useDb";
import { BuildGraphPlaylistProps, Edge, Node } from "@/interfaces/graphs";
import { connect } from "@/scripts/connect";
import { normaliseEdges } from "@/scripts/normalise";
import { Alert } from "react-native";

export default function useGraphPlaylist() {
  const [graphPlaylist, setGraphPlaylist] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  const { getPlaylistSongs } = useDb();

  const fromTo = (edge, from, to) => edge.from === from && edge.to === to;
  const toFrom = (edge, from, to) => edge.from === to && edge.to === from;

  const alreadyConnected = (
    from: number,
    to: number,
    edges: Edge[],
    directed = true
  ): boolean => {
    return edges.some(
      (edge) => fromTo(edge, from, to) || (directed && toFrom(edge, from, to))
    );
  };

  // const connectMutalGenres = (
  //   artistFrom: PackedArtist,
  //   artistTo: PackedArtist,
  //   cumulatedEdges: Edge[]
  // ) => {
  //   for (const genre of artistFrom.genres) {
  //     if (artistTo.genres.includes(genre)) {
  //       const connected = alreadyConnected(artistFrom, artistTo, cumulatedEdges);
  //       if (connected >= 0) {
  //         cumulatedEdges[connected].value += 1;
  //       } else {
  //         cumulatedEdges.push({
  //           from: artistFrom.id,
  //           to: artistTo.id,
  //           value: 1,
  //         });
  //       }
  //     }
  //   }
  // };

  const removeDuplicates = (list: CustomArtist[], key: keyof CustomArtist) => {
    return list.reduce((accumulator: CustomArtist[], curr: CustomArtist) => {
      const exists = accumulator.some((item) => curr[key] === item[key]);
      if (!exists) accumulator.push(curr);
      return accumulator;
    }, []);
  };

  const hasConnection = (connectionTypes: Connection[], name: ConnectionName) =>
    connectionTypes.some((c) => c.name === name);

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

  const packNodes = (songs: TrackFeature[]) => {
    return songs.map((song, i) => ({ ...buildNode(i, song.id, song.name) } as Node));
  };

  const packArtists = (songs: TrackFeature[]) => {
    const start = songs.length;
    const artists = removeDuplicates(songs.map((s) => s.artists).flat(), "id");
    // console.log(`Deduped artists: ${JSON.stringify(artists)}`);
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
        console.log(`ArtistNodes: ${JSON.stringify(artistNodes)}`);
        return packNodes(songs).concat(artistNodes);
      }
    }
  };

  const pushEdge = (tempEdges: Edge[], from: number, to: number, weight?: number) => {
    tempEdges.push({ from, to, value: weight ?? 1 });
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
        const already = alreadyConnected(i, index, tempEdges);
        console.log(
          `Index for ${from.name} -> ${artist.name}: ${index} (already: ${already})`
        );
        if (index >= 0 && !already) {
          pushEdge(tempEdges, i, index);
        }
      });
    });
    return tempEdges;
  };
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
      console.log(`Connection type: ${connectionTypes[0].name}`);
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

      const requests = playlistIds.map((id) => getPlaylistSongs(id));
      const songs = (await Promise.all(requests)).flat();

      const nodes = formatNodes(connectionTypes[0], songs);
      const edges = connectNodes(connectionTypes[0], songs, nodes);

      setGraphPlaylist({
        nodes: nodes,
        edges: edges,
      });
      console.log("Done connecting!");
    } catch (error) {
      console.log("Failed to fetch playlists: ", error);
    } finally {
      console.log("Setting loading to false");
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
