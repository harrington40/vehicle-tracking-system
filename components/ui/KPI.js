import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../lib/theme";

export default function KPI({ title, value, icon }) {
  return (
    <View style={{ alignItems: "flex-start" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={{ color: "#64748B", fontWeight: "600", marginLeft: 6 }}>{title}</Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F172A", marginTop: 6 }}>{value}</Text>
      <Text style={{ color: "#64748B" }}>from last month</Text>
    </View>
  );
}
