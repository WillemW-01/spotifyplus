/**
 *
export interface TrackFeatureResponse {
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: string;
  uri: string;
  valence: number;
}

export interface TrackFeature extends TrackFeatureResponse {
  index: number;
  album: CustomAlbum;
  artists: CustomArtist[];
  name: string;
  popularity: number;
  preview_url: string;
  playlist: string;
}
*/

import { SQLiteDatabase, SQLiteStatement, useSQLiteContext } from "expo-sqlite";
import { MutableRefObject, useEffect, useRef } from "react";

interface DatabaseOperations {
  name: string;
  statement1: MutableRefObject<SQLiteStatement>;
  statement2: MutableRefObject<SQLiteStatement>;
}

export function useDb(): DatabaseOperations {
  const db = useSQLiteContext();

  const statement1 = useRef<SQLiteStatement>(null);
  const statement2 = useRef<SQLiteStatement>(null);

  const name = db.databaseName;

  async function prepareStatements() {
    const temp = await db.prepareAsync(
      "INSERT INTO users (name, email) VALUES ($name, $email)"
    );
    statement1.current = temp;

    const temp2 = await db.prepareAsync("SELECT * FROM users");
    statement2.current = temp2;
  }

  useEffect(() => {
    prepareStatements();

    // return () => {
    //   statement1.current.finalizeAsync();
    //   statement2.current.finalizeAsync();
    // };
  }, []);

  return {
    name,
    statement1,
    statement2,
  };
}
