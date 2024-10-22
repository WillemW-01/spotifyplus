export interface Feature {
  acousticness: number;
  artist: string;
  danceability: number;
  energy: number;
  id: string;
  index: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  name: string;
  speechiness: number;
  tempo: number;
  type: string;
  valence: number;
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

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface ResultObj {
  index: number;
  distance: number;
}
