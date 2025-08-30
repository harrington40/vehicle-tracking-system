import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function Sparkline({ data = [4,6,5,8,7,9,6], width=220, height=60, stroke="#4F46E5" }) {
  if (!data.length) return <View style={{ width, height }} />;

  const max = Math.max(...data), min = Math.min(...data);
  const stepX = width / (data.length - 1 || 1);
  const norm = v => (max === min ? height/2 : height - ((v - min) / (max - min)) * height);

  let d = `M 0 ${norm(data[0])}`;
  data.forEach((v, i) => { if (i) d += ` L ${i * stepX} ${norm(v)}`; });

  return (
    <Svg width={width} height={height}>
      <Path d={d} fill="none" stroke={stroke} strokeWidth={3} />
    </Svg>
  );
}
