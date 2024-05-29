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

  const isPlayHistoryObject = (
    obj: PlayHistoryObject | Track
  ): obj is PlayHistoryObject => {
    return (obj as PlayHistoryObject).track !== undefined;
  };

  const getTracksNames = (tracks: Track[] | PlayHistoryObject[]) => {
    const names: string[] = [];

    tracks.forEach((track) => {
      const tempTrack = isPlayHistoryObject(track) ? track.track : track;
      names.push(tempTrack.name);
    });
    return names;
  };

  const getTrackInfo = async (trackId: string) => {
    const url = `https://api.spotify.com/v1/audio-features/${trackId}`;
    const response = await buildGet(url);

    if (!response.ok) {
      console.log("Didn't fetch features okay! ", response.status);
    }

    const data = await response.json();
    console.log(JSON.stringify(data));
    return data;
  };

  return {
    getRecent,
    getTracksNames,
    getTrackInfo,
  };
}
