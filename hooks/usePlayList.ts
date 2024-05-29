import { useRequestBuilder } from "@/hooks/useRequestBuilder";
import {
  PlayListItems,
  PlayListResponse,
  SimplifiedPlayList,
} from "@/interfaces/playlists";
import { usePlayback } from "./usePlayback";

export function usePlayLists() {
  const { buildGet, buildPut } = useRequestBuilder();

  const listPlayLists = async (limit?: number) => {
    let url = `https://api.spotify.com/v1/me/playlists`;
    url += limit ? `?limit=${limit}` : "";
    const response = await buildGet(url);

    if (!response.ok) {
      console.log(response.status);
    }

    const data: PlayListResponse = await response.json();
    const playlists = data.items;

    // playlists.forEach((playList) => console.log(playList));

    return playlists;
  };

  const getPlayListsNames = (playLists: SimplifiedPlayList[]) => {
    const names: string[] = [];
    playLists.forEach((p) => names.push(p.name));
    return names;
  };

  const getPlayListItems = async (playListId: string) => {
    try {
      console.log("Fetching ids");
      const url = `https://api.spotify.com/v1/playlists/${playListId}/tracks`;

      const response = await buildGet(url);

      if (!response.ok) {
        console.log("Didn't fetch playlist ids okay! ", response.status);
        return null;
      }

      const data: PlayListItems = await response.json();

      return data.items;
    } catch (error) {
      console.log("Error when fetching ids: ", error);
    }
  };

  const getPlayListItemsIds = async (
    playListId: string
  ): Promise<string[] | null> => {
    const items = await getPlayListItems(playListId);
    if (items) {
      const filteredItems = items.map((item) => item.track.id);
      return filteredItems;
    } else {
      return null;
    }
  };

  return {
    listPlayLists,
    getPlayListItems,
    getPlayListItemsIds,
  };
}
