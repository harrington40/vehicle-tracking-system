import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../lib/theme";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";

export default function BarMini({ 
  data = [], 
  secondaryData = [], 
  labels = [],
  height = 140, 
  barColors = [COLORS.primary, "#8b5cf6"],
  style = {},
  showLabels = true
}) {
  const [w, setW] = React.useState(0);
  if (!data.length) data = [10, 24, 17, 38, 30, 12, 22];

  return (
    <View style={{ height: height + (showLabels && labels.length ? 24 : 0) }}>
      <View 
        onLayout={(e) => setW(e.nativeEvent.layout.width)} 
        style={[{ width: "100%", height }, style]}
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
      
      {/* Show labels if enabled and provided */}
      {showLabels && labels.length > 0 && (
        <View style={styles.labelContainer}>
          {labels.map((label, index) => (
            <Text 
              key={index} 
              style={styles.label}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {label}
            </Text>
          ))}
        </View>
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
      <Defs>
        {/* Primary Bar Gradient */}
        <LinearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
          <Stop offset="100%" stopColor={colors[0]} stopOpacity="0.6" />
        </LinearGradient>
        
        {/* Secondary Bar Gradient */}
        <LinearGradient id="secondaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={colors[1]} stopOpacity="1" />
          <Stop offset="100%" stopColor={colors[1]} stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      
      {/* Primary Bars */}
      {data.map((v, i) => {
        const h = max ? (v / max) * (height - 16) : 0;
        const x = secondaryData.length 
          ? i * groupWidth + gap 
          : i * groupWidth + gap/2;
        const y = height - h;
        return (
          <Rect 
            key={`primary-${i}`} 
            x={x} 
            y={y} 
            width={barWidth} 
            height={h} 
            rx="4" 
            fill="url(#primaryGradient)" 
          />
        );
      })}
      
      {/* Secondary Bars */}
      {secondaryData.map((v, i) => {
        if (i >= data.length) return null;
        const h = max ? (v / max) * (height - 16) : 0;
        const x = i * groupWidth + barWidth + gap * 1.5;
        const y = height - h;
        return (
          <Rect 
            key={`secondary-${i}`} 
            x={x} 
            y={y} 
            width={barWidth} 
            height={h} 
            rx="4" 
            fill="url(#secondaryGradient)" 
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
    paddingHorizontal: SPACING ? SPACING.xs : 6,
  },
  label: {
    fontSize: 10,
    color: COLORS ? COLORS.subtext : "#64748b",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 2,
  }
});