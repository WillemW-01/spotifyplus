import {
  PlayHistoryObject,
  SeveralTracksResponse,
  Track,
  TrackFeature,
  TrackFeatureResponse,
} from "@/interfaces/tracks";

import { useRequestBuilder } from "./useRequestBuilder";
import { Preset, TrackFeatures, VARIANCE } from "@/constants/sliderPresets";

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

  const getTrack = async (id: string) => {
    const url = `https://api.spotify.com/v1/tracks/${id}`;
    const response = await buildGet(url);
    const data = await response.json();
    return data as Track;
  };

  const getSeveralTracks = async (ids: string[]) => {
    const url = `https://api.spotify.com/v1/tracks?ids=${ids.join(",")}`;
    const response = await buildGet(url);
    const data = (await response.json()) as SeveralTracksResponse;
    return data.tracks as Track[];
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

  const getTrackFeatures = async (trackId: string) => {
    const url = `https://api.spotify.com/v1/audio-features/${trackId}`;
    const response = await buildGet(url);

    if (!response.ok) {
      console.log("Didn't fetch features okay! ", response.status);
    }

    const data = await response.json();
    return data as TrackFeatureResponse;
  };

  const getSeveralTrackFeatures = async (trackIds: string[]) => {
    console.log(`Getting features for ids: ${trackIds.join(",")}`);
    const url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`;
    const response = await buildGet(url);

    console.log(response.status);

    if (!response.ok) {
      console.log("Didn't fetch features okay! ", response.status);
    }

    const data = await response.json();
    return data.audio_features as TrackFeatureResponse[];
  };

  const packFeatures = (features: TrackFeature) => {
    return {
      danceability: features.danceability,
      energy: features.energy,
      loudness: features.loudness,
      speechiness: features.speechiness,
      acousticness: features.acousticness,
      instrumentalness: features.instrumentalness,
      liveness: features.liveness,
      valence: features.valence,
      tempo: features.tempo,
    };
  };

  const round = (num: number) => Number(num.toFixed(3));

  const getBounds = (target: number, stdDev: number, double: boolean) => {
    const diff = double ? 2 * stdDev : stdDev;
    return { lower: round(target - diff), upper: round(target + diff) };
  };

  const isInRange = (value: number, target: number, stdDev: number) => {
    const bounds = getBounds(target, stdDev);
    const isIn = value >= bounds.lower && value <= bounds.upper;

    console.log(`${bounds.lower} <= ${value} <= ${bounds.upper} = ${isIn}`);
    return isIn;
  };

  const fitsInPreset = async (sliderValues: Preset, track: TrackFeature) => {
    // const response = await getTrackFeatures(trackId);
    // console.log(`${trackId}: ${JSON.stringify(response)}`);
    const features = packFeatures(track);
    let isSuitable = true;
    const keys = Object.keys(sliderValues) as (keyof TrackFeatures)[];
    for (const key of keys) {
      if (!isInRange(features[key], sliderValues[key].value, sliderValues[key].stdDev)) {
        console.log(`Feature ${key} is not in range`);
        isSuitable = false;
        break;
      }
    }
    // console.log(`Returning ${isSuitable} for track ${trackId}`);
    return isSuitable;
  };

  return {
    getTrack,
    getSeveralTracks,
    getRecent,
    getTracksNames,
    getTrackFeatures,
    getSeveralTrackFeatures,
    fitsInPreset,
  };
}
