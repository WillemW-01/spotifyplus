import { LastFMTrack } from "lastfm-ts-api";
import { useRequestBuilder } from "./useRequestBuilder";

const API_KEY = process.env.EXPO_PUBLIC_LASTFM_KEY;
const URL = "https://ws.audioscrobbler.com/2.0/";

interface MethodParams {
  artist?: string;
  track?: string;
  autoCorrect?: boolean;
}

export function useLastFm() {
  const { buildGet } = useRequestBuilder(false);

  const createUrl = (method: string, params: MethodParams) => {
    let url = `${URL}?method=${method}`;
    url += params.artist ? `&artist=${encodeURIComponent(params.artist)}` : "";
    url += params.track ? `&track=${encodeURIComponent(params.track)}` : "";
    url += params.autoCorrect ? `&autocorrect=1` : "";
    url += `&api_key=${API_KEY}&format=json`;
    return url.toLowerCase();
  };

  const getTrackTopTags = async (trackName: string, artist: string) => {
    const url = createUrl("track.gettoptags", { track: trackName, artist: artist });

    const response = await buildGet(url);
    console.log(JSON.stringify(response));
    const data = await response.json();
    console.log(data);
    return data;
  };

  const getArtistTopTags = async (artist: string) => {
    const url = createUrl("artist.getTopTags", { artist: artist });

    const response = await buildGet(url);
    const data = await response.json();
    console.log(data);
    return data;
  };

  return {
    getTrackTopTags,
    getArtistTopTags,
  };
}
