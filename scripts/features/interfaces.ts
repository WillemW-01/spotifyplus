import { TrackFeatureResponse } from "@/interfaces/tracks";

export interface Feature {
  index: number;
  artist: string;
  name: string;
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
}
export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface CustomArtist {
  name: string;
  genres?: string[];
  images?: Image[];
}

export interface CustomAlbum {
  name: string;
  id: string;
  artists: CustomArtist[];
}

export interface TrackFeature extends TrackFeatureResponse {
  index: number;
  album: CustomAlbum;
  artists: CustomArtist[];
  name: string;
  popularity: number;
  preview_url: string;
  playlist: string;
}

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface ResultObj {
  index: number;
  distance: number;
}
