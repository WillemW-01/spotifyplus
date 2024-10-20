import {
  PlayListItems,
  PlayListObject,
  PlayListResponse,
  SimplifiedPlayList,
} from "@/interfaces/playlists";

import { useRequestBuilder } from "./useRequestBuilder";
import { useTracks } from "./useTracks";
import { TrackFeature } from "@/interfaces/tracks";

export function usePlayLists() {
  const { buildGet } = useRequestBuilder();

  const { getSeveralTrackFeatures, getSeveralTracks } = useTracks();

  const listPlayLists = async (limit?: number) => {
    let url = `https://api.spotify.com/v1/me/playlists`;
    url += limit ? `?limit=${limit}` : "";
    const response = await buildGet(url);

    if (!response.ok) {
      console.log(response.status);
    }

    const data: PlayListResponse = await response.json();
    const playlists = data.items;

    return playlists;
  };

  const getPlayListItemsPage = async (playListId: string, limit = 100, offset = 0) => {
    console.log("Fetching ids");
    const url = `https://api.spotify.com/v1/playlists/${playListId}/tracks?limit=${limit}&offset=${offset}`;
    const response = await buildGet(url);
    const data: PlayListItems = await response.json();
    console.log(
      `This playlist can return ${data.total} items, now at offset: ${data.offset}, with limit: ${data.limit}`
    );
    return data;
  };

  const getPlayListItemsAll = async (playListId: string): Promise<PlayListObject[]> => {
    const playlistItems = [] as PlayListObject[];
    const limit = 50;
    let page = await getPlayListItemsPage(playListId, 50, 0);
    playlistItems.push(...page.items);
    for (let offset = limit; offset < page.total; offset += limit) {
      page = await getPlayListItemsPage(playListId, 50, offset);
      playlistItems.push(...page.items);
    }
    return playlistItems;
  };

  const getPlayListItemsIds = async (playListId: string): Promise<string[] | null> => {
    const items = await getPlayListItemsAll(playListId);
    if (items) {
      const filteredItems = items.map((item) => item.track.id);
      return filteredItems;
    } else {
      return null;
    }
  };

  const fetchPlaylistFeatures = async (playlist: SimplifiedPlayList) => {
    const allIds = await getPlayListItemsIds(playlist.id);
    const jump = 50;
    const localFeatures = [] as TrackFeature[];
    for (let i = 0; i < allIds.length; i += jump) {
      const localMax = Math.min(i + jump, allIds.length);
      const ids = allIds.slice(i, localMax);
      console.log(`Getting ${i} - ${localMax} / ${allIds.length}`);
      const features = await getSeveralTrackFeatures(ids);
      console.log(`Got a response of ${features.length} features}`);
      const tracksResponse = await getSeveralTracks(ids);
      console.log(`Got a response of ${tracksResponse.length} track info`);
      const newTracks = tracksResponse.map((t, j) => {
        const { album, name, popularity, preview_url } = t;
        const customArtists = t.artists.map((a) => ({
          genres: a.genres,
          id: a.id,
          name: a.name,
          images: a.images,
        }));
        const newObj = {
          index: i + j,
          name,
          album: {
            name: album.name,
            id: album.id,
            artists: album.artists.map((a) => ({
              genres: a.genres,
              id: a.id,
              name: a.name,
              images: a.images,
            })),
          },
          artists: customArtists,
          popularity,
          preview_url,
          ...features[i + j],
          playlist: {
            name: playlist.name,
            id: playlist.id,
            snapshot: playlist.snapshot_id + "E",
          },
        };
        return newObj;
      });
      console.log(newTracks[0]);
      localFeatures.push(...newTracks);
    }
    return localFeatures;
  };

  return {
    listPlayLists,
    getPlayListItemsPage,
    getPlayListItemsAll,
    getPlayListItemsIds,
    fetchPlaylistFeatures,
  };
}
