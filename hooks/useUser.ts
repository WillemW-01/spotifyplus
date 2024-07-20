import { TopArtist, TopItemsResponse, TopTrack } from "@/interfaces/topItems";

import { useRequestBuilder } from "./useRequestBuilder";

export function useUser() {
  const { buildGet } = useRequestBuilder();

  interface GetTopProps {
    timeRange?: "short_term" | "medium_term" | "long_term";
    limit?: number;
    offset?: number;
  }

  interface GetTopPropsFull extends GetTopProps {
    itemType: "artists" | "tracks";
  }

  interface GetAllTopProps {
    itemType: "artists" | "tracks";
  }

  const getTopItems = async ({
    itemType,
    timeRange,
    limit,
    offset,
  }: GetTopPropsFull): Promise<TopTrack[] | TopArtist[] | null> => {
    let url = `https://api.spotify.com/v1/me/top/${itemType}`;
    url += timeRange || limit || offset ? "?" : "";
    url += timeRange ? `&time_range=${timeRange}` : "";
    url += limit ? `&limit=${limit}` : "";
    url += offset ? `&offset=${offset}` : "";
    console.log(url);

    const response = await buildGet(url);

    if (!response.ok) {
      console.log("Didn't get top items okay! ", response.status);
      const error = await response.json();
      console.log(error);
      return null;
    }

    const data: TopItemsResponse = await response.json();
    return data.items;
  };

  const getAllTopItems = async ({
    itemType,
  }: GetAllTopProps): Promise<TopTrack[] | TopArtist[] | null> => {
    const url = `https://api.spotify.com/v1/me/top/${itemType}`;
    const limit = 50;
    let total = 51;
    const items = [] as TopTrack[] | TopArtist[];

    for (let offset = 0; offset < total; offset += limit) {
      const currUrl = url + `?offset=${offset}&limit=${limit}`;
      const response = await buildGet(currUrl);

      const data = await response.json();
      total = data.total;
      items.push(...data.items);
    }

    return items;
  };

  const getTopArtists = async (
    timeRange?: "short_term" | "medium_term" | "long_term",
    limit?: number,
    offset?: number
  ): Promise<TopArtist[] | null> => {
    const artists = (await getTopItems({
      itemType: "artists",
      timeRange,
      limit,
      offset,
    })) as TopArtist[];

    return artists;
  };

  const getTopArtistsAll = async (): Promise<TopArtist[] | null> => {
    const artists = (await getAllTopItems({
      itemType: "artists",
    })) as TopArtist[];
    console.log(artists == null);
    return artists;
  };

  const getTopTracks = async (
    timeRange?: "short_term" | "medium_term" | "long_term",
    limit?: number,
    offset?: number
  ) => {
    const tracks = (await getTopItems({
      itemType: "tracks",
      timeRange,
      limit,
      offset,
    })) as TopTrack[];

    return tracks;
  };

  return {
    getTopArtists,
    getTopArtistsAll,
    getTopTracks,
  };
}
