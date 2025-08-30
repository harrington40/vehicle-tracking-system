import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
import { COLORS, SPACING } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function StatCard({ icon="stats-chart", title, value, delta, deltaType="up" }) {
  const deltaColor = deltaType === "up" ? COLORS.success : COLORS.danger;
  const deltaIcon  = deltaType === "up" ? "trending-up" : "trending-down";

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {delta != null && (
        <View style={styles.deltaRow}>
          <Ionicons name={deltaIcon} size={14} color={deltaColor} />
          <Text style={[styles.delta, { color: deltaColor }]}>{delta}</Text>
          <Text style={styles.deltaNote}> from last month</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 260 },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  title: { color: COLORS.subtext, fontSize: 14, fontWeight: "600" },
  value: { color: COLORS.text, fontSize: 28, fontWeight: "800", marginBottom: SPACING.sm },
  deltaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  delta: { fontWeight: "700" },
  deltaNote: { color: COLORS.subtext }
});
