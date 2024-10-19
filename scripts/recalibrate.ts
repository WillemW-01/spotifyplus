import fs from "fs";
import data from "./features/features_all.json";
import { TrackFeature } from "@/interfaces/tracks";

const features = data as TrackFeature[];

console.log("Recalibrating...");
for (let i = 0; i < features.length; i++) {
  features[i].index = i;
}
fs.writeFile(
  "scripts/features/features_all_calibrated.json",
  JSON.stringify(features),
  (err) => {
    if (err) console.log(err);
  }
);
