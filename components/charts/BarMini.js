// components/charts/BarMini.js
import React from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export default function BarMini({ data = [], height = 140, color = "#111" }) {
  const [w, setW] = React.useState(0);
  if (!data.length) data = [10, 24, 17, 38, 30, 12, 22];

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      {w > 0 && <Bars width={w} height={height} data={data} color={color} />}
    </View>
  );
}

function Bars({ width, height, data, color }) {
  const max = Math.max(...data);
  const gap = 6;
  const bw = width / data.length - gap;

  return (
    <Svg width={width} height={height}>
      {data.map((v, i) => {
        const h = max ? (v / max) * (height - 16) : 0;
        const x = i * (bw + gap);
        const y = height - h;
        return <Rect key={i} x={x} y={y} width={bw} height={h} rx="4" fill={color} />;
      })}
    </Svg>
  );
}
