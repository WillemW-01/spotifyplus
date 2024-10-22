CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS albums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    popularity INTEGER,
    preview_url TEXT,
    danceability REAL,
    energy REAL,
    key INTEGER,
    loudness REAL,
    mode INTEGER,
    speechiness REAL,
    acousticness REAL,
    instrumentalness REAL,
    liveness REAL,
    valence REAL,
    tempo REAL,
    type TEXT,
    uri TEXT,
    track_href TEXT,
    analysis_url TEXT,
    duration_ms INTEGER,
    time_signature INTEGER,
    album_id TEXT,
    FOREIGN KEY (album_id) REFERENCES albums(id)
);

CREATE TABLE IF NOT EXISTS album_artists (
    album_id TEXT,
    artist_id TEXT,
    PRIMARY KEY (album_id, artist_id),
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE IF NOT EXISTS track_artists (
    track_id TEXT,
    artist_id TEXT,
    PRIMARY KEY (track_id, artist_id),
    FOREIGN KEY (track_id) REFERENCES tracks(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    snapshot TEXT
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id TEXT,
    track_id TEXT,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

CREATE TABLE IF NOT EXISTS related_artists (
    artist_id TEXT NOT NULL,
    related_id TEXT NOT NULL,
    PRIMARY KEY (artist_id, related_id),
    FOREIGN KEY (artist_id) REFERENCES artists(id),
    FOREIGN KEY (related_id) REFERENCES artists(id)
);

CREATE TABLE IF NOT EXISTS genres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE artist_genres (
  artist_id TEXT,
  genre_id INTEGER,
  PRIMARY KEY (artist_id, genre_id),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
)
