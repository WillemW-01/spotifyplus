import React, { ReactNode } from "react";
import { Modal, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/Colors";

interface Props {
  visible: boolean;
  children?: ReactNode;
}

export default function MoodModal({ visible, children }: Props) {
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
    maxHeight: "80%",
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
});
