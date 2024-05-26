import { useRequestBuilder } from "@/hooks/useRequestBuilder";
import {
  PlayListItems,
  PlayListResponse,
  SimplifiedPlayList,
} from "@/interfaces/playlists";

export function usePlayLists() {
  const { buildGet } = useRequestBuilder();

  const listPlayLists = async () => {
    const url = "https://api.spotify.com/v1/me/playlists";
    const response = await buildGet(url);

    if (!response.ok) {
      console.log(response.status);
    }

    const data: PlayListResponse = await response.json();
    const playlists = data.items;

    playlists.forEach((playList) => console.log(playList));

    return playlists;
  };

  const getPlayListsNames = (playLists: SimplifiedPlayList[]) => {
    const names: string[] = [];
    playLists.forEach((p) => names.push(p.name));
    return names;
  };

  const getPlayListItemsIds = async (playListId: string) => {
    try {
      console.log("Fetching ids");
      const url = `https://api.spotify.com/v1/playlists/${playListId}/tracks`;

      const response = await buildGet(url);

      if (!response.ok) {
        return console.log("Didn't fetch playlist ids okay! ", response.status);
      }

      const data: PlayListItems = await response.json();
      data.items.forEach((item) => {
        console.log(item.track.name);
      });

      return data.items;
    } catch (error) {
      console.log("Error when fetching ids: ", error);
    }
  };

  return {
    listPlayLists,
    getPlayListItemsIds,
  };
}
