import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import React, { useEffect, useRef, useState } from "react";
import { SVGRenderer, SvgChart as SvgComponent } from "@wuba/react-native-echarts";
import {
  View,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
} from "react-native";
import { GraphSeriesOption } from "echarts";
import { GraphNodeItemOption } from "echarts/types/src/chart/graph/GraphSeries";

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

const E_HEIGHT = 500;
const E_WIDTH = 500;
const blockStyle: StyleProp<ViewStyle> = {
  flex: 1,
  backgroundColor: "lightblue",
};

interface Link {
  source: string;
  target: string;
}

type Dictionary<T> = {
  [key: string]: T;
};

// interface DataPoint {
//   fixed?: boolean;
//   x?: number;
//   y?: number;
//   symbolSize?: number;
//   label?: unknown;
//   id: string;
// }

export default function GraphForceDynamic() {
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
          layout: "force",
          animation: false,
          data: nodes.current,
          selectedMode: "single",
          select: {
            itemStyle: { color: "red" },
          },
          force: {
            repulsion: 100,
            edgeLength: 5,
          },
          edges: edges.current,
        },
      ],
    };
  };

  const buildDataPoint = (): GraphNodeItemOption => {
    return {
      fixed: false,
      x: chartWidth / 2,
      y: chartHeight / 2,
      symbolSize: 20,
      id: "-1",
      label: {
        show: true,
      },
    };
  };

  const addRandomPoint = () => {
    const randX = Math.random() * chartWidth;
    const randY = Math.random() * chartHeight;

    addPoint({ x: randX, y: randY });
  };

  const addPoint = (point: GraphNodeItemOption) => {
    if (chart) {
      console.log(`Adding new node #${nodes.current.length} at ${point.x} ${point.y}`);
      nodes.current.push({ id: nodes.current.length + "" });
      chart.setOption({ series: [{ roam: true, data: nodes.current }] });
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

  const resetPositions = () => {
    if (chart) {
      const newNodes = nodes.current.map((node) => {
        console.log(`Moving node ${node.id} to ${chartWidth} ${chartHeight}`);
        return {
          ...node,
          x: 0,
          y: 0,
        };
      });
      console.log(newNodes);
      nodes.current = newNodes;
      chart.setOption({ series: [{ roam: true, data: nodes.current }], zoom: 0.5 });
    }
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
    if (chart && nodes.current.length == 0) {
      console.log("Running useEffect, ");
      addPoint({ x: chartHeight / 2, y: chartHeight / 2, symbolSize: 20, fixed: true });
      addPoint({ x: chartHeight / 2, y: chartHeight / 2, symbolSize: 20, fixed: true });
      addPoint({ x: chartHeight / 2, y: chartHeight / 2, symbolSize: 20, fixed: true });

      chart.setOption({
        series: [{ roam: true, data: nodes.current }],
      });
    }
  }, [chart]);

  useEffect(() => {
    console.log("Nodes updated: ", nodes.current);
  }, [nodes.current]);

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
    console.log("Selected changing: ", selected.current);
  }, [selected.current]);

  return (
    <>
      <View style={blockStyle} onLayout={handleLayout}>
        <SvgComponent ref={svgRef} />
        <Button onPress={addRandomPoint} text="+ node" top={10} />
        <Button onPress={addRandomEdge} text="+ edge" top={80} />
        <Button onPress={resetPositions} text="reset" top={120} />
      </View>
    </>
  );
}
