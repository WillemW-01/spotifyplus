import React, { ReactElement } from "react";
import { Dimensions, StyleProp, View, ViewStyle } from "react-native";

interface Props {
  cols: number;
  gap: number;
  rowGap?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactElement[];
}

export default function GridBox({
  cols,
  gap,
  rowGap,
  style: extraStyle,
  children,
}: Props) {
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = screenWidth / cols - 2 * gap;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: gap,
          rowGap: rowGap,
          justifyContent: "space-between",
        },
        extraStyle,
      ]}
    >
      {children.map((child, i) =>
        // Use React.cloneElement to pass original props to the child
        React.cloneElement(child, { ...child.props, width: itemWidth, key: i })
      )}
    </View>
  );
}
