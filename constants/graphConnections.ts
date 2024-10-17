export interface Connection {
  name: string;
  description: string;
}

export const CONNECTION_TYPES: { [key: string]: Connection[] } = {
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
};
