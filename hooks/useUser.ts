import {
  PackedArtist,
  TopArtist,
  TopItemsResponse,
  TopTrack,
} from "@/interfaces/topItems";
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

  const getTopArtists = async (
    timeRange?: "short_term" | "medium_term" | "long_term",
    limit?: number,
    offset?: number
  ): Promise<PackedArtist[] | null> => {
    const artists = (await getTopItems({
      itemType: "artists",
      timeRange,
      limit,
      offset,
    })) as TopArtist[];

    if (!artists) return null;

    return artists.map((artist) => {
      return {
        title: artist.name,
        subtitle: String(artist.popularity),
        id: artist.id,
        popularity: artist.popularity,
        imageUri: artist.images[0].url,
      };
    });
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

    if (!tracks) return null;

    return tracks.map((track) => {
      return {
        title: track.name,
        subtitle: track.artists[0].name,
        id: track.id,
        popularity: track.popularity,
        imageUri: track.album.images[0].url,
      };
    });
  };

  return {
    getTopArtists,
    getTopTracks,
  };
}
