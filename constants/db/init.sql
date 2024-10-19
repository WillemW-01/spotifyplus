CREATE TABLE albums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    height INTEGER,
    width INTEGER,
    artist_id INTEGER,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- many-to-many relationship between albums and artists
CREATE TABLE album_artists (
    album_id TEXT,
    artist_id INTEGER,
    PRIMARY KEY (album_id, artist_id),
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- many-to-many relationship between artists and genres
CREATE TABLE artist_genres (
    artist_id INTEGER,
    genre_id INTEGER,
    PRIMARY KEY (artist_id, genre_id),
    FOREIGN KEY (artist_id) REFERENCES artists(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
);

CREATE TABLE track_features (
    id TEXT PRIMARY KEY,
    index INTEGER,
    name TEXT NOT NULL,
    popularity INTEGER,
    preview_url TEXT,
    playlist TEXT,

    acousticness REAL,
    analysis_url TEXT,
    danceability REAL,
    duration_ms INTEGER,
    energy REAL,
    instrumentalness REAL,
    key INTEGER,
    liveness REAL,
    loudness REAL,
    mode INTEGER,
    speechiness REAL,
    tempo REAL,
    time_signature INTEGER,
    track_href TEXT,
    type TEXT,
    uri TEXT,
    valence REAL,
    
    album_id TEXT,
    FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- Create track_artists table (for many-to-many relationship between tracks and artists)
CREATE TABLE track_artists (
    track_id TEXT,
    artist_id INTEGER,
    PRIMARY KEY (track_id, artist_id),
    FOREIGN KEY (track_id) REFERENCES track_features(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);