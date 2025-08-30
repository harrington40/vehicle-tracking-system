// components/ui/RingProgress.js
import React from "react";
import Svg, { Circle } from "react-native-svg";
import { Box, Text, useToken } from "native-base";

/**
 * Props:
 *  - value: 0..100 (or any number, clamped)
 *  - size: outer size in px
 *  - stroke: ring thickness
 *  - color: theme token ("primary.500") or hex ("#4F46E5")
 *  - label: small text below the number
 *  - display: override center text (e.g., "97.4K")
 */
export default function RingProgress({
  value = 65,
  size = 140,
  stroke = 10,
  color = "primary.500",
  label = "Monthly",
  display,
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  // Resolve NB color token -> hex (fallback to the raw string if it's already hex)
  const [tokenColor] = useToken("colors", [color]);
  const ringColor = tokenColor || color;

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <Box alignItems="center" justifyContent="center">
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF1F6" strokeWidth={stroke} fill="none" />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash}, ${c}`}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Center label */}
      <Box position="absolute" alignItems="center">
        <Text fontSize="md" fontWeight="extrabold" color="coolGray.900">
          {display ?? (typeof value === "number" ? `${pct}%` : value)}
        </Text>
        {label ? <Text color="coolGray.500">{label}</Text> : null}
      </Box>
    </Box>
  );
}
