// import { PackedArtist } from "@/app/(tabs)/graph";
import { TopArtist } from "@/interfaces/topItems";

interface Edge {
  from: number;
  to: number;
  value: number;
}

// interface Node {
//   id: number;
//   label: string;
//   shape: string;
// }

export interface PackedArtist {
  title: string;
  id: number;
  guid: string;
  popularity: number;
  imageUri: string;
  genres: string[];
}

const packArtistItem = (artistItem: TopArtist, index: number) => {
  return {
    title: artistItem.name,
    id: index,
    guid: artistItem.id,
    popularity: artistItem.popularity,
    genres: artistItem.genres,
    imageUri: artistItem.images[0].url,
    width: 90,
  };
};

export const packArtists = (artists: TopArtist[]): PackedArtist[] =>
  artists.map(packArtistItem);

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

const alreadyConnected = (
  artistFrom: PackedArtist,
  artistTo: PackedArtist,
  edges: Edge[]
): number => {
  for (let i = 0; i < edges.length; i++) {
    const fromToExists = edges[i].from === artistFrom.id && edges[i].to === artistTo.id;
    const toFromExists = edges[i].to === artistFrom.id && edges[i].from === artistTo.id;
    console.log(
      `FromTo: ${fromToExists}, ToFrom: ${toFromExists}, edgesLength: ${edges.length}`
    );
    if (fromToExists || toFromExists) {
      return i;
    }
  }
  return -1;
};

const connectMutalGenres = (artistFrom: PackedArtist, artistTo: PackedArtist): Edge[] => {
  const edges = [] as Edge[];

  artistFrom.genres.forEach((genre) => {
    if (artistTo.genres.includes(genre)) {
      const connected = alreadyConnected(artistFrom, artistTo, edges);
      if (connected >= 0) {
        console.log("Already connected!, new value: ", edges[connected].value + 1);
        edges[connected].value += 1;
      } else {
        console.log("New edge: ", artistFrom.id, artistTo.id, "edgesLen: ", edges.length);
        edges.push({ from: artistFrom.id, to: artistTo.id, value: 1 });
      }
    }
  });
  return edges;
};

export function connectArtists(artists: PackedArtist[]): Edge[] {
  const tempEdges = [] as Edge[];
  for (let i = 0; i < artists.length; i++) {
    for (let j = 0; j < artists.length; j++) {
      if (i !== j) {
        const edges = connectMutalGenres(artists[i], artists[j]);
        if (edges.length > 0) {
          tempEdges.push(...edges);
        }
      }
    }
  }

  return tempEdges;
}
