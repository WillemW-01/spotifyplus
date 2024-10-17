import fs from "fs";
import { Edge, TrackFeature } from "./features/interfaces";

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
const keysToWrite = [
  "acousticness",
  "album",
  "artists",
  "danceability",
  "energy",
  "instrumentalness",
  "key",
  "liveness",
  "loudness",
  "mode",
  "playlist",
  "popularity",
  "speechiness",
  "tempo",
  "valence",
] as (keyof TrackFeature)[];
const specialKeys = ["artists", "album"];

function writeType<K extends keyof TrackFeature>(key: K, obj: TrackFeature) {
  if (specialKeys.includes(key)) {
    switch (key) {
      case "album":
        return "VARCHAR";
      case "artists":
        return "VARCHAR";
    }
  }
  const v = obj[key];
  switch (typeof v) {
    case "number":
      return "DOUBLE";
    case "string":
      return "VARCHAR";
    case "boolean":
      return "BOOLEAN";
  }
  return typeof v;
}

function modify(f: TrackFeature, k: keyof TrackFeature) {
  if (specialKeys.includes(k)) {
    switch (k) {
      case "album":
        return `"${f[k].name}"`;
      case "artists":
        return `"${f[k].map((a) => a.name).join(",")}"`;
    }
  }
  return f[k];
}

function getLine(f: TrackFeature) {
  return keysToWrite
    .map((k) => (typeof f[k] === "string" ? `"${modify(f, k)}"` : modify(f, k)))
    .join(",");
}

function getHeaderLine(f: TrackFeature) {
  return keysToWrite.map((k) => `${k} ${writeType(k, f)}`).join(",");
}

export function write(features: TrackFeature[], edges: Edge[], outputName = "nodes") {
  const nodeString = [
    "nodedef>name INTEGER,guid VARCHAR,label VARCHAR," + getHeaderLine(features[0]),
  ];
  for (const item of features) {
    nodeString.push(`${item.index},${item.id},"${item.name}",` + getLine(item));
  }
  writeToFile(`scripts/${outputName}.gdf`, nodeString.join("\n") + "\n");

  let edgeString = "edgedef>source INTEGER,target INTEGER,weight DOUBLE\n";
  for (const edge of edges) {
    edgeString += `${edge.from},${edge.to},${edge.weight.toFixed(5)}\n`;
  }
  writeToFile(`scripts/${outputName}.gdf`, edgeString, true);
  console.log("edges written to file");
  console.log("edges length: ", edges.length);
}
