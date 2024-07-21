import { TopArtist } from "@/interfaces/topItems";
import { useCallback, useRef, useState } from "react";
import { useUser } from "./useUser";
import { Data } from "react-native-vis-network";
import { getNeighbours, PackedArtist } from "@/utils/graphUtils";
import { useArtist } from "./useArtist";
import { usePlayLists } from "./usePlayList";
import { PlayListObject } from "@/interfaces/playlists";
import { Track } from "@/interfaces/tracks";
import { dedup, dedupObjArray } from "@/utils/miscUtils";

interface Edge {
  from: number;
  to: number;
  value: number;
}

export function useGraphData() {
  const [graphData, setGraphData] = useState<Data>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const artists = useRef<PackedArtist[]>([]);
  const tracks = useRef<PackedPlaylistObject[]>([]);

  const { getTopArtistsAll } = useUser();
  const { getArtistGenres } = useArtist();
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

  const buildGraphArtists = useCallback(async () => {
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
      tracks.current = formattedItems;
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
          color: "#ff0000",
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
    loading,
    buildGraphArtists,
    buildGraphPlaylist,
    getArtistNeighbours,
  };
}
