export interface DbTrack {
  id: string;
  name: string;
  popularity: number;
  preview_url: string;
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
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
  album_id: string;
}

export interface DbArtist {
  id: string;
  name: string;
}

export interface DbAlbum {
  id: string;
  name: string;
}
export interface DbAlbumArtist {
  album_id: string;
  artist_id: string;
}

export interface DbTrackArtist {
  track_id: string;
  artist_id: string;
}

export interface DbPlaylist {
  id: string;
  name: string;
}

export interface DbPlaylistTrack {
  playlist_id: string;
  track_id: string;
}
