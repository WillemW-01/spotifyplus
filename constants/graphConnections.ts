export type ConnectionCategory = "artist" | "playlist";

export interface Connection {
  name: string;
  description: string;
  type: ConnectionCategory;
}

export const CONNECTION_TYPES: { [key in ConnectionCategory]: Connection[] } = {
  playlist: [
    {
      name: "Song Features",
      description:
        "Songs are connected by how close they are in terms of their musical features (e.g. energy, danceability, tempo, acousticness, etc.)",
      type: "playlist",
    },
    {
      name: "Shared Artists",
      description:
        "Songs are connected to each of the artists that contributed to the song.",
      type: "playlist",
    },
    {
      name: "Album Genres",
      description: "Songs are connected by the genre of their album.",
      type: "playlist",
    },
  ],
  artist: [
    {
      name: "Related Artists",
      description: "Artists are connected to other artists Spotify normally recommends",
      type: "artist",
    },
    {
      name: "Album Genres",
      description:
        "Artists are connected to other artists based on the genres of their albums",
      type: "artist",
    },
  ],
} as const;
