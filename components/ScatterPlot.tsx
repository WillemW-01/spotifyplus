import React from "react";
import { Text, TouchableOpacity } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Svg, { Circle, Rect } from "react-native-svg";

import { Colors } from "@/constants/Colors";

export interface PlotPoint {
  name: string;
  x: string;
  y: string;
  href: string;
  size: number;
}

interface ScatterPlotProps {
  data: PlotPoint[];
  // eslint-disable-next-line no-unused-vars
  onPress: (href: string) => void;
}

const SCALING = 2;
const SCALE_MIN = 0.3;
const SCALE_MAX = 5;

export default function ScatterPlot({ data, onPress }: ScatterPlotProps) {
  const scale = useSharedValue(1);
  const prevScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const pinchHandler = Gesture.Pinch()
    .onStart(() => {
      prevScale.value = scale.value;
    })
    .onUpdate((event) => {
      if (event.scale > SCALE_MIN && event.scale < SCALE_MAX) {
        scale.value = prevScale.value * event.scale;
      }
    });

  const panHandler = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onUpdate((event) => {
      const effectX = offsetX.value + event.translationX;
      translateX.value = effectX;

      const effectY = offsetY.value + event.translationY;
      translateY.value = effectY;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  /*
 
 GO LOOK AT: https://commerce.nearform.com/open-source/victory/docs/victory-zoom-container
 
 */

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Race(panHandler, pinchHandler)}>
        <Animated.View style={{ flex: 1 }}>
          <AnimatedSvg
            height="100%"
            width="100%"
            // viewBox="0 0 113 200"
            viewBox="0 0 100 100"
            style={[animatedStyle, { borderWidth: 2 }]}
          >
            <Rect x="0" y="0" width="100" height="100" fill={Colors["dark"]["light"]} />
            {data.map((item, index) => (
              <Circle
                key={index}
                cx={item.x}
                cy={item.y}
                r={item.size * SCALING}
                fill="black"
                onPress={() => onPress(item.href)}
              />
            ))}
          </AnimatedSvg>
        </Animated.View>
      </GestureDetector>
      <TouchableOpacity
        onPress={() => {
          scale.value = 1;
          translateX.value = 0;
          translateY.value = 0;
        }}
        activeOpacity={0.5}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 50,
          height: 50,
          backgroundColor: Colors["dark"]["backgroundLight"],
          borderRadius: 25,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>Reset</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}
