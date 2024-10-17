import { SVGRenderer, SkiaChart } from "@wuba/react-native-echarts";
import { GraphSeriesOption } from "echarts";
import { GraphChart } from "echarts/charts";
import {
  DataZoomComponent,
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { GraphNodeItemOption } from "echarts/types/src/chart/graph/GraphSeries";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import { PlotPoint } from "@/app/(tabs)/mood";
import ThemedText from "./ThemedText";

type ECOption = echarts.ComposeOption<GraphSeriesOption>;

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  DataZoomComponent,
  GraphicComponent,
  LabelLayout,
  UniversalTransition,
  SVGRenderer,
  LegendComponent,
  GraphChart,
]);

interface Link {
  source: string;
  target: string;
}

type Dictionary<T> = {
  [key: string]: T;
};

interface NetworkProps {
  nodeData: PlotPoint[];
  edgeData: Link[];
}

const log10n = (n: number, x: number) => {
  const result = Math.log10(x + 1.05) / Math.log10(n);
  console.log(result);
  return result;
};

export default function GraphForceDynamic({ nodeData, edgeData }: NetworkProps) {
  const svgRef = useRef(null);
  const nodes = useRef<GraphNodeItemOption[]>([]);
  const edges = useRef<Link[]>([]);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const selected = useRef<Dictionary<boolean>>({});

  const buildChartOption = (): ECOption => {
    return {
      series: [
        {
          type: "graph",
          layout: "none",
          animation: false,
          data: nodes.current,
          selectedMode: "single",
          select: {
            itemStyle: { color: "red" },
          },
          force: {
            repulsion: 100,
            edgeLength: 5,
            gravity: 1,
          },
          edges: edges.current,
          scaleLimit: {
            min: 1,
            // max: 2,
          },
          height: "auto",
          width: "auto",
          label: {
            show: true,
            formatter: "{@name}",
          },
          labelLayout: {
            hideOverlap: true,
          },
          roam: true,
        },
      ],
      // dataZoom: [
      //   {
      //     type: "inside",
      //     start: 0,
      //     end: 100,
      //     startValue: 0,
      //     endValue: 100,
      //   },
      // ],
    };
  };

  const buildDataPoint = (point: PlotPoint): GraphNodeItemOption => {
    return {
      name: point.name,
      fixed: true,
      x: Number(point.x),
      y: Number(point.y),
      symbolSize: log10n(50, point.size) * 200,
      id: point.name,
    };
  };

  const addRandomPoint = () => {
    const randX = Math.random() * chartWidth;
    const randY = Math.random() * chartHeight;

    addPoint({ id: nodes.current.length.toString(), x: randX, y: randY });
  };

  const addPoint = (point: GraphNodeItemOption) => {
    if (chart) {
      // console.log(`Adding new node #${nodes.current.length} at ${point.x} ${point.y}`);
      // console.log(point);
      nodes.current.push({ ...point });
      chart.setOption({ series: [{ data: nodes.current }] });
    }
  };

  const addPoints = (points: PlotPoint[]) => {
    if (chart) {
      const dataPoints = points.map((point) => buildDataPoint(point));
      nodes.current.push(...dataPoints);
      chart.setOption({ series: [{ data: nodes.current }] });
    }
  };

  const addRandomEdge = () => {
    const source = Math.round((nodes.current.length - 1) * Math.random());
    const target = Math.round((nodes.current.length - 1) * Math.random());
    addEdge(source.toString(), target.toString());
  };

  const addEdge = (from: string, to: string) => {
    if (chart) {
      if (!edges.current.includes({ source: from, target: to })) {
        console.log(`Adding new edge from ${from} to ${to}`);
        edges.current.push({
          source: from,
          target: to,
        });
        chart.setOption({ series: [{ roam: true, edges: edges.current }] });
      } else {
        console.log("Edge already exists");
      }
    }
  };

  // const resetPositions = () => {
  //   if (chart) {
  //     const newNodes = nodes.current.map((node) => {
  //       console.log(`Moving node ${node.id} to ${chartWidth} ${chartHeight}`);
  //       return {
  //         ...node,
  //         x: 0,
  //         y: 0,
  //       };
  //     });
  //     console.log(newNodes);
  //     nodes.current = newNodes;
  //     chart.setOption({ series: [{ roam: true, data: nodes.current }], zoom: 0.5 });
  //   }
  // };

  const refreshOptions = () => {
    const newChart = chart;
    newChart?.setOption(buildChartOption());
    setChart(newChart);
  };

  const runChart = () => {
    if (svgRef?.current && !chart) {
      const newChart = echarts.init(svgRef.current, "light", {
        renderer: "svg",
        width: chartWidth,
        height: chartHeight,
      });

      newChart.on("click", function (params) {
        // if (params.componentType === "series" && params.seriesType === "graph") {
        // Handle node click event here
        const selectedNode = params.data;
        console.log("Selected node:", selectedNode);
        // Perform any additional actions you need
      });
      // });

      newChart.setOption(buildChartOption());
      setChart(newChart);
    }
  };

  useEffect(() => runChart(), []);

  useEffect(() => {
    const CHUNK_SIZE = 100;
    if (chart && nodes.current.length == 0) {
      console.log("Running useEffect, ");
      // nodeData.forEach((point) => {
      //   // console.log("Building point with name: ", point.name);
      //   addPoint(buildDataPoint(point));
      // });

      for (let i = 0; i < nodeData.length; i += CHUNK_SIZE) {
        addPoints(nodeData.slice(i, i + CHUNK_SIZE));
      }

      edgeData.forEach((edge) => {
        addEdge(edge.source, edge.target);
      });

      // chart.setOption({
      //   series: [{ roam: true, data: nodes.current }],
      // });
    }
  }, [chart]);

  // useEffect(() => {
  //   console.log("Nodes updated: ", nodes.current);
  // }, [nodes.current]);

  useEffect(() => {
    if (chart) {
      chart.resize({
        width: chartWidth,
        height: chartHeight,
      });
    }
  }, [chartWidth, chartHeight]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    console.log(`Resizing to ${width}x${height}`);
    setChartWidth(width);
    setChartHeight(height);
  };

  interface ButtonProps {
    onPress: () => void;
    text: string;
    top: number;
  }

  function Button({ onPress, text, top }: ButtonProps) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: "red",
          width: 50,
          height: 50,
          zIndex: 10,
          position: "absolute",
          top: top,
          right: 10,
        }}
      >
        <Text>{text}</Text>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    if (selected.current) {
      console.log("Selected changing: ", selected.current);
    }
  }, [selected.current]);

  return (
    <View style={styles.blockStyle} onLayout={handleLayout}>
      <SkiaChart ref={svgRef} />
      <Button onPress={addRandomPoint} text="+ node" top={10} />
      <Button onPress={addRandomEdge} text="+ edge" top={80} />
      <Button onPress={refreshOptions} text="refresh" top={120} />
      <ThemedText
        type="default"
        text="electric atmospheric"
        style={{ zIndex: 2, position: "absolute", top: 5, left: 5 }}
      />
      <ThemedText
        type="default"
        text="organic atmospheric"
        style={{ zIndex: 2, position: "absolute", bottom: 5, left: 5 }}
      />
      <ThemedText
        type="default"
        text="electric spiky"
        style={{ zIndex: 2, position: "absolute", top: 5, right: 5 }}
      />
      <ThemedText
        type="default"
        text="organic spiky"
        style={{ zIndex: 2, position: "absolute", bottom: 5, right: 5 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blockStyle: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
