import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 35 }}>Home</Text>
      <TouchableOpacity
        style={{ width: 120, height: 80, backgroundColor: "red" }}
      >
        <Text>PlayLists</Text>
      </TouchableOpacity>
    </View>
  );
}
