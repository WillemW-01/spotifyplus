import { PlayHistoryObject, Track, TrackFeatureResponse } from "@/interfaces/tracks";

import { useRequestBuilder } from "./useRequestBuilder";
import { TrackFeatures, VARIANCE } from "@/constants/sliderPresets";

import fs from "fs";

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

  const getTrackFeatures = async (trackId: string) => {
    const url = `https://api.spotify.com/v1/audio-features/${trackId}`;
    const response = await buildGet(url);

    if (!response.ok) {
      console.log("Didn't fetch features okay! ", response.status);
    }

    const data = await response.json();
    return data as TrackFeatureResponse;
  };

  const packFeatures = (features: TrackFeatureResponse) => {
    return {
      danceability: features.danceability,
      energy: features.danceability,
      loudness: features.danceability,
      speechiness: features.danceability,
      acousticness: features.danceability,
      instrumentalness: features.danceability,
      liveness: features.danceability,
      valence: features.danceability,
      tempo: features.danceability,
    };
  };

  const isInRange = (value: number, target: number, variance: number) => {
    const isIn = value >= target - variance && value <= target + variance;
    // console.log(`${target - variance} vs ${value} vs ${target + variance}: ${isIn}`);
    return isIn;
  };

  const fitsInPreset = async (sliderValues: TrackFeatures, trackId: string) => {
    const response = await getTrackFeatures(trackId);
    console.log(`${trackId}: ${JSON.stringify(response)}`);
    const features = packFeatures(response);
    let isSuitable = true;
    const keys = Object.keys(sliderValues) as (keyof TrackFeatures)[];
    for (const key of keys) {
      if (!isInRange(features[key], sliderValues[key], VARIANCE)) {
        // console.log(`Feature ${key} is not in range`);
        isSuitable = false;
        break;
      }
    }
    // console.log(`Returning ${isSuitable} for track ${trackId}`);
    return isSuitable;
  };

  return {
    getRecent,
    getTracksNames,
    getTrackFeatures,
    fitsInPreset,
  };
}
