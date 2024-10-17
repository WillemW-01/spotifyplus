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
