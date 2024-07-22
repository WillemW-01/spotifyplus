import React, { useRef } from "react";
import { VisNetworkRef } from "react-native-vis-network";
import GraphButton from "./GraphButton";
import { View } from "react-native";

interface Props {
  graphRef: React.RefObject<VisNetworkRef>;
  resetGraph: () => void;
}

export default function GraphControls({ graphRef: visNetworkRef, resetGraph }: Props) {
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
    <View style={{ position: "absolute", top: 40, right: 10, gap: 10 }}>
      <GraphButton onPress={resetGraph} iconName="refresh" />
      <GraphButton onPress={resetZoom} iconName="scan-outline" />
      <GraphButton onPress={zoomIn} iconName="add-outline" />
      <GraphButton onPress={zoomOut} iconName="remove-outline" />
    </View>
  );
}
