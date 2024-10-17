import React, { useRef } from "react";
import { Platform, View } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Text,
  matchFont,
  useTouchHandler,
} from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const FONT_SIZE = 10;

const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
const fontStyle = {
  fontFamily,
  fontSize: FONT_SIZE,
};
const font = matchFont(fontStyle);
import * as d3 from "d3";

export interface DataNode {
  name: string;
  value?: number;
  children?: DataNode[];
  depth: number;
  title: string;
}

interface CirclePackingChartProps {
  data: DataNode;
  width: number;
  height: number;
  selectedRef: React.MutableRefObject<DataNode>;
}

export default function CirclePackingChart({
  data,
  width,
  height,
  selectedRef,
}: CirclePackingChartProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const prevTranslateX = useSharedValue(0); // Keep track of the previous X translation
  const prevTranslateY = useSharedValue(0); // Keep track of the previous Y translation
  const prevScale = useSharedValue(1);

  // State to track selected circle (optional)
  // const selectedCircle = useRef<DataNode | null>(null);

  // Process data with D3
  const hierarchy = d3
    .hierarchy<DataNode>(data)
    .sum((d) => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const packLayout = d3.pack<DataNode>().size([width, height]).padding(3);

  const root = packLayout(hierarchy);
  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newValue = prevScale.value * e.scale;
      if (newValue > 0.7 && newValue < 3) {
        scale.value = prevScale.value * e.scale;
      }
    })
    .onEnd(() => {
      prevScale.value = scale.value; // Save the current scale after pinch ends
    });

  // Pan gesture for panning
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = prevTranslateX.value + e.translationX / scale.value;
      const newY = prevTranslateY.value + e.translationY / scale.value;
      if (newX > -width / 2 && newX < width / 2) {
        translateX.value = newX; // Adjust translation based on current scale
      }
      if (newY > -height / 2 && newY < height / 2) {
        translateY.value = newY; // Adjust translation based on current scale
      }
    })
    .onEnd(() => {
      prevTranslateX.value = translateX.value;
      prevTranslateY.value = translateY.value;
    });

  // Combine both pinch and pan gestures
  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated style for applying transform
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Touch handler to detect touch and check circle intersection
  const touchHandler = useTouchHandler({
    onEnd: (event) => {
      console.log("Event: ", event);
      const { x, y } = event;
      // console.log(JSON.stringify(root.descendants().map((n) => n.children)));
      root.descendants().forEach((node) => {
        const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
        console.log(`${distance}, ${node.r}, ${node.data.name}`);
        if (distance <= node.r && node.data.name != "root") {
          // Circle was clicked
          console.log("Circle Clicked", `You clicked on: ${node.data.name}`);
          selectedRef.current = node.data;
        }
      });
    },
  });

  // Render with Skia
  return (
    <GestureDetector gesture={composed}>
      <View style={{ width, height, flex: 1 }}>
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <Canvas style={{ width, height }} onTouch={touchHandler}>
            {root.descendants().map((node, index) => {
              const text = node.data.name ?? "";

              const adaptiveFontSize = node.r / 2; // You can adjust the division factor for desired size
              font.setSize(adaptiveFontSize);

              const textWidth = font ? font.measureText(text).width : 0;

              const textX = node.x - textWidth / 4;
              const textY = node.y + adaptiveFontSize / 2; // Center vertically based on font size

              return (
                <Group key={index}>
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    color={
                      node.depth !== 0
                        ? `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                            Math.random() * 255
                          }, 0.7)`
                        : "transparent"
                    }
                  />
                  {node.depth != 0 && (
                    <Text text={text} font={font} color="white" x={textX} y={textY} />
                  )}
                </Group>
              );
            })}
          </Canvas>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
