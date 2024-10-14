import fs from "fs";
import { UndirectedGraph } from "graphology";
import louvain from "graphology-communities-louvain";

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

interface Edge {
  from: number;
  to: number;
  weight: number;
}

import data from "./features.json";
const max = data.length;

const features = data as Feature[];
const ids = features
  .map((f) => ({ id: f.id, index: f.index, name: f.name, artist: f.artist }))
  .slice(0, max);

const filter = {
  // danceability: 0.1,
  energy: 0.1,
  valence: 0.1,
  // acousticness: 0.05,
  tempo: 15,
};

function isInRange(value: number, target: number, variance: number) {
  return value >= target - variance && value <= target + variance;
}

function isConnected(from: number, to: number) {
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

let edges = [] as Edge[];
const filterKeys = Object.keys(filter) as (keyof typeof filter)[];

ids.slice(0, max).forEach((from, i) => {
  const progress = ((i / ids.length) * 100).toFixed(2);
  console.log(`Checking for ${from.id} (${progress}%)`);
  ids.slice(0, max).forEach((to) => {
    if (from.id !== to.id) {
      const already = isConnected(from.index, to.index);
      if (already === -1) {
        const fromFeatures = features[from.index];
        const toFeatures = features[to.index];
        let shouldConnect = true;
        for (const key of filterKeys) {
          if (typeof fromFeatures[key] === "number") {
            shouldConnect =
              shouldConnect &&
              isInRange(
                fromFeatures[key] as number,
                toFeatures[key] as number,
                filter[key]
              );
            // console.log("Checking", key, fromFeatures[key], toFeatures[key], isIn);
          }
        }
        if (shouldConnect) {
          edges.push({ from: from.index, to: to.index, weight: 1 });
        }
      }
    }
  });
});

console.log(edges);
// edges = edges.filter((e) => e.weight > 1);

let writeString = "";
for (const edge of edges) {
  writeString += `${edge.from},${edge.to},${edge.weight}\n`;
}
fs.appendFile("scripts/edges.json", writeString, (err) => {
  if (err) console.log(err);
});
console.log("edges written to file");

const graph = new UndirectedGraph();

ids.forEach((id) => {
  graph.addNode(`${id.index}`, { id: id.id });
});

// Add edges to the graph
for (const edge of edges) {
  graph.addEdge(edge.from, edge.to);
}

console.log("edges length: ", edges.length);

// Print or save the clustering result
// console.log(clusters);
// const result = louvain.detailed(graph, { resolution: 1.5 });
// console.log(result);
// const communities = result.communities;
// const namedCommunities = [];

// for (const node in communities) {
//   const name = ids[Number(node)].name;
//   const currCommunity = communities[node];
//   if (currCommunity > namedCommunities.length - 1) {
//     namedCommunities.push([name]);
//   } else {
//     namedCommunities[currCommunity].push(name);
//   }
// }

// console.log(namedCommunities);

// for (const community of namedCommunities) {
//   console.log(`${community.join("|")}`);
// }

// Optionally write the clusters to a file
// fs.writeFileSync("clusters.json", JSON.stringify(clusters, null, 2));
