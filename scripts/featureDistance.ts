interface Feature {
  index: number;
  artist: string;
  name: string;
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  id__1: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}

interface ResultObj {
  name: string;
  distance: number;
}

interface Weights {
  [key: string]: number; // This allows any string as key, but you can restrict it further
}

const weights: Weights = {
  valence: 0.5,
  energy: 0.5,
  loudness: 0.3,
  danceability: 0.3,
  speechiness: 0.1,
  liveness: 0.1,
  tempo: 0.1,
  key: 0.1,
  mode: 0.1,
  instrumentalness: 0.1,
  acousticness: 0.1,
};

// const weights: Weights = {
//   valence: 0.173,
//   energy: 0.153,
//   loudness: 0.134,
//   danceability: 0.13,
//   speechiness: 0.129,
//   liveness: 0.118,
//   tempo: 0.099,
//   key: 0.071,
//   mode: 0.065,
//   instrumentalness: 0.005,
//   acousticness: -0.078,
// };

function normalise(feature: number, key: keyof Feature) {
  let newValue = feature;
  switch (key) {
    case "loudness":
      newValue = (feature + 60) / 60;
      break;
    case "tempo":
      newValue = feature / 210;
      break;
    default:
      newValue = feature * weights[key];
  }
  return newValue;
}

function getDistance(f1: Feature, f2: Feature, props: (keyof Feature)[]) {
  let sum = 0;
  for (const feature of props) {
    const v1 = normalise(f1[feature] as number, feature);
    const v2 = normalise(f2[feature] as number, feature);
    sum += Math.pow(v1 - v2, 2);
  }
  return Math.sqrt(sum);
}

function findClosest10(i: number, array: Feature[]) {
  const tempArray = [...array.slice(0, i), ...array.slice(i + 1)];
  console.log(`Features length: ${tempArray.length}`);
  const baseItem = JSON.parse(JSON.stringify(array[i]));
  const result = [] as ResultObj[];
  console.log(baseItem);
  for (const item of tempArray) {
    const distance = getDistance(baseItem, item, [
      "danceability",
      "energy",
      "loudness",
      "speechiness",
      "acousticness",
      "instrumentalness",
      "liveness",
      "valence",
      "tempo",
    ]);
    result.push({ name: item.name, distance: distance });
  }
  result.sort((a, b) => a.distance - b.distance);
  return result;
}

import data from "./features.json";
const features = data as Feature[];

const i = features.findIndex((f) => f.name === "When I Was Your Man");
console.log(i);
console.log(`Looking at: ${features[i].name}`);
const top20 = findClosest10(i, features);
console.log(JSON.stringify(top20));
