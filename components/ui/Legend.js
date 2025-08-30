import React from "react";
import { View, Text } from "react-native";
import { COLORS } from "../../lib/theme";

export default function Legend({ children, swatch = "#111", style }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", marginRight: 12 }, style]}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: swatch, marginRight: 6 }} />
      <Text style={{ color: COLORS.subtext }}>{children}</Text>
    </View>
  );
}
