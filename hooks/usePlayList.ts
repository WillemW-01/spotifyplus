import { useRequestBuilder } from "@/hooks/useRequestBuilder";
import { PlayListItems, PlayListResponse } from "@/interfaces/playlists";

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

  const getPlayListItemsIds = async (playListId: string): Promise<string[] | null> => {
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
