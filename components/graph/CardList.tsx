import React from "react";
import { SimplifiedPlayList } from "@/interfaces/playlists";
import SelectableCard from "@/components/graph/SelectableCard";
import GridBox from "@/components/GridBox";
import { TopArtist } from "@/interfaces/topItems";
import { ConnectionCategory } from "@/constants/graphConnections";

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
  searchTerm?: string;
}

const isInText = (text: string, query: string) =>
  text.toLowerCase().includes(query.toLowerCase());

const renderList = (
  list: TopArtist[] | SimplifiedPlayList[],
  selectedListIds: string[],
  onPress: (arg: TopArtist | SimplifiedPlayList) => void,
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
  searchTerm,
}: Props) {
  console.log(`Search term: ${searchTerm}`);

  const renderFoundation = () => {
    switch (foundation) {
      case "playlist":
        return renderList(
          playlists,
          selectedPlaylists.map((p) => p.id),
          addPlaylist,
          searchTerm
        );
      case "artist":
        return renderList(
          artists,
          selectedArtists.map((a) => a.id),
          addArtist,
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
