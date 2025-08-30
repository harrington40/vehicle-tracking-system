import React from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export default function BarMini({ 
  data = [], 
  secondaryData = [], 
  labels = [],
  height = 140, 
  barColors = ["#3b82f6", "#8b5cf6"],
  style = {} 
}) {
  const [w, setW] = React.useState(0);
  if (!data.length) data = [10, 24, 17, 38, 30, 12, 22];

  return (
    <View 
      onLayout={(e) => setW(e.nativeEvent.layout.width)} 
      style={[{ width: "100%" }, style]}
    >
      {w > 0 && (
        <Bars 
          width={w} 
          height={height} 
          data={data} 
          secondaryData={secondaryData}
          colors={barColors}
        />
      )}
    </View>
  );
}

function Bars({ width, height, data, secondaryData = [], colors }) {
  const allValues = [...data, ...secondaryData];
  const max = Math.max(...allValues);
  const gap = 6;
  const groupWidth = width / data.length;
  const barWidth = secondaryData.length ? (groupWidth - gap * 2) / 2 : groupWidth - gap;

  return (
    <Svg width={width} height={height}>
      {data.map((v, i) => {
        const h = max ? (v / max) * (height - 16) : 0;
        const x = secondaryData.length 
          ? i * groupWidth + gap 
          : i * groupWidth + gap/2;
        const y = height - h;
        return <Rect key={`primary-${i}`} x={x} y={y} width={barWidth} height={h} rx="4" fill={colors[0]} />;
      })}
      
      {secondaryData.map((v, i) => {
        if (i >= data.length) return null;
        const h = max ? (v / max) * (height - 16) : 0;
        const x = i * groupWidth + barWidth + gap * 1.5;
        const y = height - h;
        return <Rect key={`secondary-${i}`} x={x} y={y} width={barWidth} height={h} rx="4" fill={colors[1]} />;
      })}
    </Svg>
  );
}