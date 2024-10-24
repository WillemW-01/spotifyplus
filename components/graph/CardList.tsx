import React from "react";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import SelectableCard from "@/components/graph/SelectableCard";
import GridBox from "@/components/GridBox";
import { TopArtist } from "@/interfaces/topItems";
import { ConnectionCategory } from "@/constants/graphConnections";
import { LocalState } from "@/app/(tabs)/mood";

interface Props {
  foundation: ConnectionCategory;
  playlists?: SimplifiedPlayList[];
  artists?: TopArtist[];
  selectedPlaylists: SimplifiedPlayList[];
  selectedArtists: TopArtist[];

  // eslint-disable-next-line no-unused-vars
  addArtist: (a: TopArtist) => void;
  // eslint-disable-next-line no-unused-vars
  addPlaylist: (p: SimplifiedPlayList) => void;
  isSynced?: LocalState[];
  searchTerm?: string;
}

const isInText = (text: string, query: string) =>
  text.toLowerCase().includes(query.toLowerCase());

const isArtist = (item: TopArtist | SimplifiedPlayList): item is TopArtist => {
  return (item as TopArtist).followers !== undefined;
};

const renderList = (
  list: TopArtist[] | SimplifiedPlayList[],
  selectedListIds: string[],
  // eslint-disable-next-line no-unused-vars
  onPress: (arg: TopArtist | SimplifiedPlayList) => void,
  isSynced?: LocalState[],
  searchTerm?: string
) => {
  const toUse =
    list && searchTerm ? list.filter((l) => isInText(l.name, searchTerm)) : list;
  return toUse.map((item, i) => {
    return (
      <SelectableCard
        key={i}
        selected={selectedListIds.includes(item.id)}
        title={item.name}
        imageUri={item.images[0].url}
        onPress={() => onPress(item)}
        synced={isSynced[i]}
        type={isArtist(list[0]) ? "artist" : "playlist"}
      />
    );
  });
};

export default function CardGrid({
  foundation,
  playlists,
  artists,
  selectedPlaylists,
  selectedArtists,
  addArtist,
  addPlaylist,
  isSynced,
  searchTerm,
}: Props) {
  const renderFoundation = () => {
    switch (foundation) {
      case "playlist":
        return renderList(
          playlists,
          selectedPlaylists.map((p) => p.id),
          addPlaylist,
          isSynced,
          searchTerm
        );
      case "artist":
        return renderList(
          artists,
          selectedArtists.map((a) => a.id),
          addArtist,
          isSynced,
          searchTerm
        );
    }
  };

  return (
    <GridBox cols={4} gap={10} rowGap={10}>
      {renderFoundation()}
    </GridBox>
  );
}
