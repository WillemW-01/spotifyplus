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
  danceability: 0.05,
  energy: 0.05,
  // valence: 0.05,
  // acousticness: 0.05,
  // tempo: 10,
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

        for (const key of filterKeys) {
          if (typeof fromFeatures[key] === "number") {
            const isIn = isInRange(
              fromFeatures[key] as number,
              toFeatures[key] as number,
              filter[key]
            );
            // console.log("Checking", key, fromFeatures[key], toFeatures[key], isIn);
            if (isIn) {
              const connected = isConnected(from.index, to.index);
              if (connected !== -1) {
                // console.log("Already connected!");
                edges[connected].weight += 1;
              } else {
                // console.log("Connecting!");
                edges.push({ from: from.index, to: to.index, weight: 1 });
              }
            }
          }
        }
      }
    }
  });
});

console.log(edges);
edges = edges.filter((e) => e.weight > 1);
console.log("edges length: ", edges.length);

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
  console.log(`Adding edge: ${edge.from}-${edge.to}`);
  graph.addEdge(edge.from, edge.to);
}

console.log(graph);
console.log("Starting clustering");
// Apply the Louvain clustering algorithm
// louvain.assign(graph, { resolution: 0.8 });

console.log("Finished clustering");

// Print or save the clustering result
// console.log(clusters);
const communities = louvain(graph, { resolution: 0.6 });
console.log(communities);

const namedCommunities = [];

for (const node in communities) {
  const name = ids[Number(node)].name;
  const currCommunity = communities[node];
  console.log("Looking at node: ", node);
  if (currCommunity > namedCommunities.length - 1) {
    namedCommunities.push([name]);
  } else {
    namedCommunities[currCommunity].push(name);
  }
}

console.log(namedCommunities);

// Optionally write the clusters to a file
// fs.writeFileSync("clusters.json", JSON.stringify(clusters, null, 2));
