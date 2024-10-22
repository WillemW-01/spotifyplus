import { Feature } from "@/interfaces/tracks";
import { Edge } from "@/interfaces/graphs";

const DECAY = 2;

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

export function normalise(feature: number, key: keyof Feature) {
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

export function normaliseEdges(edges: Edge[]) {
  const edgeWeights = edges.map((e) => e.value);
  const maxWeight = Math.max(...edgeWeights);
  const minWeight = Math.min(...edgeWeights);
  console.log(`Max weight: ${maxWeight.toFixed(4)}, min: ${minWeight.toFixed(4)}`);
  for (let i = 0; i < edges.length; i++) {
    edges[i].value = normaliseExp(edges[i]);
  }
}

export function normaliseInverse(edge: Edge, min: number, max: number) {
  const normDistance = (edge.value - min) / (max - min);
  const inverseDistance = 1 / (normDistance + 0.01);
  return Math.pow(inverseDistance, 2);
}

export function normaliseExp(edge: Edge) {
  return Math.exp(-DECAY * edge.value);
}
