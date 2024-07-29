import { TopArtist } from "@/interfaces/topItems";
import { useCallback, useRef, useState } from "react";
import { useUser } from "./useUser";
import { Data } from "react-native-vis-network";
import { getNeighbours, PackedArtist } from "@/utils/graphUtils";
import { Artist, useArtist } from "./useArtist";
import { usePlayLists } from "./usePlayList";
import { PlayListObject } from "@/interfaces/playlists";
import { Track } from "@/interfaces/tracks";

interface Edge {
  from: number;
  to: number;
  value: number;
}

export interface Node {
  id: number;
  label: string;
  shape?: string;
  group?: string;
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
        artists.current = savedArtists;
        const tempNodes = savedArtists.map((item) => {
          return {
            id: item.id,
            label: item.title,
            shape: "dot",
          };
        });
        setGraphData({
          nodes: tempNodes,
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
        console.log(`Formatted artists: ${JSON.stringify(formattedArtists)}`);
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

  // const connectMutualTracks = useCallback(
  //   (trackFrom: PackedTrack, trackTo: PackedTrack, cumulatedEdges: Edge[]) => {
  //     // first, connect two tracks if they share any artists
  //     if (shareMutualArtists(trackFrom, trackTo)) {
  //       const connected = alreadyConnected(trackFrom, trackTo, cumulatedEdges);
  //       if (connected >= 0) {
  //         return;
  //       } else {
  //         cumulatedEdges.push({
  //           from: trackFrom.id,
  //           to: trackTo.id,
  //           value: 1,
  //         });
  //       }
  //     }
  //   },
  //   []
  // );

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

  // const connectTracksViaGenres = useCallback(
  //   (tracks: PackedPlaylistObject[]) => {
  //     const tempEdges = [] as Edge[];
  //     tracks.forEach((from, i) => {
  //       tracks.forEach((to, j) => {
  //         if (i !== j) {
  //           connectMutualTracks(from.track, to.track, tempEdges);
  //         }
  //       });
  //     });
  //     return tempEdges;
  //   },
  //   [getNeighbours, graphData.edges]
  // );

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

const savedArtists = [
  {
    title: "Emily James",
    id: 0,
    guid: "7FxEy78P0oIVEVxdaL9npy",
    popularity: 43,
    genres: ["singer-songwriter pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb3dfcaed40b015178a3feb1f2",
    width: 90,
  },
  {
    title: "Trousdale",
    id: 1,
    guid: "26DvqLYszG0oIOeelTF5kE",
    popularity: 46,
    genres: ["modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb3695fe5876f66bced1631016",
    width: 90,
  },
  {
    title: "Wild Rivers",
    id: 2,
    guid: "59sBwR0jPSTrbMtuTkRPN5",
    popularity: 64,
    genres: ["folk-pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebcd8e45aea3bed92b8164067a",
    width: 90,
  },
  {
    title: "The Paper Kites",
    id: 3,
    guid: "79hrYiudVcFyyxyJW0ipTy",
    popularity: 68,
    genres: [
      "australian indie folk",
      "indie anthem-folk",
      "indie folk",
      "stomp and flutter",
      "stomp and holler",
    ],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb9d4b54a5adb3f8d057d41c07",
    width: 90,
  },
  {
    title: "Hazlett",
    id: 4,
    guid: "1zO3MgzmcwZLLNUQqeU2XH",
    popularity: 61,
    genres: ["brisbane indie", "modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebd0974306d48c481667337b28",
    width: 90,
  },
  {
    title: "Catching Flies",
    id: 5,
    guid: "4zAOqBfNLyWFvj1e3yvypJ",
    popularity: 55,
    genres: ["downtempo", "indie dream pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb52489313435c3d1bdb618518",
    width: 90,
  },
  {
    title: "Sweatson Klank",
    id: 6,
    guid: "6rvxjnXZ3KPlIPZ8IP7wIT",
    popularity: 36,
    genres: ["abstract beats"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb4fc99fba9a946009e416c5a2",
    width: 90,
  },
  {
    title: "santpoort",
    id: 7,
    guid: "7KtVS0f2RQoEhjxDcSGBtJ",
    popularity: 38,
    genres: ["chillhop", "lo-fi beats"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe8aa78cd1ced407b64e5583b",
    width: 90,
  },
  {
    title: "Johnnyswim",
    id: 8,
    guid: "4igDSX1kgfWbVTDCywcBGm",
    popularity: 48,
    genres: ["acoustic pop", "folk-pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebda9a56d4483e2035f76e72a6",
    width: 90,
  },
  {
    title: "Parra for Cuva",
    id: 9,
    guid: "238y1dKPtMeFEpX3Y6H1Vr",
    popularity: 59,
    genres: ["deep euro house", "downtempo", "new french touch"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb2de1f5c26fd2a59b72374820",
    width: 90,
  },
  {
    title: "Matthew Mole",
    id: 10,
    guid: "1LfnIuggAY5qQdS4sP1K86",
    popularity: 45,
    genres: ["african rock", "south african pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebfdc0bd5a864958a274a7d7f6",
    width: 90,
  },
  {
    title: "Hermanito",
    id: 11,
    guid: "1ZRcePqdO2znn0SmLEbB7j",
    popularity: 21,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb144896aaa3941d2876f8fa71",
    width: 90,
  },
  {
    title: "Alex Lustig",
    id: 12,
    guid: "5oLxJrktO7kOEJANS6nkZB",
    popularity: 46,
    genres: ["vapor twitch"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba387a039b400553850a3026f",
    width: 90,
  },
  {
    title: "Ben Rector",
    id: 13,
    guid: "4AapPt7H6bGH4i7chTulpI",
    popularity: 58,
    genres: ["acoustic pop", "indiecoustica", "lds youth", "neo mellow", "piano rock"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb56242b6aea3018a378669f24",
    width: 90,
  },
  {
    title: "Angus & Julia Stone",
    id: 14,
    guid: "4tvKz56Tr39bkhcQUTO0Xr",
    popularity: 65,
    genres: ["australian indie folk", "indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba6bec94f269e61676f2fe977",
    width: 90,
  },
  {
    title: "Jordy Searcy",
    id: 15,
    guid: "0AV5z1x1RoOGeJWeJzziDz",
    popularity: 49,
    genres: ["indiecoustica"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba054b0dce543b8e44f1fa4f2",
    width: 90,
  },
  {
    title: "Passenger",
    id: 16,
    guid: "0gadJ2b9A4SKsB1RFkBb66",
    popularity: 70,
    genres: ["folk-pop", "neo mellow"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb3eb6f55c271d954cc871954f",
    width: 90,
  },
  {
    title: "Bonobo",
    id: 17,
    guid: "0cmWgDlu9CwTgxPhf403hb",
    popularity: 62,
    genres: [
      "downtempo",
      "electronica",
      "indietronica",
      "instrumental hip hop",
      "jazztronica",
      "nu jazz",
      "trip hop",
    ],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb37af35b51a7c9b689d86779a",
    width: 90,
  },
  {
    title: "Benson Boone",
    id: 18,
    guid: "22wbnEMDvgVIAGdFeek6ET",
    popularity: 85,
    genres: ["singer-songwriter pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebb2ce21a89c09c00d80d8ca25",
    width: 90,
  },
  {
    title: "The National Parks",
    id: 19,
    guid: "2JMtxA2S9SNUlqBlkDtXm6",
    popularity: 47,
    genres: ["folk-pop", "stomp and holler", "utah indie"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe5733b1807ba95761ba79299",
    width: 90,
  },
  {
    title: "Aquilo",
    id: 20,
    guid: "26GHRG8x1F4AzbCKzUaIbw",
    popularity: 50,
    genres: ["indie anthem-folk", "vapor soul"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe641b48d0f0b745853b531bf",
    width: 90,
  },
  {
    title: "Riaan Benadé",
    id: 21,
    guid: "7aijVRJ1wOqmLs6NucdtB7",
    popularity: 50,
    genres: ["afrikaans"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebc607cef8786eb1cd0f81c582",
    width: 90,
  },
  {
    title: "Stephen Sanchez",
    id: 22,
    guid: "5XKFrudbV4IiuE5WuTPRmT",
    popularity: 75,
    genres: ["gen z singer-songwriter"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb1e97fce6fa6fc4ebc3ebda25",
    width: 90,
  },
  {
    title: "Carly Rae Jepsen",
    id: 23,
    guid: "6sFIWsNpZYqfjUpaCgueju",
    popularity: 72,
    genres: ["canadian pop", "dance pop", "pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb8272bf414106646e0e4a89f3",
    width: 90,
  },
  {
    title: "Ben Böhmer",
    id: 24,
    guid: "5tDjiBYUsTqzd0RkTZxK7u",
    popularity: 65,
    genres: ["melodic house"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebd133a567722d3a3bf71d222d",
    width: 90,
  },
  {
    title: "John Mayer",
    id: 25,
    guid: "0hEurMDQu99nJRq8pTxO14",
    popularity: 77,
    genres: ["neo mellow", "singer-songwriter"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe926dd683e1700a6d65bd835",
    width: 90,
  },
  {
    title: "erwOn",
    id: 26,
    guid: "1KV9v9D4gONeKkl2hk3nZE",
    popularity: 8,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab67616d0000b273b778e369ff5abd49a22e6231",
    width: 90,
  },
  {
    title: "braj mahal",
    id: 27,
    guid: "2uHJReWme1oJ0jaXD1fiHT",
    popularity: 16,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebaa10e37fa6c3c08ba2df2223",
    width: 90,
  },
  {
    title: "Laura Omloop",
    id: 28,
    guid: "3aRgQSfUDTPWnmLwHAq8r5",
    popularity: 27,
    genres: ["belgian pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebf87bb821bb51d9f76c1ca806",
    width: 90,
  },
  {
    title: "Affelaye",
    id: 29,
    guid: "08Xoy5Glpl7MyzzZsRfRPJ",
    popularity: 28,
    genres: ["substep"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebfe9da9a728b2955a89712c79",
    width: 90,
  },
  {
    title: "Henry Green",
    id: 30,
    guid: "0VbDAlm2KUlKI5UhXRBKWp",
    popularity: 49,
    genres: ["vapor soul"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb522100b2ffb813ae62a1b46a",
    width: 90,
  },
  {
    title: "Emily James",
    id: 31,
    guid: "1l20YIqaUbJUwIXIprwojW",
    popularity: 12,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab67616d0000b2737c13a582a5b41d4c7dbd95d1",
    width: 90,
  },
  {
    title: "George Ezra",
    id: 32,
    guid: "2ysnwxxNtSgbb9t1m2Ur4j",
    popularity: 73,
    genres: ["folk-pop", "neo-singer-songwriter"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebbe936a26ceb9cbbdec7df15b",
    width: 90,
  },
  {
    title: "FLEUR",
    id: 33,
    guid: "5jE7YqOC3yRqDh0QsOmTV0",
    popularity: 39,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb59a1a9ea7029cc9019a2d3fb",
    width: 90,
  },
  {
    title: "Jacana People",
    id: 34,
    guid: "2f0w048dh1LH5QPDvwKECY",
    popularity: 35,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb68237d9c5a52719e6608d522",
    width: 90,
  },
  {
    title: "Schule der Erweckung",
    id: 35,
    guid: "5Nk4IS7XhkIi1wvYvsnp8P",
    popularity: 36,
    genres: ["german ccm", "german worship"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb7baf6fa4e826e7cd165921f1",
    width: 90,
  },
  {
    title: "Liam Mour",
    id: 36,
    guid: "5XaT1otgH5hpyqjkDbt8d0",
    popularity: 34,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb06ce5edc7bba5db91880b350",
    width: 90,
  },
  {
    title: "Duke Boara",
    id: 37,
    guid: "6EL8x2zkCRGzb32jvrSI56",
    popularity: 34,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb23c21df91fe143cabab92d7d",
    width: 90,
  },
  {
    title: "AVAION",
    id: 38,
    guid: "5oJvmyeWzyeahRtjup3Oys",
    popularity: 64,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebd83a4b273c137fbdc84c82b1",
    width: 90,
  },
  {
    title: "Chance Peña",
    id: 39,
    guid: "4lhUHpVOXmkEBGGHV71QCh",
    popularity: 72,
    genres: ["singer-songwriter pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebb8c4f26eb01dbd77bead2424",
    width: 90,
  },
  {
    title: "Riley Pearce",
    id: 40,
    guid: "0A3HlWZGV8WrCcqxKM2neg",
    popularity: 49,
    genres: ["australian singer-songwriter", "indie anthem-folk", "modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba433ab02cf233faa2900526e",
    width: 90,
  },
  {
    title: "Woodlock",
    id: 41,
    guid: "1slZr3FGlh153jH8xW6SNa",
    popularity: 49,
    genres: ["australian indie folk", "indie anthem-folk", "modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebce406ed40621ed93079178c5",
    width: 90,
  },
  {
    title: "Noah Kahan",
    id: 42,
    guid: "2RQXRUsr4IW1f3mKyKsy4B",
    popularity: 85,
    genres: ["pov: indie"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb336ec53126239813d38ff588",
    width: 90,
  },
  {
    title: "Blanco White",
    id: 43,
    guid: "3ccVtqcqedranb7y8eywJ5",
    popularity: 57,
    genres: ["british singer-songwriter", "indie anthem-folk", "indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb12205cb471ab2a38ac9f3bf2",
    width: 90,
  },
  {
    title: "Dilla",
    id: 44,
    guid: "17l4XlVVWNktDeJDigQ3HJ",
    popularity: 50,
    genres: ["neue neue deutsche welle"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb89d39ae9646f8d46d90728bb",
    width: 90,
  },
  {
    title: "The Light The Heat",
    id: 45,
    guid: "17EpO9pUubOAhnTopBgQYR",
    popularity: 41,
    genres: ["indiecoustica", "modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb04131a22e11c8121902720f6",
    width: 90,
  },
  {
    title: "Ryan Harris",
    id: 46,
    guid: "38Cj253ij4uQ7Rce6tArIG",
    popularity: 50,
    genres: ["modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebd87f4a4a102c641fec2def17",
    width: 90,
  },
  {
    title: "Hollow Coves",
    id: 47,
    guid: "7IAFAOtc9kTYNTizhLSWM6",
    popularity: 66,
    genres: ["indie anthem-folk", "indie folk", "modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb81c0e43195b10b16081a5fc4",
    width: 90,
  },
  {
    title: "MEAU",
    id: 48,
    guid: "2F3Mdh2idBVOiMTxXoxc10",
    popularity: 56,
    genres: ["dutch pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb808367bacfada22451e8aa51",
    width: 90,
  },
  {
    title: "LO Worship",
    id: 49,
    guid: "3W1GhZUgWMZBqYwH42Ycuq",
    popularity: 49,
    genres: ["pop worship", "worship"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb29e30e3abdf26e2a09ea8413",
    width: 90,
  },
  {
    title: "Gregory Alan Isakov",
    id: 50,
    guid: "5sXaGoRLSpd7VeyZrLkKwt",
    popularity: 69,
    genres: ["indie folk", "pop folk", "stomp and flutter", "stomp and holler"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb4528d0f9bb51b241561a16f3",
    width: 90,
  },
  {
    title: "Paul Sinha",
    id: 51,
    guid: "0Uev3WqwkRc17NqfsvVv4K",
    popularity: 45,
    genres: ["dutch pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb4b78867e050d0f8599087975",
    width: 90,
  },
  {
    title: "Bjéar",
    id: 52,
    guid: "0xIsWKGGU3QjOvNp3l4jmo",
    popularity: 24,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb698b1fb24e18ec504d9acb2f",
    width: 90,
  },
  {
    title: "Penny and Sparrow",
    id: 53,
    guid: "65o6y7GtoXzchyiJB3r9Ur",
    popularity: 48,
    genres: [
      "acoustic pop",
      "indie folk",
      "indiecoustica",
      "stomp and flutter",
      "stomp and holler",
    ],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb317dfa999e2786fce77d2607",
    width: 90,
  },
  {
    title: "Drew Holcomb & The Neighbors",
    id: 54,
    guid: "4RwbDag6jWIYJnEGH6Wte9",
    popularity: 55,
    genres: ["acoustic pop", "stomp and holler"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb4e440c850705fa0d6716ca34",
    width: 90,
  },
  {
    title: "Jon and Roy",
    id: 55,
    guid: "1K0Gi1qUFGSyZUFXvJF4F2",
    popularity: 56,
    genres: ["victoria bc indie"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb4c22bca39d01e84d07eb767c",
    width: 90,
  },
  {
    title: "Bridge Worship",
    id: 56,
    guid: "3VJPZ0Lo0RreJboEogQsnK",
    popularity: 49,
    genres: ["anthem worship", "pop worship", "world worship", "worship"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebaeed44b8636146bf8a305dd4",
    width: 90,
  },
  {
    title: "Hans Zimmer",
    id: 57,
    guid: "0YC192cP3KPCRWx8zr8MfZ",
    popularity: 76,
    genres: ["german soundtrack", "orchestral soundtrack", "soundtrack"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb371632043a8c12bb7eeeaf9d",
    width: 90,
  },
  {
    title: "Dekker",
    id: 58,
    guid: "2Udd2jgFaz8tXG1w3PyMtN",
    popularity: 56,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb436861a7ca73df72c4998497",
    width: 90,
  },
  {
    title: "Dean Lewis",
    id: 59,
    guid: "3QSQFmccmX81fWCUSPTS7y",
    popularity: 74,
    genres: ["australian pop", "pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb0f1e2654ed4fa751799b4140",
    width: 90,
  },
  {
    title: "NEEDTOBREATHE",
    id: 60,
    guid: "610EjgFatGvVPtib97jQ8G",
    popularity: 63,
    genres: [
      "ccm",
      "christian alternative rock",
      "christian indie",
      "christian music",
      "folk-pop",
    ],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb8cb146d311685b6a1704d6ea",
    width: 90,
  },
  {
    title: "Ed Sheeran",
    id: 61,
    guid: "6eUKZXaKkcviH0Ku9w2n3V",
    popularity: 87,
    genres: ["pop", "singer-songwriter pop", "uk pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba",
    width: 90,
  },
  {
    title: "Samuel Harfst",
    id: 62,
    guid: "7oZfNzc7LBXFe4znXBDJXb",
    popularity: 37,
    genres: ["german ccm", "german worship"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb6685da855f4269e75f741f49",
    width: 90,
  },
  {
    title: "Oshima Brothers",
    id: 63,
    guid: "349lepk5mVwAKROMAP13Mg",
    popularity: 34,
    genres: ["folk-pop", "new england americana"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb08ef1eaf9f822aa402ef16e7",
    width: 90,
  },
  {
    title: "Mura Masa",
    id: 64,
    guid: "5Q81rlcTFh3k6DQJXPdsot",
    popularity: 60,
    genres: [
      "channel islands indie",
      "escape room",
      "hyperpop",
      "indie soul",
      "vapor soul",
    ],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb3aca38c42551f532b6fefc16",
    width: 90,
  },
  {
    title: "Novo Amor",
    id: 65,
    guid: "0rZp7G3gIH6WkyeXbrZnGi",
    popularity: 71,
    genres: ["ambient folk", "indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb18a1928eb2892201f56d39e0",
    width: 90,
  },
  {
    title: "GoldLink",
    id: 66,
    guid: "5XenQ7XfcvQdfIbpLEFaKQ",
    popularity: 63,
    genres: ["alternative r&b"],
    imageUri: "https://i.scdn.co/image/337c0f44dae54bf2e2dbea22c4a6901a3055ad27",
    width: 90,
  },
  {
    title: "Colossal Trailer Music",
    id: 67,
    guid: "5rVfB0qJZvp4BPaHmb3lHA",
    popularity: 39,
    genres: ["epicore"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb50051af69e86acb468a39d75",
    width: 90,
  },
  {
    title: "Gordi",
    id: 68,
    guid: "6UBMFaCTZnL1Hr1nTOEblM",
    popularity: 40,
    genres: ["australian electropop", "australian indie"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba8730d846e221a0460c905c0",
    width: 90,
  },
  {
    title: "Suzan & Freek",
    id: 69,
    guid: "77IW5ZK1smDQYYKDCQugXh",
    popularity: 61,
    genres: ["dutch pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb8f506fdf34afdbd04ed1d221",
    width: 90,
  },
  {
    title: "Shallou",
    id: 70,
    guid: "7C3Cbtr2PkH2l4tOGhtCsk",
    popularity: 56,
    genres: ["electropop", "indie electropop", "vapor soul"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb18c2767d2263b43473e5ff88",
    width: 90,
  },
  {
    title: "Olivia Rodrigo",
    id: 71,
    guid: "1McMsnEElThX1knmY4oliG",
    popularity: 87,
    genres: ["pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe03a98785f3658f0b6461ec4",
    width: 90,
  },
  {
    title: "mehro",
    id: 72,
    guid: "1ZwhhTSUPr7EBZHd1GjOT7",
    popularity: 59,
    genres: ["gen z singer-songwriter"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb02b9ebc2a2386b89acd4b9e7",
    width: 90,
  },
  {
    title: "Ramin Djawadi",
    id: 73,
    guid: "1hCkSJcXREhrodeIHQdav8",
    popularity: 68,
    genres: ["german soundtrack", "orchestral soundtrack", "scorecore", "soundtrack"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb91e7dd670bc7d3ec7d1cbc6f",
    width: 90,
  },
  {
    title: "Provinz",
    id: 74,
    guid: "2f7f3AmL16mmiAmYnxmmfx",
    popularity: 63,
    genres: ["german indie folk", "german pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebab050cc611f5e1904b1ac5b8",
    width: 90,
  },
  {
    title: "Elderbrook",
    id: 75,
    guid: "2vf4pRsEY6LpL5tKmqWb64",
    popularity: 69,
    genres: ["uk dance"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb11c38bac1b16bdcb2ea6ee7f",
    width: 90,
  },
  {
    title: "WizTheMc",
    id: 76,
    guid: "3ebS2RuCq8QeLyndUDmgB5",
    popularity: 44,
    genres: ["canadian contemporary r&b", "pop rap"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb476684c84180218c525c0275",
    width: 90,
  },
  {
    title: "Garrett Kato",
    id: 77,
    guid: "4S3VOqqGguEZu3vbJMig4t",
    popularity: 51,
    genres: ["indie anthem-folk", "modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba34aabaa66078f3df7e6295f",
    width: 90,
  },
  {
    title: "Abby Holliday",
    id: 78,
    guid: "4q7Td1MO6rNg3UCvqrzz1k",
    popularity: 38,
    genres: ["modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebaede73cdc6732061b807896c",
    width: 90,
  },
  {
    title: "Dermot Kennedy",
    id: 79,
    guid: "5KNNVgR6LBIABRIomyCwKJ",
    popularity: 70,
    genres: ["folk-pop", "irish pop", "uk pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb01d2c1d798d01d814a830430",
    width: 90,
  },
  {
    title: "Portair",
    id: 80,
    guid: "5eNDu0xRakAeO0Za8pRIuG",
    popularity: 42,
    genres: ["modern indie folk"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eba7cd57e0e18c305b73526fe4",
    width: 90,
  },
  {
    title: "Morningsiders",
    id: 81,
    guid: "5hPR4Atp3QY2ztiAcz1inl",
    popularity: 51,
    genres: ["folk-pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe9e2b4cedbd5fce0d70e72f1",
    width: 90,
  },
  {
    title: "Steve Umculo",
    id: 82,
    guid: "5rnqlstQORnxg0odyfLw0B",
    popularity: 11,
    genres: [],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb142339475afd3a10457cc516",
    width: 90,
  },
  {
    title: "Bre Kennedy",
    id: 83,
    guid: "61oqMHI8QuFrE5Qt91uJAj",
    popularity: 37,
    genres: ["nashville singer-songwriter"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb2ac5c19b52fd5b25b9c80374",
    width: 90,
  },
  {
    title: "TWO LANES",
    id: 84,
    guid: "7mnuMLgvXdCWzyB4sQCG7k",
    popularity: 58,
    genres: ["melodic house", "uk dance"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5ebe757807861d6774353682e21",
    width: 90,
  },
  {
    title: "Umberto Tozzi",
    id: 85,
    guid: "00w9sdZ78mWArooTmiSTld",
    popularity: 60,
    genres: ["classic italian pop", "italian adult pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb52c81324c1e17c2e8b1d87b6",
    width: 90,
  },
  {
    title: "Tropikel Ltd",
    id: 86,
    guid: "15VagIVEAdYm95xs0ayi1x",
    popularity: 37,
    genres: ["neue neue deutsche welle"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb3c12d64ba08763f2b68fc8f6",
    width: 90,
  },
  {
    title: "Eros Ramazzotti",
    id: 87,
    guid: "61J0BktHv7PuP3tjTPYXSX",
    popularity: 69,
    genres: ["italian adult pop", "mexican pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb314f9d52a5a1389b93669b9b",
    width: 90,
  },
  {
    title: "Annika Bennett",
    id: 88,
    guid: "6p6WfcngzvbVPbmV9HMb5l",
    popularity: 32,
    genres: ["nashville singer-songwriter"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb07c10240fdbadd9bca657789",
    width: 90,
  },
  {
    title: "LULLANAS",
    id: 89,
    guid: "3b8jXMWK6VSV8FlQ4hbVkd",
    popularity: 39,
    genres: ["folk-pop"],
    imageUri: "https://i.scdn.co/image/ab6761610000e5eb8459bd942900d37dc5fcbf56",
    width: 90,
  },
];

const savedNodes = [
  { id: 0, label: "Emily James", shape: "dot", group: "group1" },
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
