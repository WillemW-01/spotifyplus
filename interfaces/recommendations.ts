import { Track } from "./tracks";

export interface RecommendationsProps {
  limit?: number;
  seedArtists?: string[];
  seedGenres?: string[];
  seedTracks?: string[];
}

export interface RecommendationSeedObject {
  afterFilteringSize: number;
  afterRelinkingSize: number;
  href: string;
  id: string;
  initialPoolSize: number;
  type: string;
}

export interface RecommendationResponse {
  seeds: RecommendationSeedObject[];
  tracks: Track[];
}
