import { useRequestBuilder } from "@/hooks/useRequestBuilder";

import { PlayHistoryObject, Track } from "@/interfaces/tracks";

export function useTracks() {
  const { buildGet } = useRequestBuilder();

  const getRecent = async (limit: number = 0) => {
    const url = `https://api.spotify.com/v1/me/player/recently-played${
      limit > 0 && `?limit=${limit}`
    }`;

    const response = await buildGet(url);
    const data = await response.json();
    console.log(data);
    return data;
  };

  const isPlayHistoryObject = (obj: any): obj is PlayHistoryObject => {
    return (obj as PlayHistoryObject).track !== undefined;
  };

  const getTracksNames = (tracks: Track[] | PlayHistoryObject[]) => {
    let names: string[] = [];

    tracks.forEach((track) => {
      const tempTrack = isPlayHistoryObject(track) ? track.track : track;
      names.push(tempTrack.name);
    });
    return names;
  };

  return {
    getRecent,
    getTracksNames,
  };
}
