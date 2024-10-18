export interface TrackFeatures {
  danceability: number;
  energy: number;
  loudness: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
}

export interface Parameter {
  min: number;
  max: number;
  step: number;
}

export const VARIANCE = 0.2;

export const PARAMETERS = {
  danceability: {
    min: 0,
    max: 100,
    step: 50,
  },
  energy: {
    min: 0,
    max: 100,
    step: 50,
  },
  loudness: {
    min: 0,
    max: 100,
    step: 50,
  },
  speechiness: {
    min: 0,
    max: 100,
    step: 50,
  },
  acousticness: {
    min: 0,
    max: 100,
    step: 50,
  },
  instrumentalness: {
    min: 0,
    max: 100,
    step: 50,
  },
  liveness: {
    min: 0,
    max: 100,
    step: 50,
  },
  valence: {
    min: 0,
    max: 100,
    step: 50,
  },
  tempo: {
    min: 60,
    max: 240,
    step: 1,
  },
} as { [key: string]: Parameter };

export const PRESETS = {
  default: {
    danceability: 0.5,
    energy: 0.5,
    loudness: 0.5,
    speechiness: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5,
    liveness: 0.5,
    valence: 0.5,
    tempo: 1.2,
  },
  mellow: {
    danceability: 0.5,
    energy: 0.5,
    loudness: 0.5,
    speechiness: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5,
    liveness: 0.5,
    valence: 0.5,
    tempo: 0.5,
  },
  upbeat: {
    danceability: 0.9,
    energy: 0.9,
    loudness: 0.9,
    speechiness: 0.9,
    acousticness: 0.9,
    instrumentalness: 0.9,
    liveness: 0.9,
    valence: 0.9,
    tempo: 0.9,
  },
  sad: {
    danceability: 0.1,
    energy: 0.1,
    loudness: 0.1,
    speechiness: 0.1,
    acousticness: 0.1,
    instrumentalness: 0.1,
    liveness: 0.1,
    valence: 0.1,
    tempo: 0.1,
  },
  acoustic: {
    danceability: 0.5,
    energy: 0.5,
    loudness: 0.5,
    speechiness: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5,
    liveness: 0.5,
    valence: 0.5,
    tempo: 0.5,
  },
} as const;

export const PREDICATES = {
  mellow: (song: TrackFeatures) => song.energy < 0.5,
  upbeat: (song: TrackFeatures) => song.valence > 0.5 && song.energy > 0.4,
  sad: (song: TrackFeatures) => song.energy < 0.5 && song.valence < 0.4,
  acoustic: (song: TrackFeatures) => song.acousticness > 0.5,
};

export const DESCRIPTIONS = {
  danceability:
    "Danceability tells you how good a track is for dancing. It considers elements like tempo and beat strength. A value of 0 means it's not good for dancing, and 100 means it's perfect for dancing.",
  energy:
    "Energy measures how intense and active a track feels, from 0 to 100. High-energy tracks feel fast and loud, like death metal. Low-energy tracks feel calm and quiet, like a Bach prelude.",
  loudness:
    "Loudness is how loud a track is, measured in decibels (dB). It's averaged across the whole track and helps compare the loudness of different tracks. Values range from -60 to 0 dB.",
  speechiness:
    "Speechiness detects spoken words in a track. A value close to 100 means the track is mostly speech, like an audiobook. Values above 0.66 are mostly spoken words, 33 to 66 might mix music and speech, and below 33 is mostly music.",
  acousticness:
    "Acousticness tells you how likely a track is acoustic, with values from 0 to 100. A value of 100 means it's definitely acoustic.",
  instrumentalness:
    "Instrumentalness predicts if a track has no vocals. A value close to 100 means it's likely instrumental. Values above 0.5 suggest the track is instrumental, but the higher the value, the more confident we are.",
  liveness:
    "Liveness indicates if a track was recorded live. Higher values mean there's a greater chance it was performed live. A value above 0.8 strongly suggests it's a live recording.",
  valence:
    "Valence measures how positive a track sounds, from 0 to 100. High valence means the track sounds happy and cheerful. Low valence means it sounds sad or angry.",
  tempo:
    "Tempo is the speed of a track, measured in beats per minute (BPM). It tells you how fast or slow the music is.",
};
