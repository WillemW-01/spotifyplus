import data from "./tracks.json";
import data_playlist from "./playlist.json";

interface Track {
  "Track Year": number;
  "Track Play Count": number;
  "Track Identifier": number;
  "Track Duration": number;
  Title: string;
  "Skip Count": number;
  "Last Modified Date": string;
  "Is Purchased": boolean;
  "Is Checked": boolean;
  "Date Added To iCloud Music Library": string;
  "Date Added To Library": string;
  "Content Type": "song";
  "Audio File Extension": "m4a" | "mp3";
  "Track Number On Album"?: number;
  "Track Count On Album"?: number;
  "Is Part of Compilation"?: boolean;
  "Disc Number Of Album"?: number;
  "Disc Count Of Album"?: number;
  Artist?: string;
  "Album Artist"?: string;
  Album?: string;
  Genre?: string;
  "Apple Music Track Identifier"?: number;
  "Sort Album"?: string;
  "Sort Name"?: string;
  "Sort Artist"?: string;
  "Release Date"?: string;
  "Purchased Track Identifier"?: number;
  Copyright?: string;
  Composer?: string;
  "Last Played Date"?: string;
  "Playlist Only Track"?: boolean;
  "Remember Playback Position"?: boolean;
  Rating?: number;
  "Album Rating"?: number;
  "Date of Last Skip"?: string;
  "Tag Matched Track Identifier"?: number;
  Comments?: string;
  "Work Name"?: string;
  "Movement Name"?: string;
  "Display Work Name"?: string;
  "Track Like Rating"?: "none" | "liked";
  "Favorite Status - Track"?: boolean;
  "Favorite Status - Album"?: boolean;
  "Favorite Date - Track"?: string;
  "Album Like Rating"?: "none" | "liked";
}

interface Playlist {
  "Container Type": string;
  "Container Identifier": number;
  Title: string;
  "Playlist Item Identifiers"?: number[];
  "Favorite Status - Playlist": boolean;
  "Favorite Date - Playlist": string;
  "Added Date": string;
  "Name or Description Modified Date": string;
  "Playlist Items Modified Date": string;
}

const tracks = data as Track[];
const playlists = data_playlist as Playlist[];
const keys = [
  "Track Year",
  "Track Play Count",
  "Track Identifier",
  "Track Duration",
  "Title",
  "Skip Count",
  "Last Modified Date",
  "Is Purchased",
  "Is Checked",
  "Date Added To iCloud Music Library",
  "Date Added To Library",
  "Content Type",
  "Audio File Extension",
  "Track Number On Album",
  "Track Count On Album",
  "Is Part of Compilation",
  "Disc Number Of Album",
  "Disc Count Of Album",
  "Artist",
  "Album Artist",
  "Album",
  "Genre",
  "Apple Music Track Identifier",
  "Sort Album",
  "Sort Name",
  "Sort Artist",
  "Release Date",
  "Purchased Track Identifier",
  "Copyright",
  "Composer",
  "Last Played Date",
  "Playlist Only Track",
  "Remember Playback Position",
  "Rating",
  "Album Rating",
  "Date of Last Skip",
  "Tag Matched Track Identifier",
  "Comments",
  "Work Name",
  "Movement Name",
  "Display Work Name",
  "Track Like Rating",
  "Favorite Status - Track",
  "Favorite Status - Album",
  "Favorite Date - Track",
  "Album Like Rating",
] as (keyof Track)[];

const diff = [
  182872850, 182873138, 182873874, 182878750, 182878986, 182880266, 182888710, 182888726,
  182893854,
];

for (const t of tracks) {
  if (diff.includes(t["Track Identifier"])) {
    console.log(`${t["Title"]}`);
  }
}

// for (const p of playlists) {
//   if (p["Playlist Item Identifiers"]) {
//     for (const i of p["Playlist Item Identifiers"]) {
//       console.log(i);
//     }
//   }
// }
