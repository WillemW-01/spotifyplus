import data from "./features/features_all.json";
import { Edge } from "@/interfaces/graphs";
import { TrackFeature } from "@/interfaces/tracks";
import { connect } from "./connect";
import { normaliseEdges } from "./normalise";
import { write } from "./write";

function main() {
  const outputName = process.argv[2] ?? "nodes";
  const features = data as TrackFeature[];
  const edges = [] as Edge[];
  connect(features, edges);
  normaliseEdges(edges);
  write(features, edges, outputName);
}

main();

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

// recalibrate();
