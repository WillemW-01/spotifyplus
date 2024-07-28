import { TopArtist } from "@/interfaces/topItems";
import { useCallback, useRef, useState } from "react";
import { useUser } from "./useUser";
import { Data } from "react-native-vis-network";
import { getNeighbours, PackedArtist } from "@/utils/graphUtils";
import { Artist, useArtist } from "./useArtist";
import { usePlayLists } from "./usePlayList";
import { PlayListObject } from "@/interfaces/playlists";
import { Track } from "@/interfaces/tracks";
import { dedup, dedupObjArray } from "@/utils/miscUtils";

interface Edge {
  from: number;
  to: number;
  value: number;
}

const DEBUG = true;

export function useGraphData() {
  const [graphData, setGraphData] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const artists = useRef<PackedArtist[]>([]);
  const tracks = useRef<PackedPlaylistObject[] | FlatArtist[]>([]);

  const { getTopArtistsAll } = useUser();
  const { getArtistGenres, getRelatedArtists } = useArtist();
  const { getPlayListItemsAll } = usePlayLists();

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

  interface PackedTrack extends Omit<Track, "id"> {
    id: number;
    guid: string;
  }

  interface PackedPlaylistObject extends PlayListObject {
    track: PackedTrack;
  }

  const packPlayListItem = useCallback(
    (playListItem: PlayListObject, index: number): PackedPlaylistObject => ({
      added_at: playListItem.added_at,
      added_by: playListItem.added_by,
      is_local: playListItem.is_local,
      track: {
        ...playListItem.track,
        id: index,
        guid: playListItem.track.id,
      },
    }),
    []
  );

  const packArtists = useCallback(
    (artists: TopArtist[]): PackedArtist[] => artists.map(packArtistItem),
    [packArtistItem]
  );

  const packPlayListItems = useCallback(
    (playLists: PlayListObject[]): PackedPlaylistObject[] =>
      playLists.map(packPlayListItem),
    [packPlayListItem]
  );

  const alreadyConnected = (
    nodeFrom: PackedArtist | PackedTrack,
    nodeTo: PackedArtist | PackedTrack,
    edges: Edge[]
  ): number => {
    for (let i = 0; i < edges.length; i++) {
      const fromTo = edges[i].from === nodeFrom.id && edges[i].to === nodeTo.id;
      const toFrom = edges[i].to === nodeFrom.id && edges[i].from === nodeTo.id;
      if (fromTo || toFrom) {
        return i;
      }
    }
    return -1;
  };

  const connectMutalGenres = (
    artistFrom: PackedArtist,
    artistTo: PackedArtist,
    cumulatedEdges: Edge[]
  ) => {
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
  };

  const connectedRelatedArtists = async (
    artistFrom: PackedArtist,
    artistTo: PackedArtist,
    relatedArtists: Artist[],
    cumulatedEdges: Edge[]
  ) => {
    console.log(`Getting related artists for ${artistFrom.title}`);
    if (relatedArtists.some((relatedArtist) => relatedArtist.id === artistTo.guid)) {
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
  };

  const connectArtists = async (artists: PackedArtist[]): Promise<Edge[]> => {
    const tempEdges = [] as Edge[];

    for (let i = 0; i < artists.length; i++) {
      const relatedArtists = await getRelatedArtists(artists[i].guid);
      for (let j = 0; j < artists.length; j++) {
        if (i !== j) {
          connectMutalGenres(artists[i], artists[j], tempEdges);
          connectedRelatedArtists(artists[i], artists[j], relatedArtists, tempEdges);
        }
      }
    }

    return tempEdges;
  };

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

  const buildGraphArtists = useCallback(async () => {
    setLoading(true);
    try {
      if (DEBUG) {
        console.log("Using saved nodes and edges");
        setGraphData({
          nodes: savedNodes,
          edges: savedEdges,
        });
        console.log("Done connecting!");
        return;
      }

      const items = await getTopArtistsAll();
      console.log("Got artists!");
      if (items) {
        console.log("Artsts came back");
        // await buildArtistGenreMap(items);
        // console.log(artists);
        const formattedArtists = packArtists(items);
        artists.current = formattedArtists;
        console.log("artists length: ", artists.current.length);
        const tempEdges = await connectArtists(formattedArtists);
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

  const removeDuplicates = (artists: FlatArtist[]): FlatArtist[] => {
    const seen = new Set<string>();
    return artists.filter((artist) => {
      const duplicate = seen.has(artist.guid);
      seen.add(artist.guid);
      return !duplicate;
    });
  };

  const getAllArtists = (tracks: PackedPlaylistObject[]) => {
    let artists = [] as FlatArtist[];
    tracks.forEach((track) => {
      const flatArtists = track.track.artists.map(
        (a) => ({ id: 0, guid: a.id, name: a.name } as FlatArtist)
      );
      console.log("Artist names: ", flatArtists);
      artists.push(...flatArtists);
    });

    artists = removeDuplicates(artists);

    return artists.map((a, i) => ({ ...a, id: i }));
  };

  const shareMutualArtists = (trackFrom: PackedTrack, trackTo: PackedTrack) => {
    return trackFrom.artists.some((artistFrom) =>
      trackTo.artists.some((artistTo) => artistFrom.id === artistTo.id)
    );
  };

  const connectMutualTracks = useCallback(
    (trackFrom: PackedTrack, trackTo: PackedTrack, cumulatedEdges: Edge[]) => {
      // first, connect two tracks if they share any artists
      if (shareMutualArtists(trackFrom, trackTo)) {
        const connected = alreadyConnected(trackFrom, trackTo, cumulatedEdges);
        if (connected >= 0) {
          return;
        } else {
          cumulatedEdges.push({
            from: trackFrom.id,
            to: trackTo.id,
            value: 1,
          });
        }
      }
    },
    []
  );

  interface FlatArtist {
    id: number;
    guid: string;
    name: string;
  }

  const connectTracksToArtists = useCallback(
    (tracks: PackedPlaylistObject[], allArtists: FlatArtist[]) => {
      const tempEdges = [] as Edge[];
      tracks.forEach((from, i) => {
        from.track.artists.forEach((artist) => {
          const index = allArtists.findIndex((a) => a.guid === artist.id);
          if (index >= 0) {
            tempEdges.push({
              from: i,
              to: index + tracks.length,
              value: 1,
            });
          }
        });
      });
      return tempEdges;
    },
    [getNeighbours, graphData.edges]
  );

  const connectTracksViaGenres = useCallback(
    (tracks: PackedPlaylistObject[]) => {
      const tempEdges = [] as Edge[];
      tracks.forEach((from, i) => {
        tracks.forEach((to, j) => {
          if (i !== j) {
            connectMutualTracks(from.track, to.track, tempEdges);
          }
        });
      });
      return tempEdges;
    },
    [getNeighbours, graphData.edges]
  );

  const buildGraphPlaylist = async (playListId: string) => {
    setLoading(true);
    try {
      const response = await getPlayListItemsAll(playListId);
      console.log(`Got back ${response.length} items!`);
      const formattedItems = packPlayListItems(response);

      const allArtists = getAllArtists(formattedItems);
      tracks.current = formattedItems.concat(...allArtists);
      const tempNodes = formattedItems.map((item) => {
        return {
          id: item.track.id,
          label: item.track.name,
          shape: "dot",
        };
      });

      tempNodes.push(
        ...allArtists.map((a) => ({
          id: a.id + formattedItems.length,
          label: a.name,
          shape: "dot",
          color: "#e9495f",
          mass: 5,
        }))
      );
      const tempEdges = connectTracksToArtists(formattedItems, allArtists);
      console.log(`Edges Length: ${tempEdges.length}`);

      setGraphData({
        nodes: tempNodes,
        edges: tempEdges,
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
    graphData,
    artists: artists.current,
    tracks: tracks.current,
    loading,
    buildGraphArtists,
    buildGraphPlaylist,
    getArtistNeighbours,
  };
}

const savedNodes = [
  { id: 0, label: "Emily James", shape: "dot" },
  { id: 1, label: "Trousdale", shape: "dot" },
  { id: 2, label: "The Paper Kites", shape: "dot" },
  { id: 3, label: "Hazlett", shape: "dot" },
  { id: 4, label: "Catching Flies", shape: "dot" },
  { id: 5, label: "Sweatson Klank", shape: "dot" },
  { id: 6, label: "Wild Rivers", shape: "dot" },
  { id: 7, label: "santpoort", shape: "dot" },
  { id: 8, label: "Johnnyswim", shape: "dot" },
  { id: 9, label: "Parra for Cuva", shape: "dot" },
  { id: 10, label: "Matthew Mole", shape: "dot" },
  { id: 11, label: "Hermanito", shape: "dot" },
  { id: 12, label: "Alex Lustig", shape: "dot" },
  { id: 13, label: "Ben Rector", shape: "dot" },
  { id: 14, label: "Angus & Julia Stone", shape: "dot" },
  { id: 15, label: "Jordy Searcy", shape: "dot" },
  { id: 16, label: "Passenger", shape: "dot" },
  { id: 17, label: "Bonobo", shape: "dot" },
  { id: 18, label: "Benson Boone", shape: "dot" },
  { id: 19, label: "The National Parks", shape: "dot" },
  { id: 20, label: "Aquilo", shape: "dot" },
  { id: 21, label: "Riaan Benadé", shape: "dot" },
  { id: 22, label: "Stephen Sanchez", shape: "dot" },
  { id: 23, label: "Carly Rae Jepsen", shape: "dot" },
  { id: 24, label: "Ben Böhmer", shape: "dot" },
  { id: 25, label: "John Mayer", shape: "dot" },
  { id: 26, label: "erwOn", shape: "dot" },
  { id: 27, label: "braj mahal", shape: "dot" },
  { id: 28, label: "Laura Omloop", shape: "dot" },
  { id: 29, label: "Affelaye", shape: "dot" },
  { id: 30, label: "Henry Green", shape: "dot" },
  { id: 31, label: "Emily James", shape: "dot" },
  { id: 32, label: "George Ezra", shape: "dot" },
  { id: 33, label: "FLEUR", shape: "dot" },
  { id: 34, label: "Jacana People", shape: "dot" },
  { id: 35, label: "Schule der Erweckung", shape: "dot" },
  { id: 36, label: "Liam Mour", shape: "dot" },
  { id: 37, label: "Duke Boara", shape: "dot" },
  { id: 38, label: "AVAION", shape: "dot" },
  { id: 39, label: "Chance Peña", shape: "dot" },
  { id: 40, label: "Riley Pearce", shape: "dot" },
  { id: 41, label: "Woodlock", shape: "dot" },
  { id: 42, label: "Noah Kahan", shape: "dot" },
  { id: 43, label: "Blanco White", shape: "dot" },
  { id: 44, label: "Dilla", shape: "dot" },
  { id: 45, label: "The Light The Heat", shape: "dot" },
  { id: 46, label: "Ryan Harris", shape: "dot" },
  { id: 47, label: "Hollow Coves", shape: "dot" },
  { id: 48, label: "MEAU", shape: "dot" },
  { id: 49, label: "LO Worship", shape: "dot" },
  { id: 50, label: "Gregory Alan Isakov", shape: "dot" },
  { id: 51, label: "Paul Sinha", shape: "dot" },
  { id: 52, label: "Bjéar", shape: "dot" },
  { id: 53, label: "Penny and Sparrow", shape: "dot" },
  { id: 54, label: "Drew Holcomb & The Neighbors", shape: "dot" },
  { id: 55, label: "Jon and Roy", shape: "dot" },
  { id: 56, label: "Bridge Worship", shape: "dot" },
  { id: 57, label: "Hans Zimmer", shape: "dot" },
  { id: 58, label: "Dekker", shape: "dot" },
  { id: 59, label: "Dean Lewis", shape: "dot" },
  { id: 60, label: "NEEDTOBREATHE", shape: "dot" },
  { id: 61, label: "Ed Sheeran", shape: "dot" },
  { id: 62, label: "Samuel Harfst", shape: "dot" },
  { id: 63, label: "Oshima Brothers", shape: "dot" },
  { id: 64, label: "Mura Masa", shape: "dot" },
  { id: 65, label: "Novo Amor", shape: "dot" },
  { id: 66, label: "GoldLink", shape: "dot" },
  { id: 67, label: "Colossal Trailer Music", shape: "dot" },
  { id: 68, label: "Gordi", shape: "dot" },
  { id: 69, label: "Suzan & Freek", shape: "dot" },
  { id: 70, label: "Shallou", shape: "dot" },
  { id: 71, label: "Olivia Rodrigo", shape: "dot" },
  { id: 72, label: "mehro", shape: "dot" },
  { id: 73, label: "Ramin Djawadi", shape: "dot" },
  { id: 74, label: "Provinz", shape: "dot" },
  { id: 75, label: "Elderbrook", shape: "dot" },
  { id: 76, label: "WizTheMc", shape: "dot" },
  { id: 77, label: "Garrett Kato", shape: "dot" },
  { id: 78, label: "Abby Holliday", shape: "dot" },
  { id: 79, label: "Dermot Kennedy", shape: "dot" },
  { id: 80, label: "Morningsiders", shape: "dot" },
  { id: 81, label: "Steve Umculo", shape: "dot" },
  { id: 82, label: "Bre Kennedy", shape: "dot" },
  { id: 83, label: "TWO LANES", shape: "dot" },
  { id: 84, label: "Umberto Tozzi", shape: "dot" },
  { id: 85, label: "Tropikel Ltd", shape: "dot" },
  { id: 86, label: "Eros Ramazzotti", shape: "dot" },
  { id: 87, label: "Annika Bennett", shape: "dot" },
  { id: 88, label: "LULLANAS", shape: "dot" },
];
const savedEdges = [
  { from: 0, to: 18, value: 2 },
  { from: 0, to: 39, value: 2 },
  { from: 0, to: 61, value: 2 },
  { from: 0, to: 82, value: 1 },
  { from: 1, to: 3, value: 2 },
  { from: 1, to: 40, value: 2 },
  { from: 1, to: 41, value: 2 },
  { from: 1, to: 45, value: 2 },
  { from: 1, to: 46, value: 2 },
  { from: 1, to: 47, value: 2 },
  { from: 1, to: 53, value: 1 },
  { from: 1, to: 77, value: 2 },
  { from: 1, to: 78, value: 2 },
  { from: 1, to: 82, value: 1 },
  { from: 1, to: 87, value: 1 },
  { from: 2, to: 6, value: 2 },
  { from: 2, to: 14, value: 5 },
  { from: 2, to: 19, value: 2 },
  { from: 2, to: 20, value: 2 },
  { from: 2, to: 40, value: 2 },
  { from: 2, to: 41, value: 5 },
  { from: 2, to: 43, value: 4 },
  { from: 2, to: 47, value: 6 },
  { from: 2, to: 50, value: 8 },
  { from: 2, to: 53, value: 6 },
  { from: 2, to: 54, value: 2 },
  { from: 2, to: 65, value: 4 },
  { from: 2, to: 77, value: 2 },
  { from: 3, to: 39, value: 2 },
  { from: 3, to: 40, value: 3 },
  { from: 3, to: 41, value: 4 },
  { from: 3, to: 45, value: 2 },
  { from: 3, to: 46, value: 4 },
  { from: 3, to: 47, value: 3 },
  { from: 3, to: 77, value: 4 },
  { from: 3, to: 78, value: 2 },
  { from: 4, to: 9, value: 4 },
  { from: 4, to: 17, value: 2 },
  { from: 4, to: 29, value: 2 },
  { from: 4, to: 30, value: 2 },
  { from: 6, to: 3, value: 1 },
  { from: 6, to: 8, value: 2 },
  { from: 6, to: 16, value: 2 },
  { from: 6, to: 19, value: 2 },
  { from: 6, to: 32, value: 2 },
  { from: 6, to: 50, value: 2 },
  { from: 6, to: 53, value: 2 },
  { from: 6, to: 60, value: 2 },
  { from: 6, to: 63, value: 2 },
  { from: 6, to: 79, value: 2 },
  { from: 6, to: 80, value: 4 },
  { from: 6, to: 88, value: 2 },
  { from: 8, to: 13, value: 4 },
  { from: 8, to: 16, value: 2 },
  { from: 8, to: 19, value: 2 },
  { from: 8, to: 32, value: 2 },
  { from: 8, to: 53, value: 4 },
  { from: 8, to: 54, value: 4 },
  { from: 8, to: 60, value: 3 },
  { from: 8, to: 63, value: 2 },
  { from: 8, to: 79, value: 2 },
  { from: 8, to: 80, value: 2 },
  { from: 8, to: 88, value: 2 },
  { from: 9, to: 17, value: 2 },
  { from: 9, to: 24, value: 1 },
  { from: 12, to: 70, value: 2 },
  { from: 13, to: 15, value: 4 },
  { from: 13, to: 16, value: 2 },
  { from: 13, to: 19, value: 2 },
  { from: 13, to: 25, value: 2 },
  { from: 13, to: 45, value: 2 },
  { from: 13, to: 53, value: 5 },
  { from: 13, to: 54, value: 4 },
  { from: 13, to: 60, value: 2 },
  { from: 14, to: 41, value: 2 },
  { from: 14, to: 43, value: 2 },
  { from: 14, to: 47, value: 2 },
  { from: 14, to: 50, value: 2 },
  { from: 14, to: 53, value: 2 },
  { from: 14, to: 65, value: 2 },
  { from: 15, to: 19, value: 2 },
  { from: 15, to: 45, value: 2 },
  { from: 15, to: 53, value: 4 },
  { from: 16, to: 19, value: 2 },
  { from: 16, to: 25, value: 2 },
  { from: 16, to: 32, value: 4 },
  { from: 16, to: 60, value: 2 },
  { from: 16, to: 63, value: 2 },
  { from: 16, to: 79, value: 2 },
  { from: 16, to: 80, value: 2 },
  { from: 16, to: 88, value: 2 },
  { from: 18, to: 22, value: 2 },
  { from: 18, to: 39, value: 3 },
  { from: 18, to: 42, value: 2 },
  { from: 18, to: 59, value: 2 },
  { from: 18, to: 61, value: 2 },
  { from: 19, to: 32, value: 2 },
  { from: 19, to: 50, value: 2 },
  { from: 19, to: 53, value: 3 },
  { from: 19, to: 54, value: 4 },
  { from: 19, to: 60, value: 2 },
  { from: 19, to: 63, value: 2 },
  { from: 19, to: 79, value: 2 },
  { from: 19, to: 80, value: 4 },
  { from: 19, to: 88, value: 2 },
  { from: 20, to: 30, value: 2 },
  { from: 20, to: 40, value: 2 },
  { from: 20, to: 41, value: 2 },
  { from: 20, to: 43, value: 2 },
  { from: 20, to: 47, value: 2 },
  { from: 20, to: 64, value: 2 },
  { from: 20, to: 70, value: 2 },
  { from: 20, to: 77, value: 2 },
  { from: 22, to: 39, value: 1 },
  { from: 22, to: 72, value: 2 },
  { from: 23, to: 59, value: 2 },
  { from: 23, to: 61, value: 2 },
  { from: 23, to: 71, value: 2 },
  { from: 24, to: 83, value: 2 },
  { from: 30, to: 64, value: 2 },
  { from: 30, to: 70, value: 2 },
  { from: 32, to: 60, value: 2 },
  { from: 32, to: 63, value: 2 },
  { from: 32, to: 79, value: 3 },
  { from: 32, to: 80, value: 2 },
  { from: 32, to: 88, value: 2 },
  { from: 33, to: 51, value: 1 },
  { from: 34, to: 36, value: 2 },
  { from: 34, to: 37, value: 1 },
  { from: 35, to: 62, value: 4 },
  { from: 39, to: 42, value: 2 },
  { from: 39, to: 50, value: 1 },
  { from: 39, to: 61, value: 2 },
  { from: 39, to: 65, value: 2 },
  { from: 40, to: 41, value: 6 },
  { from: 40, to: 43, value: 2 },
  { from: 40, to: 45, value: 2 },
  { from: 40, to: 46, value: 3 },
  { from: 40, to: 47, value: 5 },
  { from: 40, to: 77, value: 6 },
  { from: 40, to: 78, value: 2 },
  { from: 41, to: 43, value: 2 },
  { from: 41, to: 45, value: 2 },
  { from: 41, to: 46, value: 4 },
  { from: 41, to: 47, value: 5 },
  { from: 41, to: 77, value: 6 },
  { from: 41, to: 78, value: 2 },
  { from: 42, to: 50, value: 1 },
  { from: 43, to: 47, value: 4 },
  { from: 43, to: 50, value: 2 },
  { from: 43, to: 53, value: 2 },
  { from: 43, to: 55, value: 2 },
  { from: 43, to: 65, value: 2 },
  { from: 43, to: 77, value: 2 },
  { from: 44, to: 85, value: 4 },
  { from: 45, to: 46, value: 2 },
  { from: 45, to: 47, value: 2 },
  { from: 45, to: 53, value: 2 },
  { from: 45, to: 77, value: 2 },
  { from: 45, to: 78, value: 2 },
  { from: 46, to: 47, value: 2 },
  { from: 46, to: 77, value: 4 },
  { from: 46, to: 78, value: 2 },
  { from: 47, to: 6, value: 1 },
  { from: 47, to: 50, value: 3 },
  { from: 47, to: 53, value: 2 },
  { from: 47, to: 65, value: 4 },
  { from: 47, to: 77, value: 5 },
  { from: 47, to: 78, value: 2 },
  { from: 48, to: 51, value: 3 },
  { from: 48, to: 69, value: 4 },
  { from: 49, to: 56, value: 6 },
  { from: 50, to: 53, value: 6 },
  { from: 50, to: 54, value: 2 },
  { from: 50, to: 65, value: 4 },
  { from: 51, to: 69, value: 2 },
  { from: 53, to: 54, value: 6 },
  { from: 53, to: 65, value: 2 },
  { from: 54, to: 60, value: 1 },
  { from: 55, to: 46, value: 1 },
  { from: 55, to: 58, value: 2 },
  { from: 57, to: 73, value: 8 },
  { from: 59, to: 61, value: 2 },
  { from: 59, to: 71, value: 2 },
  { from: 59, to: 79, value: 2 },
  { from: 60, to: 63, value: 2 },
  { from: 60, to: 79, value: 2 },
  { from: 60, to: 80, value: 2 },
  { from: 60, to: 88, value: 2 },
  { from: 61, to: 71, value: 2 },
  { from: 61, to: 79, value: 2 },
  { from: 63, to: 79, value: 2 },
  { from: 63, to: 80, value: 2 },
  { from: 63, to: 82, value: 1 },
  { from: 63, to: 88, value: 4 },
  { from: 64, to: 66, value: 1 },
  { from: 64, to: 70, value: 2 },
  { from: 65, to: 3, value: 1 },
  { from: 65, to: 20, value: 1 },
  { from: 72, to: 39, value: 1 },
  { from: 72, to: 65, value: 1 },
  { from: 75, to: 24, value: 1 },
  { from: 75, to: 70, value: 1 },
  { from: 75, to: 83, value: 2 },
  { from: 77, to: 78, value: 2 },
  { from: 78, to: 87, value: 2 },
  { from: 79, to: 80, value: 2 },
  { from: 79, to: 88, value: 2 },
  { from: 80, to: 15, value: 1 },
  { from: 80, to: 88, value: 2 },
  { from: 82, to: 87, value: 2 },
  { from: 83, to: 70, value: 1 },
  { from: 84, to: 86, value: 3 },
  { from: 88, to: 0, value: 1 },
  { from: 88, to: 77, value: 1 },
  { from: 88, to: 82, value: 1 },
];
