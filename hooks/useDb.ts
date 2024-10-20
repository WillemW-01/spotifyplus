import { DbAlbum, DbPlaylist, DbTrack } from "@/constants/db/models";
import {
  TrackFeature,
  CustomArtist,
  CustomAlbum,
  CustomPlaylist,
} from "@/interfaces/tracks";
import {
  SQLiteBindParams,
  SQLiteExecuteAsyncResult,
  SQLiteStatement,
  useSQLiteContext,
} from "expo-sqlite";
import { useEffect, useRef } from "react";
import { useLogger } from "./useLogger";

interface DatabaseOperations {
  name: string;
  insertNewSong: (song: TrackFeature) => Promise<SQLiteExecuteAsyncResult<unknown>>;
  statementsReady: () => boolean;
  getSong(songId: string): Promise<TrackFeature>;
  getAllSongs(): Promise<TrackFeature[]>;
  insertNewSongs(songs: TrackFeature[]): Promise<SQLiteExecuteAsyncResult<unknown>[]>;
  clearDb(): Promise<void>;
}

// Define your original STATEMENT_TEMPLATES
const STATEMENT_TEMPLATES = {
  intoArtists: "INSERT OR IGNORE INTO artists (id, name) VALUES ($id, $name)",
  intoAlbums: "INSERT OR IGNORE  INTO albums (id, name) VALUES ($id, $name);",
  intoTracks:
    "INSERT  OR IGNORE INTO tracks (id, name, popularity, preview_url, danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo, type, uri, track_href, analysis_url, duration_ms, time_signature, album_id) VALUES ($id, $name, $popularity, $preview_url, $danceability, $energy, $key, $loudness, $mode, $speechiness, $acousticness, $instrumentalness, $liveness, $valence, $tempo, $type, $uri, $track_href, $analysis_url, $duration_ms, $time_signature, $album_id)",
  intoAlbumArtists:
    "INSERT  OR IGNORE INTO album_artists (album_id, artist_id) VALUES ($album_id, $artist_id)",
  intoTrackArtists:
    "INSERT  OR IGNORE INTO track_artists (track_id, artist_id) VALUES ($track_id, $artist_id)",
  intoPlaylists:
    "INSERT OR IGNORE INTO playlists (id, 'name', snapshot) VALUES ($id, $name, $snapshot)",
  intoPlaylistTracks:
    "INSERT  OR IGNORE INTO playlist_tracks (playlist_id, track_id) VALUES ($playlist_id, $track_id)",
  retrieveSongFeatures: "SELECT * FROM tracks WHERE id = $id",
  retrieveAlbum: "SELECT * FROM albums WHERE id = $id",
  retrieveAlbumArtists:
    "SELECT artists.id, artists.name FROM album_artists JOIN artists ON album_artists.artist_id = artists.id WHERE album_artists.album_id = $album_id",
  retrieveArtists:
    "SELECT artists.id, artists.name FROM track_artists JOIN artists ON track_artists.artist_id = artists.id WHERE track_artists.track_id = $track_id",
  retrievePlaylists:
    "SELECT * FROM playlist_tracks JOIN playlists ON playlist_tracks.playlist_id = playlists.id WHERE playlist_tracks.track_id = $track_id",
  retrieveAllSongs: "SELECT id FROM tracks",
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

  const statements = useRef<{ [key: string]: SQLiteStatement }>({
    intoArtists: null,
    intoAlbums: null,
    intoTracks: null,
    intoAlbumArtists: null,
    intoTrackArtists: null,
    intoPlaylists: null,
    intoPlaylistTracks: null,
  });

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

  const name = db.databaseName;

  async function insertNewSongs(songs: TrackFeature[]) {
    const allResults = [] as SQLiteExecuteAsyncResult<unknown>[];
    for (const song of songs) {
      allResults.push(await insertNewSong(song));
    }
    return allResults;
  }

  async function insertNewSong(song: TrackFeature) {
    console.log(`[dbInsert] Inserting ${song.name} (${song.id})`);
    await insertArtists(song.artists);
    await insertAlbum(song.album);
    await insertPlaylist(song.playlist);
    await insertPlaylistTrack(song.playlist.id, song.id);
    for (const artist of song.artists) {
      await insertTrackArtist(song.id, artist.id);
    }
    const res = await insertTrackFeatures(song);
    console.log(res);
    return res;
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
        } catch (error) {
          console.error(`Error inserting ${artist.name} (${artist.id}):`, error);
        }
      } else {
        console.log(`[dbInsert]\t${artist.name} (${artist.id}) already exists`);
      }
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
      console.log(`[dbInsert]\t${album.name} (${album.id}) already exists`);
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
      console.log(`[dbInsert]\t${albumId} <=> ${albumId} already exists`);
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

  async function getSong(songId: string) {
    try {
      console.log(`Fetching song with id ${songId}`);
      const tracks = (await resultOf(statements.current.retrieveSongFeatures, {
        $id: songId,
      })) as DbTrack[];
      const track = tracks[0];

      const albums = (await resultOf(statements.current.retrieveAlbum, {
        $id: track.album_id,
      })) as DbAlbum[];
      const album = albums[0];

      const albumArtists = (await resultOf(statements.current.retrieveAlbumArtists, {
        $album_id: album.id,
      })) as CustomArtist[];

      const trackArtists = (await resultOf(statements.current.retrieveArtists, {
        $track_id: track.id,
      })) as CustomArtist[];

      const playlists = (await resultOf(statements.current.retrievePlaylists, {
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
          })),
        },
        artists: trackArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
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

  async function getAllSongs() {
    const allSongs = [] as TrackFeature[];
    const allIds = (await resultOf(statements.current.retrieveAllSongs)) as {
      id: string;
    }[];
    console.log(`Ids: ${JSON.stringify(allIds)}`);
    for (const id of allIds) {
      const song = await getSong(id.id);
      allSongs.push(song);
    }
    return allSongs;
  }

  async function clearDb() {
    const tables = (await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table';"
    )) as { name: string }[];
    for (const table of tables) {
      addLog(`Clearing ${table.name} table...`, `clearDb`);
      await db.execAsync(`DELETE FROM ${table.name}`);
    }
  }

  async function resultOf(statement: SQLiteStatement, params?: SQLiteBindParams) {
    return (await statement.executeAsync(params)).getAllAsync();
  }

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

  useEffect(() => {
    prepareStatements();
  }, []);

  return {
    name,
    insertNewSongs,
    insertNewSong,
    statementsReady,
    getSong,
    getAllSongs,
    clearDb,
  };
}
