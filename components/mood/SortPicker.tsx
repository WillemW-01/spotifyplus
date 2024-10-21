import React, { useState } from "react";
import { StyleSheet, Text, View, ViewProps, ViewStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { SortCritera } from "@/app/(tabs)/mood";
import { Colors } from "@/constants/Colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface Props {
  reOrderPlaylists: (criteria: SortCritera, ascending?: boolean) => Promise<void>;
  style?: ViewStyle;
}

interface DataItem {
  label: string;
  value: SortCritera;
}

const DEFAULT_SORT_DIRECTION = true;
const DEFAULT_SORT = { label: "Alphabetical", value: "alpha" } as DataItem;
const data = [DEFAULT_SORT, { label: "Size", value: "size" }] as DataItem[];

export default function SortPicker({ reOrderPlaylists, style }: Props) {
  const [value, setValue] = useState<DataItem>(DEFAULT_SORT);
  const [isFocus, setIsFocus] = useState(false);
  const [ascending, setAscending] = useState(DEFAULT_SORT_DIRECTION);

  const width = useSharedValue(50);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(width.value, {
        duration: 350, // Animation duration in ms
      }),
    };
  });

  // Toggle the width change
  const toggleExpand = (value: boolean) => {
    setIsFocus(() => {
      width.value = value ? 130 : 50;
      return value;
    });
  };

  const updateValue = (value: DataItem) => {
    setValue((prev) => {
      setAscending((prevValue) => {
        if (prev && prev.value == value.value) {
          reOrderPlaylists(value.value, !prevValue);
          return !prevValue;
        } else {
          reOrderPlaylists(value.value, DEFAULT_SORT_DIRECTION);
          return DEFAULT_SORT_DIRECTION;
        }
      });
      return value;
    });
    setIsFocus(false);
  };

  return (
    <Animated.View style={{ ...styles.container, ...animatedStyle, ...style }}>
      <Dropdown
        style={[
          styles.dropdown,
          {
            backgroundColor: Colors.dark.brand,
            borderBottomLeftRadius: isFocus ? 0 : 12,
            borderBottomRightRadius: isFocus ? 0 : 12,
          },
        ]}
        selectedTextStyle={{ opacity: 0 }}
        iconStyle={styles.iconStyle}
        containerStyle={{ borderBottomRightRadius: 12, borderBottomLeftRadius: 12 }}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={""}
        onFocus={() => toggleExpand(true)}
        onBlur={() => toggleExpand(false)}
        onChange={(item) => {
          updateValue({ label: item.label, value: item.value });
        }}
        renderRightIcon={() => (
          <Ionicons
            style={styles.iconStyle}
            color={isFocus ? "white" : "black"}
            name="swap-vertical"
            size={20}
          />
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  dropdown: {
    // height: 50,
    width: "100%",
    height: 45,
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconStyle: {
    width: 25,
    height: 25,
  },
});
