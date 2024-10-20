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

export interface Album {
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
  artists: Artist[];
}

export interface Artist {
  external_urls: ExternalURLs;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
  genres: string[];
  images: Image[];
}

export interface Track {
  album: Album;
  artists: Artist[];
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

/**
 * [
  {
    "index": 0,
    "name": "Fly Away With Me",
    "album": {
      "name": "Fly Away With Me",
      "id": "0zyfjcblb35vFRjZ3KKXMR",
      "artists": [{ "id": "7z2avKuuiMAT4XZJFv8Rvh", "name": "Tom Walker" }]
    },
    "artists": [{ "id": "7z2avKuuiMAT4XZJFv8Rvh", "name": "Tom Walker" }],
    "popularity": 44,
    "preview_url": "https://p.scdn.co/mp3-preview/c949637fd7daab492d5e5106ca224abc184ae69b?cid=c5ef878ae61046f0a713956f9dbd9377",
    "danceability": 0.421,
    "energy": 0.499,
    "key": 5,
    "loudness": -8.869,
    "mode": 1,
    "speechiness": 0.173,
    "acousticness": 0.61,
    "instrumentalness": 0,
    "liveness": 0.0875,
    "valence": 0.297,
    "tempo": 78.621,
    "type": "audio_features",
    "id": "05u81UgU27g8uL5twJ7ABz",
    "uri": "spotify:track:05u81UgU27g8uL5twJ7ABz",
    "track_href": "https://api.spotify.com/v1/tracks/05u81UgU27g8uL5twJ7ABz",
    "analysis_url": "https://api.spotify.com/v1/audio-analysis/05u81UgU27g8uL5twJ7ABz",
    "duration_ms": 211733,
    "time_signature": 4,
    "playlist": { "name": "main_jam", "id": "5VijMFqhgsYh3k0ewtdzVH" }
  },
 */
