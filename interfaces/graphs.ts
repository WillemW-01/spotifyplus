import { TimeFrame } from "@/components/graph/GraphBuilder";
import { Connection } from "@/constants/graphConnections";
import { TopArtist } from "./topItems";

export interface Edge {
  from: number;
  to: number;
  value: number;
}

export interface Node {
  id: number;
  guid: string;
  label: string;
  shape?: string;
  group?: string;
}

export interface BuildGraphArtistsProps {
  timeFrame?: TimeFrame;
  artists?: TopArtist[];
  connectionTypes?: Connection[];
}

export interface BuildGraphPlaylistProps {
  playlistIds: string[];
  connectionTypes?: Connection[];
}
