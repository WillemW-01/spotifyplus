import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";

interface Props {
  style: StyleProp<ViewStyle>;
}

const COLOR_CHOICES = [
  "#FF6B6B",
  "#F06595",
  "#CC5DE8",
  "#845EF7",
  "#5C7CFA",
  "#339AF0",
  "#22B8CF",
  "#20C997",
  "#51CF66",
  "#94D82D",
  "#FCC419",
  "#FF922B",
  "#FF6B6B",
  "#FFA94D",
  "#E64980",
];

const COORD_CHOICES = {
  start: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
  end: [
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
};

interface Coord {
  x: number;
  y: number;
}

export default function RandomGradient({ style }: Props) {
  const [colors, setColors] = useState<string[]>(["#dedede", "#dedede"]);
  const [start, setStart] = useState<Coord>({ x: 0, y: 0 });
  const [end, setEnd] = useState<Coord>({ x: 1, y: 1 });

  const getRandomColor = () => {
    return COLOR_CHOICES[Math.floor(Math.random() * 15)];
  };

  const getRandomCoords = (start: "start" | "end") => {
    return COORD_CHOICES[`${start}`][Math.floor(Math.random() * 2)];
  };

  useEffect(() => {
    const tempColors = [getRandomColor(), getRandomColor()];
    setColors(tempColors);

    const tempStart = getRandomCoords("start");
    const tempEnd = getRandomCoords("end");
    setStart(tempStart);
    setEnd(tempEnd);
  }, []);

  return <LinearGradient colors={colors} start={start} end={end} style={style} />;
}
