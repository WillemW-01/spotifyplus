export interface Connection {
  name: keyof Connection;
  description: string;
}

export const CONNECTION_TYPES = {
  playlist: [
    {
      name: "Song Features",
      description:
        "Songs are connected by how close they are in terms of their musical features (e.g. energy, danceability, tempo, acousticness, etc.)",
    },
    {
      name: "Shared Artists",
      description:
        "Songs are connected to each of the artists that contributed to the song.",
    },
    {
      name: "Album Genres",
      description: "Songs are connected by the genre of their album.",
    },
  ],
  artist: [
    {
      name: "Album Genres",
      description:
        "Artists are connected to other artists based on the genres of their albums",
    },
    {
      name: "Related Artists",
      description: "Artists are connected to other artists Spotify normally recommends",
    },
  ],
} as const;

export type ConnectionType = (typeof CONNECTION_TYPES)["artist"][number];
