import { Track } from "@/interfaces/tracks";
import { useRequestBuilder } from "./useRequestBuilder";
import { SimplifiedAlbum } from "@/interfaces/album";
import { useAlbum } from "./useAlbum";
import { dedup } from "@/utils/miscUtils";
import { Artist } from "@/interfaces/artist";

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
    return dedup(relatedArtists.map((artist) => artist.genres).flat()) as string[];
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
    const albumGenres = dedup(albums.map((album) => album.genres).flat()) as string[];

    combinedGenres.push(...albumGenres);

    if (depth == 1) {
      return dedup(combinedGenres) as string[];
    }

    // okay, that means we have to use related artists
    const relatedArtists = await getRelatedArtists(artistId);
    const relatedGenres = relatedArtistGenres(relatedArtists);
    combinedGenres.push(...relatedGenres);

    return dedup(combinedGenres) as string[];
  };

  return {
    getTopTracks,
    getTopAlbums,
    getRelatedArtists,
    getArtistGenres,
  };
}
export { Artist };
