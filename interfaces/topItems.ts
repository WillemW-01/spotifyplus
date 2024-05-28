import { Artist, Track } from "@/interfaces/tracks";

export interface TopArtist extends Artist {
  popularity: number;
}

export interface TopTrack extends Track {
  popularity: number;
}

export interface TopItemsResponse {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: null;
  total: number;
  items: TopArtist[] | Track[];
}

export interface PackedArtist {
  title: string;
  subtitle: string;
  id: string;
  popularity: number;
  imageUri: string;
}

export interface PackedTrack {
  name: string;
  artist: string;
  id: string;
  popularity: number;
  imageUri: string;
}
