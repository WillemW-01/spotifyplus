import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { ModalBaseProps } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import SettingSlider from "./SettingSlider";
import { SettingsObjectType } from "@/constants/resolverObjects";
import SettingsObject from "./SettingsObject";

const PHYSICS = {
  barnesHut: "barnesHut",
  forceAtlas2Based: "forceAtlas2Based",
  repulsion: "repulsion",
  hierarchicalRepulsion: "hierarchicalRepulsion",
};

interface ModalProps extends ModalBaseProps {
  visible: boolean;
  setForce: React.Dispatch<React.SetStateAction<string>>;
  setSlider: React.Dispatch<React.SetStateAction<number>>;
  resolverObj: SettingsObjectType;
  setResolverObj: React.Dispatch<React.SetStateAction<SettingsObjectType>>;
}

export default function SettingsView({
  visible,
  setForce,
  setSlider,
  resolverObj,
  setResolverObj,
}: ModalProps) {
  const [internalForce, setInternalForce] = useState("barnesHut");
  // const [internalSlideValue, setInternalSlideValue] = useState(0.5);

  const [parentWidth, setParentWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setParentWidth(width);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      const newIndex = (((index + currentIndex) % 3) + 3) % 3;
      scrollViewRef.current.scrollTo({ x: newIndex * parentWidth, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  const scrollLeft = () => scrollToIndex(-1);
  const scrollRight = () => scrollToIndex(1);

  return (
    visible && (
      <View style={styles.modalView}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#0d1030",
            paddingVertical: 10,
            paddingHorizontal: 5,
            borderTopRightRadius: 12,
            borderTopLeftRadius: 12,
          }}
          onLayout={handleLayout}
        >
          <TouchableOpacity onPress={scrollLeft}>
            <Ionicons name="caret-back" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Graph Settings</Text>
          <TouchableOpacity onPress={scrollRight}>
            <Ionicons name="caret-forward" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          style={{
            flex: 1,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
          contentContainerStyle={{
            justifyContent: "center",
            alignContent: "center",
          }}
          pagingEnabled
          indicatorStyle="black"
        >
          <View
            style={{
              width: parentWidth,
              height: "100%",
              ...styles.settingScreen,
            }}
          >
            <Text style={{ fontSize: 20, color: "black" }}>Physics resolver:</Text>
            <RNPickerSelect
              onValueChange={(value) => setInternalForce(value)}
              items={[
                { label: "Barnes Hut", value: PHYSICS.barnesHut },
                { label: "ForceAtlas2Based", value: PHYSICS.forceAtlas2Based },
                { label: "Repulsion", value: PHYSICS.repulsion },
                { label: "Hierarchical Repulsion", value: PHYSICS.hierarchicalRepulsion },
              ]}
              style={{
                inputIOS: {
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderWidth: 1,
                  borderColor: "gray",
                  borderRadius: 4,
                  color: "#000000",
                  paddingRight: 30,
                },
                placeholder: {
                  color: "#686868",
                  fontSize: 16,
                },
              }}
              onDonePress={() => setForce(internalForce)}
              onClose={() => setForce(internalForce)}
            />
          </View>
          <ScrollView
            style={{
              width: parentWidth,
              height: "100%",
              ...styles.settingScreen,
            }}
            contentContainerStyle={{
              gap: 10,
              paddingBottom: 20,
            }}
          >
            <SettingsObject
              type={internalForce}
              setResolverObj={setResolverObj}
              resolverObj={resolverObj}
            />
            {/* <Text style={{ fontSize: 20, color: "black" }}>Resolver settings:</Text>
            <SettingSlider label="theta" setValue={setSlider} />
            <SettingSlider label="gravitationalConstant" setValue={setSlider} />
            <SettingSlider label="centralGravity" setValue={setSlider} />
            <SettingSlider label="springLength" setValue={setSlider} />
            <SettingSlider label="springConstant" setValue={setSlider} />
            <SettingSlider label="damping" setValue={setSlider} />
            <SettingSlider label="avoidOverlap" setValue={setSlider} /> */}
          </ScrollView>
          <View
            style={{
              backgroundColor: "green",
              width: parentWidth,
              height: "100%",
              ...styles.settingScreen,
            }}
          />
        </ScrollView>
        {/* <View style={{}}>
          <Text>Graph force method:</Text>

        </View> */}
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
    // maxHeight: 171,
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
  modalTitle: {
    textAlign: "center",
    fontSize: 25,
    flex: 1,
    color: "white",
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
  settingScreen: {
    padding: 10,
    maxHeight: 171,
  },
});

const physicsSettings = {
  barnesHut: {
    theta: 0.5,
    gravitationalConstant: -2000,
    centralGravity: 0.3,
    springLength: 95,
    springConstant: 0.04,
    damping: 0.09,
    avoidOverlap: 0,
  },
  forceAtlas2Based: {
    theta: 0.5,
    gravitationalConstant: -50,
    centralGravity: 0.01,
    springConstant: 0.08,
    springLength: 100,
    damping: 0.4,
    avoidOverlap: 0,
  },
  repulsion: {
    centralGravity: 0.2,
    springLength: 200,
    springConstant: 0.05,
    nodeDistance: 100,
    damping: 0.09,
  },
  hierarchicalRepulsion: {
    centralGravity: 0.0,
    springLength: 100,
    springConstant: 0.01,
    nodeDistance: 120,
    damping: 0.09,
    avoidOverlap: 0,
  },
};
