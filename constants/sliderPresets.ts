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
  unit?: string;
}

export interface PresetItem {
  value: number;
  stdDev: number;
}

export type Preset = { [key in keyof TrackFeatures]: PresetItem };

export const VARIANCE = 0.2;

export const PARAMETERS = {
  danceability: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  energy: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  loudness: {
    min: -60,
    max: 0,
    step: 5,
    unit: "db",
  },
  speechiness: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  acousticness: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  instrumentalness: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  liveness: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  valence: {
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  tempo: {
    min: 60,
    max: 240,
    step: 1,
    unit: "bpm",
  },
} as { [key: string]: Parameter };

export const PRESETS: {
  readonly [presetName: string]: Preset;
} = {
  default: {
    danceability: { value: 0.556, stdDev: 0.124 },
    energy: { value: 0.688, stdDev: 0.144 },
    loudness: { value: -6.722, stdDev: 2.237 },
    speechiness: { value: 0.05, stdDev: 0.039 },
    acousticness: { value: 0.104, stdDev: 0.116 },
    instrumentalness: { value: 0.013, stdDev: 0.078 },
    liveness: { value: 0.159, stdDev: 0.099 },
    valence: { value: 0.388, stdDev: 0.169 },
    tempo: { value: 124.6, stdDev: 24.916 },
  },
  mellow: {
    danceability: { value: 0.5, stdDev: 0.0 },
    energy: { value: 0.5, stdDev: 0.0 },
    loudness: { value: 0.5, stdDev: 0.0 },
    speechiness: { value: 0.5, stdDev: 0.0 },
    acousticness: { value: 0.5, stdDev: 0.0 },
    instrumentalness: { value: 0.5, stdDev: 0.0 },
    liveness: { value: 0.5, stdDev: 0.0 },
    valence: { value: 0.5, stdDev: 0.0 },
    tempo: { value: 0.5, stdDev: 0.0 },
  },
  upbeat: {
    danceability: { value: 0.556, stdDev: 0.371 },
    energy: { value: 0.688, stdDev: 0.424 },
    loudness: { value: -6.722, stdDev: 8.659 },
    speechiness: { value: 0.05, stdDev: 0.178 },
    acousticness: { value: 0.104, stdDev: 0.489 },
    instrumentalness: { value: 0.013, stdDev: 0.477 },
    liveness: { value: 0.159, stdDev: 0.274 },
    valence: { value: 0.388, stdDev: 0.463 },
    tempo: { value: 124.605, stdDev: 75.925 },
  },
  sad: {
    danceability: { value: 0.1, stdDev: 0.0 },
    energy: { value: 0.1, stdDev: 0.0 },
    loudness: { value: 0.1, stdDev: 0.0 },
    speechiness: { value: 0.1, stdDev: 0.0 },
    acousticness: { value: 0.1, stdDev: 0.0 },
    instrumentalness: { value: 0.1, stdDev: 0.0 },
    liveness: { value: 0.1, stdDev: 0.0 },
    valence: { value: 0.1, stdDev: 0.0 },
    tempo: { value: 0.1, stdDev: 0.0 },
  },
  acoustic: {
    danceability: { value: 0.5, stdDev: 0.5 },
    energy: { value: 0.5, stdDev: 0.5 },
    loudness: { value: -30, stdDev: 30 },
    speechiness: { value: 0.5, stdDev: 0.5 },
    acousticness: { value: 0.85, stdDev: 0.15 },
    instrumentalness: { value: 0.5, stdDev: 0.5 },
    liveness: { value: 0.5, stdDev: 0.5 },
    valence: { value: 0.5, stdDev: 0.5 },
    tempo: { value: 120, stdDev: 60 },
  },
  "praise-like": {
    danceability: { value: 0.459, stdDev: 0.284 },
    energy: { value: 0.741, stdDev: 0.363 },
    loudness: { value: -6.48, stdDev: 5.108 },
    speechiness: { value: 0.057, stdDev: 0.104 },
    acousticness: { value: 0.061, stdDev: 0.237 },
    instrumentalness: { value: 0.001, stdDev: 0.007 },
    liveness: { value: 0.752, stdDev: 0.28 },
    valence: { value: 0.261, stdDev: 0.239 },
    tempo: { value: 132.856, stdDev: 49.277 },
  },
} as const;

export const PREDICATES = {
  mellow: (song: TrackFeatures) => song.energy < 0.5,
  upbeat: (song: TrackFeatures) => song.valence > 0.5 && song.energy > 0.4,
  sad: (song: TrackFeatures) => song.energy < 0.5 && song.valence < 0.4,
  acoustic: (song: TrackFeatures) => song.acousticness > 0.5,
  "praise-like": (song: TrackFeatures) => song.energy == 0.7,
};

export const DESCRIPTIONS = {
  danceability:
    "Danceability tells you how good a track is for dancing. It considers elements like tempo and beat strength. Most songs sit around the 50 mark, though variance from it is meaningful.",
  energy:
    "Energy measures how intense and active a track feels, from 0 to 100. High-energy tracks feel fast and loud, like death metal. Low-energy tracks feel calm and quiet, like a Bach prelude.",
  loudness:
    "Loudness is how loud a track is, measured in decibels (dB). It's averaged across the whole track and helps compare the loudness of different tracks. Values range from -60 to 0 dB.",
  speechiness:
    "Speechiness detects spoken words in a track. A value close to 100 means the track is mostly speech, like an audiobook. Values above 66 are mostly spoken words, 33 to 66 might mix music and speech, and below 33 is mostly music.",
  acousticness:
    "Acousticness tells you how likely a track is acoustic, with values from 0 to 100. Anything above 50 is probably acoustic, and anything above 70 is definitely acoustic.",
  instrumentalness:
    "Instrumentalness predicts if a track has no vocals. A value close to 100 means it's likely instrumental. Values above 50 suggest the track is instrumental, but the higher the value, the more confident we are.",
  liveness:
    "Liveness indicates if a track was recorded live. Higher values mean there's a greater chance it was performed live. A value above 80 strongly suggests it's a live recording.",
  valence:
    "Valence measures how positive a track sounds, from 0 to 100. High valence means the track sounds happy and cheerful. Low valence means it sounds sad or angry.",
  tempo:
    "Tempo is the speed of a track, measured in beats per minute (BPM). It tells you how fast or slow the music is. Caution: BPM detection algorithms are very prone to be wrong.",
};
