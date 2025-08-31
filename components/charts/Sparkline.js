import React from "react";
import { View } from "react-native";
import { COLORS } from "../../lib/theme";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

export default function Sparkline({ 
  data = [4,6,5,8,7,9,6], 
  width = 220, 
  height = 60, 
  stroke = COLORS.primary,
  fillOpacity = 0.2,
  fillGradient = true,
  gradientColors = [COLORS.primary, COLORS.primaryLight]
}) {
  if (!data.length) return <View style={{ width, height }} />;

  const max = Math.max(...data), min = Math.min(...data);
  const stepX = width / (data.length - 1 || 1);
  const norm = v => (max === min ? height/2 : height - ((v - min) / (max - min)) * height);

  // Line path
  let linePath = `M 0 ${norm(data[0])}`;
  data.forEach((v, i) => { if (i) linePath += ` L ${i * stepX} ${norm(v)}`; });
  
  // Fill path with a bottom line to create the area for gradient fill
  let fillPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <Svg width={width} height={height}>
      {fillGradient && (
        <Defs>
          <LinearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity={fillOpacity} />
            <Stop offset="100%" stopColor={gradientColors[1]} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
      )}
      
      {/* Fill area with gradient */}
      {fillGradient && (
        <Path 
          d={fillPath} 
          fill="url(#sparklineGradient)" 
        />
      )}
      
      {/* Line path */}
      <Path 
        d={linePath} 
        fill="none" 
        stroke={stroke} 
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round" 
      />
    </Svg>
  );
}