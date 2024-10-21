import { Colors } from "@/constants/Colors";
import React, { ReactNode } from "react";
import { View, Modal, StyleSheet, TouchableOpacity, Text } from "react-native";

interface Props {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  children?: ReactNode;
}

export default function MoodModal({ visible, setVisible, children }: Props) {
  return (
    <View style={styles.centeredView}>
      <Modal animationType="slide" transparent={true} visible={visible}>
        <View style={[styles.centeredView, { padding: 20 }]}>
          <View style={{ ...styles.modalView, backgroundColor: Colors.dark.light }}>
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    gap: 20,
    width: "100%",
    margin: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    flexDirection: "column",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
