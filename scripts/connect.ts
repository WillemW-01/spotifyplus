import { ResultObj } from "./features/interfaces";
import { TrackFeature, Feature } from "@/interfaces/tracks";
import { normalise } from "./normalise";
import { Edge } from "@/interfaces/graphs";

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
    const fromTo = edges[i].from === from && edges[i].to === to;
    const toFrom = edges[i].from === to && edges[i].to === from;
    if (fromTo || toFrom) {
      return i;
    }
  }
  return -1;
}

export function connect(
  features: TrackFeature[],
  edges: Edge[],
  // eslint-disable-next-line no-unused-vars
  pushEdge?: (tempEdges, from, to, weight?) => void
) {
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
  // console.log(`Features: ${features.length}`);
  for (let i = 0; i < features.length; i++) {
    const from = features[i];
    const distances = [] as ResultObj[];
    // console.log(`Base: ${from.name}`);
    for (let j = 0; j < features.length; j++) {
      if (i != j) {
        const to = features[j];
        const d = getDistance(from, to, filterArray);
        if (d == 0) {
          // console.log(`Found 0 d: ${from.name} <=> ${to.name}`);
          distances.push({ index: j, distance: 0.001 });
        } else if (d < CUTT_OFF) {
          // console.log(
          // `Found ${d.toFixed(4)} distance for ${from.name} (${i}) <=> ${to.name} (${j})`
          // );
          distances.push({ index: j, distance: d });
        }
      }
    }
    distances.sort((a, b) => a.distance - b.distance);
    const closest = distances.slice(0, MAX_NEIGHBOURS);
    for (const to of closest) {
      const already = isConnected(edges, i, to.index);
      // console.log(`Already: ${i} -> ${to.index} = ${already}`);
      if (already == -1) {
        // console.log(`Pushing new edge: ${from.name} -> ${to.index}`);
        pushEdge(edges, i, to.index, to.distance);
      } else {
        edges[already].value += to.distance;
      }
    }
  }
  // writeToFile("scripts/all_distances.json", JSON.stringify(allDistances));
}
