import fs from "fs";

import { PlayListResponse, SimplifiedPlayList } from "@/interfaces/playlists";
console.log("Came to here");

interface PlayListList {
  offset: number;
  items: {
    name: string;
    href: string;
    total: number;
  }[];
}

const write = (playListData: PlayListList) => {
  fs.appendFileSync("playlists.json", `${JSON.stringify(playListData)},\n`);
};

const getPlayList = async (offset: number) => {
  const url = `https://api.spotify.com/v1/users/thesoundsofspotify/playlists?limit=100`;
  const response = await fetch(url + `&offset=${offset}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_OLD_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.log("Didn't get results for offset: ", offset);
    const error = await response.json();
    console.log(error);
  }

  const data: PlayListResponse = await response.json();
  const items: SimplifiedPlayList[] = data.items;
  const formattedItems = items.map((item) => {
    return {
      name: item.name,
      href: item.tracks.href,
      total: item.tracks.total,
    };
  });
  // console.log(formattedItems);
  return {
    offset: offset,
    items: formattedItems,
  };
};

const getPlayLists = async () => {
  const start = 1200;
  const end = 7080;

  for (let i = start; i < end; i += 100) {
    console.log(`Getting playlist with offset: ${i}`);
    const playList = await getPlayList(i);
    write(playList);
    // console.log(playList);
  }
};

getPlayLists();
