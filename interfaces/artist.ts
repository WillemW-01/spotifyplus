import { ExternalURLs, Image } from "./tracks";

export interface Artist {
  external_urls: ExternalURLs;
  followers: { href: string; total: number };
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}
