import * as d3 from "d3";
import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

// Function to determine if the color is dark based on its luminance
function isDarkColor(color: string): boolean {
  const d3Color = d3.color(color); // Parses color string using d3
  if (!d3Color) return false; // fallback if color parsing fails

  const rgbColor = d3.rgb(d3Color); // Converts the color to RGB
  const luminance = 0.2126 * rgbColor.r + 0.7152 * rgbColor.g + 0.0722 * rgbColor.b;

  // Return true if luminance is below a threshold (128 is a common midpoint)
  return luminance < 128;
}

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
  setSelectedNode: React.Dispatch<React.SetStateAction<string>>;
}

export default function CirclePackingChart({
  data,
  width,
  height,
  setSelectedNode,
}: CirclePackingChartProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const prevTranslateX = useSharedValue(0);
  const prevTranslateY = useSharedValue(0);
  const prevScale = useSharedValue(1);

  const hierarchy = d3
    .hierarchy<DataNode>(data)
    .sum((d) => {
      return d.value ? d.value : 0;
    })
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const packLayout = d3.pack<DataNode>().size([width, height]).padding(3);
  const root = packLayout(hierarchy);

  const descendants = root.descendants().filter((node) => node.depth !== 0);
  const maxRadius = d3.max(descendants, (d) => d.r) || 1;
  const minRadius = d3.min(descendants, (d) => d.r) || 0;
  console.log(`Min: ${minRadius}, max: ${maxRadius}`);
  const colorScale = d3
    .scaleSequential(d3.interpolatePlasma)
    .domain([minRadius, maxRadius]);
  console.log(`Minradius :${minRadius}, max: ${maxRadius}`);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newValue = prevScale.value * e.scale;
      if (newValue > 0.7 && newValue < 3) {
        scale.value = newValue;
      }
    })
    .onEnd(() => {
      prevScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = prevTranslateX.value + e.translationX / scale.value;
      const newY = prevTranslateY.value + e.translationY / scale.value;
      if (newX > -width && newX < width) {
        translateX.value = newX;
      }
      if (newY > -height && newY < height) {
        translateY.value = newY;
      }
    })
    .onEnd(() => {
      prevTranslateX.value = translateX.value;
      prevTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value || 0 },
        { translateY: translateY.value || 0 },
        { scale: scale.value || 1 },
      ],
    } as const;
  });

  const handlePress = (node: d3.HierarchyCircularNode<DataNode>) => {
    console.log(`Clicking on ${node.data.name}`);
    if (node.data.name !== "root") {
      setSelectedNode(node.data.name);
    }
  };

  return (
    <GestureDetector gesture={composed}>
      <View style={{ width, height, flex: 1 }}>
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <Svg width={width} height={height}>
            <G>
              {root.descendants().map((node, index) => {
                const text = node.data.name ?? "";
                const radius = node.r;

                if (isNaN(radius) || radius <= 0) {
                  return null;
                }

                const circleColor = colorScale(node.r);
                const textColor = isDarkColor(circleColor) ? "white" : "black";
                const adaptiveFontSize = radius / 4;

                return (
                  <G key={index} onLongPress={() => handlePress(node)}>
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={node.depth !== 0 ? circleColor : "transparent"}
                    />
                    {node.depth !== 0 && radius > 10 && (
                      <SvgText
                        x={node.x}
                        y={node.y}
                        fontSize={adaptiveFontSize}
                        fontFamily="Inter"
                        fill={textColor}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {text}
                      </SvgText>
                    )}
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
