import { LocalState } from "@/app/(tabs)/mood";
import { Edge, Node } from "@/interfaces/graphs";
import { IoniconType } from "@/interfaces/ionicon";
import { ColorValue, ViewStyle } from "react-native";

export const fromTo = (edge: Edge, from: number, to: number) =>
  edge.from === from && edge.to === to;
export const toFrom = (edge: Edge, from: number, to: number) =>
  edge.from === to && edge.to === from;

export const isConnected = (
  from: number,
  to: number,
  edges: Edge[],
  directed = true
): boolean => {
  return edges.some(
    (edge) => fromTo(edge, from, to) || (!directed && toFrom(edge, from, to))
  );
};

export const findEdgeIndex = (
  from: number,
  to: number,
  edges: Edge[],
  directed = true
): number => {
  return edges.findIndex(
    (edge) => fromTo(edge, from, to) || (!directed && toFrom(edge, from, to))
  );
};

export const pushEdge = (edges: Edge[], from: number, to: number, weight?: number) => {
  edges.push({ from, to, value: weight ?? 1 });
};

export const buildNode = (
  id: number,
  guid: string,
  name: string,
  group: "artist" | "song" = "song"
) =>
  ({
    id: id,
    guid: guid,
    label: name,
    shape: "dot",
    group: group,
  } as Node);

export const getImmediateNeighbours = (node: number, edges: Edge[] | undefined) => {
  if (!edges) return [];
  const neighbours = [] as number[];
  edges.forEach((edge: Edge) => {
    if (edge.from == node) {
      neighbours.push(edge.to);
    } else if (edge.to == node) {
      neighbours.push(edge.from);
    }
  });
  return neighbours;
};

export const getNeighbours = (
  node: number,
  degree = 1 | 2,
  edges: Edge[] | undefined
) => {
  console.log("Current edges length: ", edges?.length);
  let neighbours = getImmediateNeighbours(node, edges);
  const tempNeighbours = [] as number[];
  if (degree == 2) {
    for (const neighbour of neighbours) {
      const newNeighbours = getImmediateNeighbours(neighbour, edges);
      tempNeighbours.push(...newNeighbours);
    }
    tempNeighbours.sort((a, b) => a - b);
    console.log(tempNeighbours);
  }
  neighbours = degree == 2 ? tempNeighbours : neighbours;
  return [...new Set(neighbours)];
};

export const getShadowStyle = (synced: LocalState): ViewStyle => ({
  shadowColor: iconStyles[synced].color,
  shadowOpacity: synced == "online" ? 0.0 : 0.9,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 10,
});

export interface IconStyle {
  color: ColorValue;
  name: IoniconType;
  opacity: number;
}

export const iconStyles = {
  synced: {
    color: "green",
    name: "checkmark-circle",
    opacity: 0.0,
  },
  unsynced: {
    color: "orange",
    name: "alert-circle",
    opacity: 0.5,
  },
  online: {
    color: "black",
    name: "globe",
    opacity: 0.0,
  },
} as { [key: string]: IconStyle };

export const NUDGE = 10;
