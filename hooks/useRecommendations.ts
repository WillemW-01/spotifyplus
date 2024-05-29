import { Track } from "@/interfaces/tracks";
import { useAuth } from "./AuthContext";
import { useRequestBuilder } from "./useRequestBuilder";
import {
  RecommendationResponse,
  RecommendationsProps,
} from "@/interfaces/recommendations";

export function useRecommendations() {
  const { buildGet } = useRequestBuilder();

  const getRecommendations = async ({
    limit,
    seedArtists,
    seedGenres,
    seedTracks,
  }: RecommendationsProps): Promise<Track[]> => {
    let url = "https://api.spotify.com/v1/recommendations";
    url += limit || seedArtists || seedGenres || seedTracks ? "?" : "";
    url += limit ? `limit=${limit}` : "";
    url += seedArtists ? `&seed_artists=${seedArtists.join(",")}` : "";
    url += seedGenres ? `&seed_genres=${seedGenres.join(",")}` : "";
    url += seedTracks ? `&seed_tracks=${seedTracks.join(",")}` : "";

    const response = await buildGet(url);
    const recommendations: RecommendationResponse = await response.json();
    return recommendations.tracks;
  };

  const extractIds = (tracks: Track[]): string[] => tracks.map((t) => t.id);

  return {
    getRecommendations,
    extractIds,
  };
}
