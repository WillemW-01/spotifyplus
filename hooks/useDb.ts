import { DbAlbum, DbArtist, DbPlaylist, DbTrack } from "@/constants/db/models";
import {
  CustomAlbum,
  CustomArtist,
  CustomPlaylist,
  TrackFeature,
} from "@/interfaces/tracks";
import {
  SQLiteBindParams,
  SQLiteExecuteAsyncResult,
  SQLiteStatement,
  useSQLiteContext,
} from "expo-sqlite";
import { useEffect, useRef } from "react";
import { useLogger } from "./useLogger";
import { useArtist } from "./useArtist";

interface DatabaseOperations {
  name: string;
  clearDb: () => Promise<void>;
  getPlaylists: () => Promise<CustomPlaylist[]>;
  // eslint-disable-next-line no-unused-vars
  getPlaylistSongs: (playlistId: string) => Promise<TrackFeature[]>;
  // eslint-disable-next-line no-unused-vars
  getRelatedArtists: (artistId: string) => Promise<CustomArtist[]>;
  // eslint-disable-next-line no-unused-vars
  getSong: (songId: string) => Promise<TrackFeature>;
  // eslint-disable-next-line no-unused-vars
  insertGenres: (artistId: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  insertNewSong: (song: TrackFeature) => Promise<SQLiteExecuteAsyncResult<unknown>>;
  // eslint-disable-next-line no-unused-vars
  insertNewSongs: (songs: TrackFeature[]) => Promise<SQLiteExecuteAsyncResult<unknown>[]>;
  // eslint-disable-next-line no-unused-vars
  insertRelatedArtists: (artistId: string, relatedArtists: CustomArtist[]) => void;
  statementsReady: () => boolean;
}

const STATEMENT_TEMPLATES = {
  intoArtists: "INSERT OR IGNORE INTO artists (id, name) VALUES ($id, $name)",
  intoGenre: "INSERT OR IGNORE INTO genres (name) VALUES ($genre)",
  intoArtistGenres:
    "INSERT OR IGNORE INTO artist_genres (artist_id, genre_id) VALUES ($artist_id, $genre_id)",
  intoAlbums: "INSERT OR IGNORE  INTO albums (id, name) VALUES ($id, $name);",
  intoTracks:
    "INSERT  OR IGNORE INTO tracks (id, name, popularity, preview_url, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo, type, uri, track_href, analysis_url, duration_ms, time_signature, album_id) VALUES ($id, $name, $popularity, $preview_url, $danceability, $energy, $key, $loudness, $mode, $speechiness, $acousticness, $instrumentalness, $liveness, $valence, $tempo, $type, $uri, $track_href, $analysis_url, $duration_ms, $time_signature, $album_id)",
  intoAlbumArtists:
    "INSERT  OR IGNORE INTO album_artists (album_id, artist_id) VALUES ($album_id, $artist_id)",
  intoTrackArtists:
    "INSERT  OR IGNORE INTO track_artists (track_id, artist_id) VALUES ($track_id, $artist_id)",
  intoRelatedArtists:
    "INSERT OR IGNORE INTO related_artists (artist_id, related_id) VALUES ($artist_id, $related_id)",
  intoPlaylists:
    "INSERT OR REPLACE INTO playlists (id, 'name', snapshot) VALUES ($id, $name, $snapshot)",
  intoPlaylistTracks:
    "INSERT  OR IGNORE INTO playlist_tracks (playlist_id, track_id) VALUES ($playlist_id, $track_id)",
  retrieveSongFeatures: "SELECT * FROM tracks WHERE id = $id",
  retrieveAlbum: "SELECT * FROM albums WHERE id = $id",
  joinAlbumArtists:
    "SELECT artists.id, artists.name FROM album_artists JOIN artists ON album_artists.artist_id = artists.id WHERE album_artists.album_id = $album_id",
  joinArtistsTracks:
    "SELECT artists.id, artists.name FROM track_artists JOIN artists ON track_artists.artist_id = artists.id WHERE track_artists.track_id = $track_id",
  joinPlaylistTracks:
    "SELECT * FROM playlist_tracks JOIN playlists ON playlist_tracks.playlist_id = playlists.id WHERE playlist_tracks.track_id = $track_id",
  retrieveAllSongs: "SELECT id FROM tracks",
  retrieveArtistGenres:
    "SELECT artist_id FROM artist_genres WHERE artist_id = $artist_id",
  retrieveGenresIds: "SELECT id FROM genres WHERE name = $genre",
  retrievePlaylists: "SELECT * FROM playlists",
  retrievePlaylistSongs:
    "SELECT playlist_tracks.track_id as id FROM playlist_tracks JOIN playlists ON playlist_tracks.playlist_id = playlists.id WHERE playlists.id = $playlist_id",
  retrieveRelatedArtists:
    "SELECT a.* FROM related_artists rel JOIN artists a ON rel.related_id = a.id WHERE rel.artist_id = $artist_id",
  clearArtists: "DELETE FROM artists",
  clearAlbums: "DELETE FROM albums",
  clearTracks: "DELETE FROM tracks",
  clearAlbumArtists: "DELETE FROM album_artists",
  clearTrackArtists: "DELETE FROM track_artists",
  clearPlaylists: "DELETE FROM playlists",
  clearPlaylistTracks: "DELETE FROM playlist_tracks",
} as const;

export function useDb(): DatabaseOperations {
  const db = useSQLiteContext();
  const { addLog } = useLogger();
  const { getArtistGenres } = useArtist();

  const name = db.databaseName;

  /*****************************************************************************
   *                          STATEMENT MANAGEMENT                             *
   *****************************************************************************/

  const statements = useRef<{ [key: string]: SQLiteStatement }>({
    intoArtists: null,
    intoAlbums: null,
    intoTracks: null,
    intoAlbumArtists: null,
    intoTrackArtists: null,
    intoPlaylists: null,
    intoPlaylistTracks: null,
  });

  async function prepareStatements() {
    let successFull = 0;
    const statementKeys = Object.keys(STATEMENT_TEMPLATES);
    for (const key of statementKeys) {
      try {
        statements.current[key] = await db.prepareAsync(STATEMENT_TEMPLATES[key]);
        successFull += 1;
      } catch (error) {
        console.log(`Error while preparing ${key}: `, error);
      }
    }
    addLog(
      `Prepared ${successFull} / ${statementKeys.length} statements`,
      "prepareStatement"
    );
  }

  function statementsReady() {
    const statementKeys = Object.keys(STATEMENT_TEMPLATES); // Get all keys of STATEMENT_TEMPLATES
    for (const key of statementKeys) {
      if (!statements.current[key]) {
        console.log(`Statement not ready: ${key}`);
        return false;
      }
    }
    return true;
  }

  async function resultOf(statement: SQLiteStatement, params?: SQLiteBindParams) {
    try {
      return (await statement.executeAsync(params)).getAllAsync();
    } catch (error) {
      console.error(
        `Error getting result of ${JSON.stringify(
          statement
        )} with params ${JSON.stringify(params)}: `,
        error
      );
    }
  }

  /*****************************************************************************
   *                          INSERT OPERATIONS                                *
   *****************************************************************************/

  async function insertNewSongs(songs: TrackFeature[]) {
    const allResults = [] as SQLiteExecuteAsyncResult<unknown>[];
    for (const song of songs) {
      allResults.push(await insertNewSong(song));
    }
    return allResults;
  }

  async function insertNewSong(song: TrackFeature) {
    if (statementsReady()) {
      console.log(`[dbInsert] Inserting ${song.name} (${song.id})`);
      await insertArtists(song.artists);
      await insertAlbum(song.album);
      await insertPlaylist(song.playlist);
      await insertPlaylistTrack(song.playlist.id, song.id);
      for (const artist of song.artists) {
        await insertTrackArtist(song.id, artist.id);
      }
      const res = await insertTrackFeatures(song);
      return res;
    } else {
      console.error(`Statements not ready yet`);
    }
  }

  async function insertArtists(artists: CustomArtist[]) {
    for (const artist of artists) {
      const existingArtist = await db.getAllAsync(`SELECT * FROM artists WHERE id = ?`, [
        artist.id,
      ]);

      if (existingArtist.length === 0) {
        try {
          await statements.current.intoArtists.executeAsync({
            $id: artist.id,
            $name: artist.name,
          });

          console.log(`[dbInsert]\tInserted ${artist.name} (${artist.id})`);
          await insertGenres(artist.id);
          console.log(`[dbInsert]\tInserted genres of ${artist.name} (${artist.id})`);
        } catch (error) {
          console.error(`Error inserting ${artist.name} (${artist.id}):`, error);
        }
      } else {
        console.warn(`[dbInsert]\t${artist.name} (${artist.id}) already exists`);
      }
    }
  }

  async function insertGenres(artistId: string) {
    try {
      const doesExist =
        (
          await resultOf(statements.current.retrieveArtistGenres, {
            $artist_id: artistId,
          })
        ).length > 0;
      if (!doesExist) {
        const genres = await getArtistGenres(artistId, 0);
        console.log(`\tgenres: ${JSON.stringify(genres)}`);

        for (const genre of genres) {
          await statements.current.intoGenre.executeAsync({ $genre: genre });
          // console.log(`[dbInsert]\tInserted ${genre} into genre table`);
          const genreId = await getGenreId(genre);
          await statements.current.intoArtistGenres.executeAsync({
            $artist_id: artistId,
            $genre_id: genreId.id,
          });
        }
      } else {
        console.warn(`[dbInsert]\tArtists already have genres assigned`);
      }
    } catch (error) {
      console.error(`Error when trying to add genres:`, error);
    }
  }

  async function insertAlbum(album: CustomAlbum) {
    // Check if album exists first
    const existingAlbums = await db.getAllAsync(`SELECT * FROM albums WHERE id = ?`, [
      album.id,
    ]);
    if (existingAlbums.length === 0) {
      try {
        await statements.current.intoAlbums.executeAsync({
          $id: album.id,
          $name: album.name,
        });
        console.log(`[dbInsert]\tInserted album ${album.name} (${album.id})`);
      } catch (error) {
        console.error(`Error inserting album ${album.name} (${album.id}):`, error);
      }
    } else {
      console.warn(`[dbInsert]\t${album.name} (${album.id}) already exists`);
    }

    await insertArtists(album.artists);

    for (const artist of album.artists) {
      await insertAlbumArtist(album.id, artist.id);
    }
  }

  async function insertAlbumArtist(albumId: string, artistId: string) {
    // First, check if this relationship already exists in the album_artists table
    const existingAlbumArtist = await db.getAllAsync(
      `SELECT * FROM album_artists WHERE album_id = ? AND artist_id = ?`,
      [albumId, artistId]
    );

    if (existingAlbumArtist.length === 0) {
      // If it doesn't exist, we can insert it
      try {
        await statements.current.intoAlbumArtists.executeAsync({
          $album_id: albumId,
          $artist_id: artistId,
        });
        console.log(`[dbInsert]\tInserted album ${albumId} <=> ${artistId}`);
      } catch (error) {
        console.error(`Error inserting album ${albumId} <=> ${artistId}:`, error);
      }
    } else {
      console.warn(`[dbInsert]\t${albumId} <=> ${albumId} already exists`);
    }
  }

  async function insertTrackArtist(songId: string, artistId: string) {
    await statements.current.intoTrackArtists.executeAsync(songId, artistId);
  }

  async function insertPlaylist(playlist: CustomPlaylist) {
    await statements.current.intoPlaylists.executeAsync(
      playlist.id,
      playlist.name,
      playlist.snapshot
    );
  }

  async function insertPlaylistTrack(playlistId, trackId) {
    await statements.current.intoPlaylistTracks.executeAsync(playlistId, trackId);
  }

  async function insertTrackFeatures(song: TrackFeature) {
    return await statements.current.intoTracks.executeAsync({
      $id: song.id,
      $name: song.name,
      $popularity: song.popularity,
      $preview_url: song.preview_url,
      $danceability: song.danceability,
      $energy: song.energy,
      $key: song.key,
      $loudness: song.loudness,
      $mode: song.mode,
      $speechiness: song.speechiness,
      $acousticness: song.acousticness,
      $instrumentalness: song.instrumentalness,
      $liveness: song.liveness,
      $valence: song.valence,
      $tempo: song.tempo,
      $type: song.type,
      $uri: song.uri,
      $track_href: song.track_href,
      $analysis_url: song.analysis_url,
      $duration_ms: song.duration_ms,
      $time_signature: song.time_signature,
      $album_id: song.album.id,
    });
  }

  async function insertRelatedArtists(artistId: string, relatedArtists: CustomArtist[]) {
    for (const relatedArtist of relatedArtists) {
      try {
        await statements.current.intoRelatedArtists.executeAsync({
          $artist_id: artistId,
          $related_id: relatedArtist.id,
        });
        console.log(
          `[dbInsert]\tInserted related ${relatedArtist.name} (${relatedArtist.id})`
        );
      } catch (error) {
        console.error(
          `Error inserting related ${relatedArtist.name} (${relatedArtist.id}):`,
          error
        );
      }
    }
  }

  /*****************************************************************************
   *                            GET STATEMENTS                                 *
   *****************************************************************************/

  async function getSong(songId: string) {
    try {
      if (!songId) {
        addLog(`Requested song with no id (id = null)`, `getSong`);
        return;
      }
      console.log(`Fetching song with id ${songId}`);
      const tracks = (await resultOf(statements.current.retrieveSongFeatures, {
        $id: songId,
      })) as DbTrack[];
      const track = tracks[0];

      const albums = (await resultOf(statements.current.retrieveAlbum, {
        $id: track.album_id,
      })) as DbAlbum[];
      const album = albums[0];

      const albumArtists = (await resultOf(statements.current.joinAlbumArtists, {
        $album_id: album.id,
      })) as DbArtist[];

      const trackArtists = (await resultOf(statements.current.joinArtistsTracks, {
        $track_id: track.id,
      })) as DbArtist[];

      const playlists = (await resultOf(statements.current.joinPlaylistTracks, {
        $track_id: track.id,
      })) as DbPlaylist[];

      const result: TrackFeature = {
        index: 0, // You can adjust this as needed
        name: track.name,
        album: {
          id: album.id,
          name: album.name,
          artists: albumArtists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            genres: artist.genres,
          })),
        },
        artists: trackArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
        })),
        popularity: track.popularity,
        preview_url: track.preview_url,
        danceability: track.danceability,
        energy: track.energy,
        key: track.key,
        loudness: track.loudness,
        mode: track.mode,
        speechiness: track.speechiness,
        acousticness: track.acousticness,
        instrumentalness: track.instrumentalness,
        liveness: track.liveness,
        valence: track.valence,
        tempo: track.tempo,
        type: track.type,
        id: track.id,
        uri: track.uri,
        track_href: track.track_href,
        analysis_url: track.analysis_url,
        duration_ms: track.duration_ms,
        time_signature: track.time_signature,
        playlist: {
          id: playlists[0].id,
          name: playlists[0].name,
          snapshot: playlists[0].snapshot,
        },
      };

      return result;
    } catch (error) {
      console.log(`Error at getSong: ${error}`);
    }
  }

  async function getPlaylistSongs(playlistId: string) {
    const ids = (await resultOf(statements.current.retrievePlaylistSongs, {
      $playlist_id: playlistId,
    })) as { id: string }[];
    return getSongs(ids.map((i) => i.id));
  }

  async function getSongs(ids: string[]) {
    const allSongs = [] as TrackFeature[];
    for (const id of ids) {
      const song = await getSong(id);
      allSongs.push(song);
    }
    return allSongs;
  }

  async function getPlaylists() {
    const playlists = (await resultOf(
      statements.current.retrievePlaylists
    )) as CustomPlaylist[];
    return playlists;
  }

  async function getRelatedArtists(artistId: string) {
    const relatedArtists = (await resultOf(statements.current.retrieveRelatedArtists, {
      $artist_id: artistId,
    })) as CustomArtist[];
    return relatedArtists;
  }

  async function getGenreId(genre: string) {
    return (
      await resultOf(statements.current.retrieveGenresIds, {
        $genre: genre,
      })
    )[0] as { id: string };
  }

  /*****************************************************************************
   *                          DELETE STATEMENTS                                *
   *****************************************************************************/

  async function clearDb() {
    const tables = (await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    )) as { name: string }[];
    for (const table of tables) {
      addLog(`Clearing ${table.name} table...`, `clearDb`);
      await db.execAsync(`DELETE FROM ${table.name}`);
    }
  }

  useEffect(() => {
    prepareStatements();
  }, []);

  /*****************************************************************************
   *                      RETURN OPERATION FUNCTIONS                           *
   *****************************************************************************/

  return {
    clearDb,
    getPlaylists,
    getPlaylistSongs,
    getRelatedArtists,
    getSong,
    insertGenres,
    insertNewSong,
    insertNewSongs,
    insertRelatedArtists,
    name,
    statementsReady,
  };
}
