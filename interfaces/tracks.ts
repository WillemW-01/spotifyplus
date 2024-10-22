import { SimplifiedArtist } from "./album";

export interface RecentlyPlayed {
  href: string;
  limit: number;
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  total?: number;
  items: PlayHistoryObject[];
}

export interface ExternalURLs {
  spotify: string;
}

export interface Context {
  type: string;
  href: string;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface TrackAlbum {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalURLs;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  type: string;
  uri: string;
  artists: SimplifiedArtist[];
}

export interface TrackArtist {
  external_urls: ExternalURLs;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
  // genres: string[];
  // images: Image[];
}

export interface Track {
  album: TrackAlbum;
  artists: SimplifiedArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: ExternalURLs;
  href: string;
  id: string;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface SeveralTracksResponse {
  tracks: Track[];
}

export interface PlayHistoryObject {
  played_at: string;
  context: Context | null;
  track: Track;
}

export interface TrackFeatureResponse {
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: string;
  uri: string;
  valence: number;
}

type TrackFeatureResponseExclude =
  | "analysis_url"
  | "duration_ms"
  | "time_signature"
  | "track_href"
  | "uri";

export interface Feature
  extends Omit<TrackFeatureResponse, TrackFeatureResponseExclude> {}

export interface TrackFeature extends TrackFeatureResponse {
  index: number;
  album: CustomAlbum;
  artists: CustomArtist[];
  name: string;
  popularity: number;
  preview_url: string;
  playlist: CustomPlaylist;
}

export interface CustomArtist {
  id: string;
  name: string;
}

export interface CustomAlbum {
  name: string;
  id: string;
  artists: CustomArtist[];
}

export interface CustomPlaylist {
  name: string;
  id: string;
  snapshot: string;
}
