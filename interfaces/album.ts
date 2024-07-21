import { Artist, Track, ExternalURLs, Image } from "./tracks";

interface Copyright {
  text: string;
  type: "C" | "P";
}

interface ExternalIDs {
  upc?: string;
  isrc?: string;
  ean?: string;
}

type ReleaseDatePrecision = "year" | "month" | "day";

interface SimplifiedArtist {
  external_urls: ExternalURLs;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

export interface SimplifiedAlbum {
  album_group: "album" | "single" | "compilation" | "appears_on";
  album_type: string;
  artists: SimplifiedArtist[];
  available_markets: string[];
  external_urls: ExternalURLs;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date_precision: string;
  release_date: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  copyrights: Copyright[];
  external_ids: ExternalIDs;
  external_urls: ExternalURLs;
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  label: string;
  name: string;
  popularity: number;
  release_date: string;
  release_date_precision: ReleaseDatePrecision;
  total_tracks: number;
  tracks: {
    href: string;
    items: Track[];
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
  };
  type: "album";
  uri: string;
}
