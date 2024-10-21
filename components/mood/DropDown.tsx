import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Button from "@/components/Button";

export default function DropDown() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // This state can be used to track the selected option

  // Function to toggle dropdown
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Function to handle option selection and close the dropdown
  const handleOptionPress = (option) => {
    setSelectedOption(option);
    setDropdownVisible(false); // Close dropdown
    console.log(`Option ${option} selected`); // Log or handle state change
  };

  return (
    <View style={styles.container}>
      {/* Main button */}
      <Button title="" onPress={toggleDropdown} width={50} />

      {/* Dropdown options */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <Button title="Option 1" onPress={() => handleOptionPress(1)} />
          <Button title="Option 2" onPress={() => handleOptionPress(2)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: 50,
    marginTop: 10,
    width: "80%",
    backgroundColor: "white",
    padding: 10,
    elevation: 5, // Adds a shadow effect on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});
