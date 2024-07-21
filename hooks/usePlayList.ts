import { PlayListItems, PlayListObject, PlayListResponse } from "@/interfaces/playlists";

import { useRequestBuilder } from "./useRequestBuilder";

export function usePlayLists() {
  const { buildGet } = useRequestBuilder();

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
    const items = await getPlayListItemsPage(playListId);
    if (items) {
      const filteredItems = items.map((item) => item.track.id);
      return filteredItems;
    } else {
      return null;
    }
  };

  return {
    listPlayLists,
    getPlayListItemsPage,
    getPlayListItemsAll,
    getPlayListItemsIds,
  };
}
