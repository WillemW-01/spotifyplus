# Spotify+

Spotify+ is a mobile application that uses the Spotify API to do some cool
things with a user's music library. See more information below.

![GitHub Created At](https://img.shields.io/github/created-at/willemw-01/spotifyplus)
![GitHub last commit](https://img.shields.io/github/last-commit/willemw-01/spotifyplus)
![GitHub commit activity](https://img.shields.io/github/commit-activity/t/willemw-01/spotifyplus)

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/willemw-01/spotifyplus)
![Lines of code](https://tokei.rs/b1/github/willemw-01/spotifyplus)
[![](https://tokei.rs/b1/github/XAMPPRocky/tokei?category=lines)](https://github.com/willemw-01/tokei).

## Demo

https://github.com/user-attachments/assets/c99918b1-a6c6-4784-a697-8da8cc8db15d

## Installation

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes.

1. To run this project, you'll need to have `Node.js` and `npm` installed on
   your machine. You can download Node.js and npm from the official website:
   https://nodejs.org

2. Clone the repository

```bash
$ git clone git@github.com:WillemW-01/spotifyplus.git
```

3. Install dependencies

```bash
$ cd spotify-plus
$ npm install
```

4. Start the development server (use one of the two).

```bash
$ npx expo start
$ npx expo start --tunnel
```

5. If using Expo Go, open Expo Go and select the running dev server. You are
   ready to use the application.

## Background

The Spotify API can return interesting information about every song in their
catalogue. Examples of this include how acoustic a song sounds, how much energy
it has, the key it is predicted to be in, how much spoken word is in it, etc.

The idea behind this app is to harness this information in some interesting
ways:

1. You will be able to play songs of a certain mood from _your own music_. There
   are playlists available from Spotify for different moods, but it's not all
   your music.
1. You will be able to see your songs in a graph (network) view, where tracks
   will be connected to each other based on certain metrics (e.g. artist, genre,
   etc).

These are the first two features I plan to implement in this project. It will
not play Spotify directly, but rather control Spotify playback on the device.

## Future Ideas:

### 1. **Clustering Songs into Genres or Moods**

- **Communities Detection**: By using algorithms like **Louvain**, **Girvan-Newman**, or **Spectral Clustering**, you can detect clusters or communities of songs that are closely connected. These clusters could represent genres, subgenres, or even mood groupings based on the song features.
  - For example, one cluster might have songs that are high in energy and danceability, representing party music, while another cluster might be characterized by high acousticness and liveness, representing acoustic or live music.
- **Hierarchical Clustering**: Apply hierarchical clustering (like agglomerative clustering) to identify which tracks are close, and progressively merge into larger clusters. You could visualize these as a dendrogram or hierarchical tree of songs, helping users explore similar tracks across levels of similarity.

### 2. **Discovering Transitional or Bridge Songs**

- **Bridge Songs**: Songs that connect two distinct clusters could be seen as "transitional" or "bridge" songs. These might be interesting for playlists where you move from one mood to another. They might also represent songs that have blended styles or genres.
  - For instance, a song that sits between an "acoustic/folk" cluster and a "pop/dance" cluster could represent a crossover song, like a pop track with strong acoustic elements.

### 3. **Song Similarity Rankings**

- **Personalized Recommendations**: Based on a user's current playlist or favorite songs, you can recommend new songs by exploring the graph and identifying the closest neighbors to their preferred tracks.
  - You can also build multi-step recommendations by looking at not just direct neighbors but songs that are connected through second- or third-degree neighbors, suggesting songs that are progressively more distant but still relevant.

### 4. **Exploring Musical Diversity**

- **Diversity Score**: For a playlist or an album, calculate the average distance between songs to determine how "diverse" the collection is. A playlist with a higher average distance between songs would be more musically diverse, while one with lower distances would be more cohesive.
- **Song Connectivity**: Analyze how central or peripheral a song is in the graph. Central songs have a lot of close neighbors and might be broadly appealing or highly typical of a specific genre, while peripheral songs are outliers and may represent niche tracks.

### 5. **Graph-based Playlist Generation**

- **Smooth Transitions in Playlists**: You can use the graph to generate playlists that smoothly transition between different moods or genres. By following edges in the graph from one song to another, you can ensure that each track feels like a natural progression from the last.
  - For example, you could create a playlist that starts with high-energy dance tracks, transitions through medium-energy pop songs, and ends with low-energy acoustic songs, by traversing the graph along edges with similar songs.

### 6. **Novelty Detection**

- **Outlier Detection**: Use graph centrality measures like **betweenness centrality** or **closeness centrality**to identify songs that are outliers. These outliers might be highly novel or experimental tracks that don't fit neatly into any genre or cluster.
  - This could be a feature to highlight unique or experimental tracks in a recommendation engine, suggesting music that's different from what the user typically listens to.

### 7. **Feature Importance and Correlations**

- **Feature Contribution**: By analyzing the differences between clusters or the closest neighbors, you can understand which features (e.g., danceability, acousticness, etc.) are the most influential in grouping or separating songs.

  - For instance, you might find that acousticness and instrumentalness are highly important in distinguishing one group of songs, while energy and valence are more important for another.

- **Correlated Features**: By studying the graph structure, you might also identify correlations between features. For example, clusters with high energy might often have low acousticness, revealing deeper relationships between musical attributes.

### 8. **Central Songs (Hit or Anchor Tracks)**

- **Hit Song Analysis**: Songs that are highly central in the graph (connected to many neighbors) might represent mainstream hits that appeal to a broad audience. These songs are similar to many others and might define a genre or a mood.
- **Anchor Tracks**: These are tracks that could serve as key points in a playlist or a radio station. Songs with high betweenness centrality might be useful as transitional tracks when moving between genres or moods.

### 9. **Influence of Musical Features Over Time**

- If you have access to timestamps or release years for songs, you can analyze how musical features have evolved over time within the graph. This can highlight trends in music, like the rise of more electronic production techniques (energy, loudness) or the increasing popularity of acoustic elements (acousticness).

### 10. **Multidimensional Scaling (MDS)**

- **Visualizing Songs in 2D or 3D Space**: Using dimensionality reduction techniques like **Multidimensional Scaling (MDS)** or **t-SNE**, you can project the graph into a 2D or 3D space. This allows you to create interactive visualizations where users can explore songs based on their relative distances.
  - You could even allow users to "drag and drop" songs into a visual representation of a playlist to explore connections.

---

### Potential Applications:

- **Recommendation Systems**: Use the graph to provide music recommendations by exploring the closest songs in terms of musical features, which can be much more organic and adaptable than purely user-history-based algorithms.
- **Curated Playlists**: Generate playlists based on certain constraints (e.g., energy level), ensuring that there’s a smooth flow and connection between the songs.
- **Music Discovery**: Allow users to explore the graph to discover songs they may not have come across but are musically similar to what they like.
- **Music Analysis Tools**: Create visualizations or tools for artists or listeners to understand how different tracks are related in terms of musical composition or production elements.

## Lyircs prompt:

Analyze the following song lyrics in depth, focusing on themes, literary devices, emotional tone, and potential cultural or historical significance. Consider how the lyrics' structure, word choices, and imagery contribute to the overall message of the song. Please explore any metaphors, symbolism, and poetic techniques used by the songwriter, and discuss how these elements enhance the listener's experience. If relevant, also provide insight into the context in which the song was created (social, political, or personal) and how it may influence interpretation. Break down how each verse builds the narrative or evokes specific emotions, and offer your perspective on the broader meaning or takeaway. Here are the lyrics:
