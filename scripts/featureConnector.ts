import fs from "fs";
import data from "./features/features_all.json";

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
}

interface Edge {
  from: number;
  to: number;
  weight: number;
}

const features = data as Feature[];
const edges = [] as Edge[];
// const filterKeys = Object.keys(filter) as (keyof typeof filter)[];
const MAX_NEIGHBOURS = 20;
const DECAY = 2;
const CUTT_OFF = 0.344;

function recalibrate() {
  console.log("Recalibrating...");
  for (let i = 0; i < features.length; i++) {
    features[i].index = i;
  }
  fs.writeFile("scripts/features/features_all.json", JSON.stringify(features), (err) => {
    if (err) console.log(err);
  });
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

// interface Weights {
//   [key: string]: number; // This allows any string as key, but you can restrict it further
// }

// const weights: Weights = {
//   valence: 0.5,
//   energy: 0.5,
//   loudness: 0.3,
//   danceability: 0.3,
//   speechiness: 0.1,
//   liveness: 0.1,
//   tempo: 0.1,
//   key: 0.1,
//   mode: 0.1,
//   instrumentalness: 0.1,
//   acousticness: 0.1,
// };

function correctMusicalBPM(inputBPM: number) {
  // Define a valid BPM range for music
  const minBPM = 30;
  const maxBPM = 300;

  const potentialValues = [];

  // Check input value
  if (inputBPM >= minBPM && inputBPM <= maxBPM) {
    potentialValues.push(inputBPM);
  }

  // Check half of input value
  const halfValue = inputBPM / 2;
  if (halfValue >= minBPM && halfValue <= maxBPM) {
    potentialValues.push(halfValue);
  }

  // Check double of input value
  const doubleValue = inputBPM * 2;
  if (doubleValue >= minBPM && doubleValue <= maxBPM) {
    potentialValues.push(doubleValue);
  }

  // If no valid values found, return null
  if (potentialValues.length === 0) {
    return inputBPM; // or throw new Error("No valid BPM found");
  }

  // Return the value closest to 120 BPM (a common moderate tempo)
  return potentialValues.reduce((closest, current) =>
    Math.abs(current - 120) < Math.abs(closest - 110) ? current : closest
  );
}

function normalise(feature: number, key: keyof Feature) {
  let newValue = feature;
  switch (key) {
    case "loudness":
      newValue = (feature + 60) / 60;
      break;
    case "tempo":
      newValue = correctMusicalBPM(feature) / 210;
      break;
    default:
      // newValue = feature * weights[key];
      newValue = feature;
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

interface ResultObj {
  index: number;
  distance: number;
}

function connect() {
  const filterArray = [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "loudness",
    "speechiness",
    // "tempo",
    "valence",
  ] as (keyof Feature)[];
  // const allDistances = [] as number[];
  for (let i = 0; i < features.length; i++) {
    const from = features[i];
    const distances = [] as ResultObj[];
    // console.log(`Base: ${from.name}`);
    for (let j = 0; j < features.length; j++) {
      if (i != j) {
        const to = features[j];
        const d = getDistance(from, to, filterArray);
        if (d == 0) {
          console.log(`Found 0 distance between: ${from.name} and ${to.name}`);
        }
        if (d < CUTT_OFF) {
          distances.push({ index: to.index, distance: d });
        }
      }
    }
    distances.sort((a, b) => a.distance - b.distance);
    const closest = distances.slice(0, MAX_NEIGHBOURS);
    // allDistances.push(...closest.map((c) => c.distance));
    // console.log(`Closest: ${JSON.stringify(closest.map((c) => c.distance))}`);
    for (const to of closest) {
      const already = isConnected(from.index, to.index);
      if (already == -1) {
        edges.push({ from: from.index, to: to.index, weight: to.distance });
      } else {
        edges[already].weight += to.distance;
      }
    }
  }
  // writeToFile("scripts/all_distances.json", JSON.stringify(allDistances));
}

function normaliseEdges() {
  const edgeWeights = edges.map((e) => e.weight);
  const maxWeight = Math.max(...edgeWeights);
  const minWeight = Math.min(...edgeWeights);
  console.log(`Max weight: ${maxWeight}, min: ${minWeight}`);
  for (let i = 0; i < edges.length; i++) {
    edges[i].weight = normaliseExp(edges[i]);
  }
}

function normaliseInverse(edge: Edge, min: number, max: number) {
  const normDistance = (edge.weight - min) / (max - min);
  const inverseDistance = 1 / (normDistance + 0.01);
  return Math.pow(inverseDistance, 2);
}

function normaliseExp(edge: Edge) {
  return Math.exp(-DECAY * edge.weight);
}

function writeToFile(fileName: string, toWrite: string, append = false) {
  if (append) {
    fs.appendFile(fileName, toWrite, (err) => {
      if (err) console.log(err);
    });
  } else {
    fs.writeFile(fileName, toWrite, (err) => {
      if (err) console.log(err);
    });
  }
}

function write() {
  // console.log(edges);
  // edges = edges.filter((e) => e.weight > 1);

  let nodeString = "nodedef>name INTEGER,guid VARCHAR,artist VARCHAR,label VARCHAR,";
  nodeString +=
    "danceability DOUBLE,energy DOUBLE,key DOUBLE,loudness DOUBLE,mode DOUBLE,speechiness DOUBLE,acousticness DOUBLE,instrumentalness DOUBLE,liveness DOUBLE,valence DOUBLE,tempo DOUBLE\n";

  for (const item of features) {
    nodeString += `${item.index},${item.id},"${item.artist}","${item.name}",${item.danceability},${item.energy},${item.key},${item.loudness},${item.mode},${item.speechiness},${item.acousticness},${item.instrumentalness},${item.liveness},${item.valence},${item.tempo}\n`;
  }
  writeToFile("scripts/nodes_big_new.gdf", nodeString);

  let edgeString = "edgedef>source INTEGER,target INTEGER,weight DOUBLE\n";
  for (const edge of edges) {
    edgeString += `${edge.from},${edge.to},${edge.weight}\n`;
  }
  writeToFile("scripts/nodes_big_new.gdf", edgeString, true);
  console.log("edges written to file");
  console.log("edges length: ", edges.length);
}

// recalibrate();
connect();
normaliseEdges();
write();
