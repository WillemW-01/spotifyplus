import React, { useRef } from "react";
import { VisNetworkRef } from "react-native-vis-network";
import GraphButton from "./GraphButton";
import { View } from "react-native";

interface Props {
  graphRef: React.RefObject<VisNetworkRef>;
  showSettings: () => void;
  resetGraph: () => void;
}

export default function GraphControls({
  graphRef: visNetworkRef,
  showSettings,
  resetGraph,
}: Props) {
  const zoom = useRef(1);

  const zoomIn = () => {
    if (visNetworkRef.current) {
      if (zoom.current < 5) {
        console.log("Current zoom: ", zoom.current);
        visNetworkRef.current.moveTo({ scale: zoom.current });
        zoom.current += 0.5;
      }
    }
  };

  const zoomOut = () => {
    if (visNetworkRef.current) {
      if (zoom.current >= 0.0) {
        console.log("Current zoom: ", zoom.current);
        visNetworkRef.current.moveTo({ scale: zoom.current });
        zoom.current -= 0.5;
      }
    }
  };

  const resetZoom = () => {
    if (visNetworkRef.current) {
      visNetworkRef.current.fit();
      zoom.current = 1;
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <GraphButton onPress={resetGraph} iconName="refresh" />
      <GraphButton onPress={resetZoom} iconName="scan-outline" />
      <GraphButton onPress={showSettings} iconName="settings-outline" />
    </View>
  );
}
