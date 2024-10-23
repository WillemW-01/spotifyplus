import {
  PlayListItems,
  PlayListObject,
  PlayListResponse,
  SimplifiedPlayList,
} from "@/interfaces/playlists";

import { useRequestBuilder } from "./useRequestBuilder";
import { useTracks } from "./useTracks";
import {
  TrackArtist,
  CustomArtist,
  Track,
  TrackFeature,
  TrackFeatureResponse,
} from "@/interfaces/tracks";

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

  const buildCustomArtist = (artists: TrackArtist[]) => {
    return artists.map((a) => ({
      id: a.id,
      name: a.name,
    })) as CustomArtist[];
  };

  const buildTrackFeature = (
    index: number,
    track: Track,
    features: TrackFeatureResponse,
    playlist: SimplifiedPlayList
  ) => {
    const { album, name, popularity, preview_url } = track;

    const newObj = {
      index: index,
      name,
      id: track.id,
      album: {
        name: album.name,
        id: album.id,
        artists: buildCustomArtist(album.artists),
      },
      artists: buildCustomArtist(track.artists),
      popularity,
      preview_url,
      ...features,
      playlist: {
        name: playlist.name,
        id: playlist.id,
        snapshot: playlist.snapshot_id,
      },
    };
    return newObj as TrackFeature;
  };

  const fetchPlaylistFeatures = async (
    playlist: SimplifiedPlayList,
    progressCallback?: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const allIds = await getPlayListItemsIds(playlist.id);
    const jump = 50;
    const localFeatures = [] as TrackFeature[];
    for (let i = 0; i < allIds.length; i += jump) {
      const localMax = Math.min(i + jump, allIds.length);
      const ids = allIds.slice(i, localMax);
      console.log(`Getting ${i} - ${localMax} / ${allIds.length}`);
      const features = await getSeveralTrackFeatures(ids);
      console.log(`Got a response of ${features.length} features`);
      const tracksResponse = await getSeveralTracks(ids);
      console.log(`Got a response of ${tracksResponse.length} track info`);
      const newTracks = tracksResponse.map((t, j) => {
        if (!t.id) {
          console.error(`${t.name} doesn't have an id: ${t.id}`);
          return null;
        }

        if (!features[j]) {
          console.log(`${t.name} at ${j} doesn't have features attached to it`);
        }

        const newObj = buildTrackFeature(i + j, t, features[j], playlist);

        if ((i + j) % 5 == 0 && progressCallback)
          progressCallback((i + j) / allIds.length);
        return newObj;
      });
      localFeatures.push(...newTracks);
    }
    progressCallback && progressCallback(1);
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
