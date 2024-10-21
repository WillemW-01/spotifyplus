import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { ModalBaseProps } from "react-native";
import { PHYSICS, SettingsObjectType } from "@/constants/resolverObjects";
import ResolverSettings from "./ResolverSettings";
import ForcePicker from "./ForcePicker";

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setForce: React.Dispatch<React.SetStateAction<keyof typeof PHYSICS>>;
  resolverObj: SettingsObjectType;
  setResolverObj: React.Dispatch<React.SetStateAction<SettingsObjectType>>;
}

const PAGES = 2;

export default function SettingsView({
  visible,
  setForce,
  resolverObj,
  setResolverObj,
}: ModalProps) {
  const [internalForce, setInternalForce] = useState<keyof typeof PHYSICS>("barnesHut");

  const [parentWidth, setParentWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setParentWidth(width);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      const newIndex = (((index + currentIndex) % PAGES) + PAGES) % PAGES;
      scrollViewRef.current.scrollTo({ x: newIndex * parentWidth, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    console.log(`Internal force: ${internalForce}`);
  }, [internalForce]);

  const scrollLeft = () => scrollToIndex(-1);
  const scrollRight = () => scrollToIndex(1);

  return (
    visible && (
      <View style={styles.modalView}>
        <View style={styles.headerContainer} onLayout={handleLayout}>
          <TouchableOpacity onPress={scrollLeft}>
            <Ionicons name="caret-back" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Graph Settings</Text>
          <TouchableOpacity onPress={() => setForce(internalForce)}>
            <Ionicons name="checkmark" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={scrollRight}>
            <Ionicons name="caret-forward" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          pagingEnabled
          indicatorStyle="black"
        >
          <ForcePicker
            parentWidth={parentWidth}
            setForce={setForce}
            internalForce={internalForce}
            setInternalForce={setInternalForce}
          />

          <ResolverSettings
            type={internalForce}
            setResolverObj={setResolverObj}
            resolverObj={resolverObj}
            parentWidth={parentWidth}
          />
        </ScrollView>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    alignItems: "center",
    shadowColor: "#000",
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d1030",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 25,
    flex: 1,
    color: "white",
  },
  scrollContainer: {
    flex: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 250,
  },
  scrollContent: {
    justifyContent: "center",
    alignContent: "center",
  },
  settingScreen: {
    height: "100%",
    padding: 10,
    maxHeight: 171,
  },
});
