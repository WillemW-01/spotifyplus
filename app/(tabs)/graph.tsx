import React, { useEffect, useState } from "react";
import VisNetwork, { Data } from "react-native-vis-network";
import BrandGradient from "@/components/BrandGradient";
// import ThemedText from "@/components/ThemedText";

export default function Graph() {
  const [data, setData] = useState<Data>({
    edges: [
      { from: 1, to: 3 },
      { from: 1, to: 2 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
    ],
    nodes: [
      { id: 1, label: "Node 1", shape: "dot" },
      { id: 2, label: "Node 2", shape: "dot" },
      { id: 3, label: "Node 3", shape: "dot" },
      { id: 4, label: "Node 4", shape: "dot" },
      { id: 5, label: "Node 5", shape: "dot" },
    ],
  });

  useEffect(() => {
    if (!data.nodes) {
      // TODO: redo graph component
      // setData(packData());
    }
  });

  return (
    <BrandGradient>
      {/* // <ThemedText type="title" text="Graph" /> */}
      <VisNetwork data={data} />
    </BrandGradient>
  );
}
