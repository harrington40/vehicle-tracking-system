import React from "react";
import { View } from "react-native";
import { COLORS } from "../../lib/theme";

export default function Divider({ height = 56 }) {
  return <View style={{ width: 1, height, backgroundColor: COLORS.border }} />;
}
