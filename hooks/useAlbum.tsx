import { Album } from "@/interfaces/album";
import { useRequestBuilder } from "./useRequestBuilder";

export function useAlbum() {
  const { buildGet } = useRequestBuilder();

  const getAlbum = async (albumId: string) => {
    const url = `https://api.spotify.com/v1/albums/${albumId}`;
    const response = await buildGet(url);
    const data = await response.json();
    return data as Album;
  };

  const getAlbums = async (albumIds: string[]) => {
    // console.log("Looking for number of albums: ", albumIds.length);
    console.log(albumIds);
    const url = `https://api.spotify.com/v1/albums?ids=${albumIds.join(",")}`;
    const response = await buildGet(url);
    const data = await response.json();
    // console.log(Object.keys(data));
    return data.albums as Album[];
  };

  return {
    getAlbum,
    getAlbums,
  };
}
