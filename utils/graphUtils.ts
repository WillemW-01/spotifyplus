import { Edge, Node } from "@/interfaces/graphs";

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
