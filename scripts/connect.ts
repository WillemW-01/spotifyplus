import { Edge, Feature, ResultObj, TrackFeature } from "./features/interfaces";
import { normalise } from "./normalise";

const MAX_NEIGHBOURS = 3;
const CUTT_OFF = 0.344;

function getDistance(f1: TrackFeature, f2: TrackFeature, props: (keyof Feature)[]) {
  let sum = 0;
  for (const feature of props) {
    const v1 = normalise(f1[feature] as number, feature);
    const v2 = normalise(f2[feature] as number, feature);
    sum += Math.pow(v1 - v2, 2);
  }
  return Math.sqrt(sum);
}

function isConnected(edges: Edge[], from: number, to: number) {
  for (let i = 0; i < edges.length; i++) {
    if (
      (edges[i].from === from && edges[i].to === to) ||
      (edges[i].from === to && edges[i].to === from)
    ) {
      return i;
    }
  }
  return -1;
}

export function connect(features: TrackFeature[], edges: Edge[]) {
  const filterArray = [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "loudness",
    "speechiness",
    "tempo",
    "valence",
  ] as (keyof Feature)[];
  for (let i = 0; i < features.length; i++) {
    const from = features[i];
    const distances = [] as ResultObj[];
    // console.log(`Base: ${from.name}`);
    for (let j = 0; j < features.length; j++) {
      if (i != j) {
        const to = features[j];
        const d = getDistance(from, to, filterArray);
        if (d == 0) {
          console.log(`Found 0 d: ${from.name} <=> ${to.name}`);
          distances.push({ index: to.index, distance: 0.001 });
        } else if (d < CUTT_OFF) {
          distances.push({ index: to.index, distance: d });
        }
      }
    }
    distances.sort((a, b) => a.distance - b.distance);
    const closest = distances.slice(0, MAX_NEIGHBOURS);
    for (const to of closest) {
      const already = isConnected(edges, from.index, to.index);
      if (already == -1) {
        edges.push({ from: from.index, to: to.index, weight: to.distance });
      } else {
        edges[already].weight += to.distance;
      }
    }
  }
  // writeToFile("scripts/all_distances.json", JSON.stringify(allDistances));
}
