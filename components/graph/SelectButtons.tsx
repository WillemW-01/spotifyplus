import { SimplifiedPlayList } from "@/interfaces/playlists";
import { TopArtist } from "@/interfaces/topItems";
import { StyleSheet, View } from "react-native";
import Button from "./Button";
import React = require("react");

interface SelectButtonProps {
  foundation: "artist" | "playlist";
  playlists: SimplifiedPlayList[];
  artists: TopArtist[];
  selectedPlaylists: SimplifiedPlayList[];
  selectedArtists: TopArtist[];
  setSelectedPlaylists: React.Dispatch<React.SetStateAction<SimplifiedPlayList[]>>;
  setSelectedArtists: React.Dispatch<React.SetStateAction<TopArtist[]>>;
}

export function SelectButtons({
  foundation,
  playlists,
  artists,
  selectedPlaylists,
  selectedArtists,
  setSelectedPlaylists,
  setSelectedArtists,
}: SelectButtonProps) {
  const isSelected =
    foundation == "artist"
      ? selectedArtists.length != artists.length
      : selectedPlaylists.length != playlists.length;

  const setFunction: React.Dispatch<
    React.SetStateAction<SimplifiedPlayList[] | TopArtist[]>
  > = foundation == "artist" ? setSelectedArtists : setSelectedPlaylists;

  const setItem = foundation == "artist" ? artists : playlists;

  const compareItem = foundation == "artist" ? selectedArtists : selectedPlaylists;

  return (
    <View style={styles.selectButtonContainer}>
      <Button
        title="Select all"
        selected={isSelected}
        onPress={() => setFunction(setItem)}
      />
      <Button
        title="Clear"
        selected={compareItem.length > 0}
        onPress={() => setFunction([])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    gap: 20,
  },
});
