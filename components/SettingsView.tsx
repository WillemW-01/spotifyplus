import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ModalBaseProps } from "react-native";

interface ModalProps extends ModalBaseProps {
  visible: boolean;
}

export default function SettingsView({ visible }: ModalProps) {
  const [force, setForce] = useState("force");

  return (
    visible && (
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Graph Settings</Text>
        <View style={{}}>
          <Text>Graph force method:</Text>
          <Picker
            selectedValue={force}
            onValueChange={(itemValue) => setForce(itemValue)}
            style={{ height: 150, width: 150, borderColor: "black", borderWidth: 5 }}
          >
            <Picker.Item label="this" value="Unknown" />
            <Picker.Item label="force" value="force" />
            <Picker.Item label="circular" value="circular" />
          </Picker>
        </View>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    backgroundColor: "#dbbaba",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 20,
    maxHeight: 171,
  },
  choiceButton: {
    flex: 1,
    height: 200,
    backgroundColor: "#e9495f",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#e9495f",
  },
  buttonClose: {
    backgroundColor: "#2c1e48",
  },
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 25,
  },
  modalText: {
    textAlign: "center",
    fontSize: 25,
  },
  listItem: {
    width: "100%",
    backgroundColor: "#2c1e4850",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: 10,
    paddingRight: 10,
  },
});
