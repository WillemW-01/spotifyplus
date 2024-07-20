import { Track } from "@/interfaces/tracks";
import { useRequestBuilder } from "./useRequestBuilder";

export function useArtist() {
  const { buildGet } = useRequestBuilder();

  const getTopTracks = async (artistId: string): Promise<Track[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;

    const response = await buildGet(url);
    const data = await response.json();
    return data.tracks as Track[];
  };

  return {
    getTopTracks,
  };
}
