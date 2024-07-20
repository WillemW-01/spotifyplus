interface Edge {
  from: number;
  to: number;
}

interface Node {
  id: number;
  label: string;
  shape: string;
}

export function useGraphMetrics() {
  const getImmediateNeighbours = (node: number, edges: Edge[]) => {
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
  const getNeighbours = (node: number, edges: []) => {
    console.log("Current edges length: ", edges?.length);
    const neighbours = getImmediateNeighbours(node, edges);
    const tempNeighbours = [] as number[];
    for (const neighbour of neighbours) {
      const newNeighbours = getImmediateNeighbours(neighbour, edges);
      tempNeighbours.push(...newNeighbours);
    }
    tempNeighbours.sort((a, b) => a - b);
    console.log(tempNeighbours);
    return [...new Set(tempNeighbours)];
  };

  return {
    getNeighbours,
  };
}
