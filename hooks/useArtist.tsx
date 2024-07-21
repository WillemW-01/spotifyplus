import { ExternalURLs, Track } from "@/interfaces/tracks";
import { useRequestBuilder } from "./useRequestBuilder";
import { SimplifiedAlbum } from "@/interfaces/album";
import { useAlbum } from "./useAlbum";
import { Image } from "@/interfaces/tracks";
import { dedup } from "@/utils/miscUtils";

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

export function useArtist() {
  const { buildGet } = useRequestBuilder();
  const { getAlbums } = useAlbum();

  const getTopTracks = async (artistId: string): Promise<Track[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;

    const response = await buildGet(url);
    const data = await response.json();
    return data.tracks as Track[];
  };

  const getTopAlbums = async (artistId: string): Promise<SimplifiedAlbum[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
    const response = await buildGet(url);
    const data = await response.json();
    return data.items as SimplifiedAlbum[];
  };

  const getRelatedArtists = async (artistId: string): Promise<Artist[]> => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
    const response = await buildGet(url);
    const data = await response.json();
    return data.artists as Artist[];
  };

  const relatedArtistGenres = (relatedArtists: Artist[]): string[] => {
    return dedup(relatedArtists.map((artist) => artist.genres).flat());
  };

  const getArtistGenres = async (
    artistId: string,
    depth = 0 | 1 | 2
  ): Promise<string[]> => {
    const combinedGenres = [] as string[];

    // first, get genres from artist:
    const url = `https://api.spotify.com/v1/artists/${artistId}`;
    const response = await buildGet(url);
    const data = await response.json();
    const genresArtist = data.genres;
    combinedGenres.push(...genresArtist);

    if (depth == 0) {
      return combinedGenres;
    }

    // then, get genres from all albums/eps:
    const albumsSimplfied = await getTopAlbums(artistId);
    const albumIds = albumsSimplfied.map((album) => album.id);
    const albums = await getAlbums(albumIds);
    const albumGenres = dedup(albums.map((album) => album.genres).flat());

    combinedGenres.push(...albumGenres);

    if (depth == 1) {
      return dedup(combinedGenres);
    }

    // okay, that means we have to use related artists
    const relatedArtists = await getRelatedArtists(artistId);
    const relatedGenres = relatedArtistGenres(relatedArtists);
    combinedGenres.push(...relatedGenres);

    return dedup(combinedGenres);
  };

  return {
    getTopTracks,
    getTopAlbums,
    getRelatedArtists,
    getArtistGenres,
  };
}
