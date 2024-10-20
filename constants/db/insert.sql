INSERT INTO artists (id, name) VALUES ('7z2avKuuiMAT4XZJFv8Rvh', 'Tom Walker');

INSERT INTO albums (id, name) VALUES ('0zyfjcblb35vFRjZ3KKXMR', 'Fly Away With Me');

INSERT INTO tracks ( id, name, popularity, preview_url, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness liveness, valence, tempo, type, uri, track_href, analysis_url, duration_ms, time_signature, album_id ) VALUES (
    '05u81UgU27g8uL5twJ7ABz',
    'Fly Away With Me',
    44,
    'https://p.scdn.co/mp3-preview/c949637fd7daab492d5e5106ca224abc184ae69b?cid=c5ef878ae61046f0a713956f9dbd9377',
    0.421,
    0.499,
    5,
    -8.869,
    1,
    0.173,
    0.61,
    0,
    0.0875,
    0.297,
    78.621,
    'audio_features',
    'spotify:track:05u81UgU27g8uL5twJ7ABz',
    'https://api.spotify.com/v1/tracks/05u81UgU27g8uL5twJ7ABz',
    'https://api.spotify.com/v1/audio-analysis/05u81UgU27g8uL5twJ7ABz',
    211733,
    4,
    '0zyfjcblb35vFRjZ3KKXMR'
);

INSERT INTO album_artists (album_id, artist_id) VALUES ('0zyfjcblb35vFRjZ3KKXMR', '7z2avKuuiMAT4XZJFv8Rvh');

INSERT INTO track_artists (track_id, artist_id) VALUES ('05u81UgU27g8uL5twJ7ABz', '7z2avKuuiMAT4XZJFv8Rvh');

INSERT INTO playlists (id, 'name') VALUES ('5VijMFqhgsYh3k0ewtdzVH', 'main_jam');

INSERT INTO playlist_tracks (playlist_id, track_id) VALUES ('5VijMFqhgsYh3k0ewtdzVH', '05u81UgU27g8uL5twJ7AB');

