CREATE TABLE artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE albums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE tracks (
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

CREATE TABLE album_artists (
    album_id TEXT,
    artist_id TEXT,
    PRIMARY KEY (album_id, artist_id),
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE track_artists (
    track_id TEXT,
    artist_id TEXT,
    PRIMARY KEY (track_id, artist_id),
    FOREIGN KEY (track_id) REFERENCES tracks(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE playlist_tracks (
    playlist_id TEXT,
    track_id TEXT,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);
