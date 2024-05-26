import { Image, ExternalURLs, Track } from "./tracks";

export interface PlayListResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SimplifiedPlayList[];
}

export interface SimplifiedPlayList {
  collaborative: boolean;
  description: string;
  external_urls: ExternalURLs;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: {
    external_urls: ExternalURLs;
    href: string;
    id: string;
    type: string;
    uri: string;
    display_name: string;
  };
  public: true;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
  primary_color: null;
}

export interface PlayListObject {
  added_at: string;
  added_by: {
    external_urls: ExternalURLs;
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  track: Track;
}

export interface PlayListItems {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: null;
  total: number;
  items: PlayListObject[];
}
