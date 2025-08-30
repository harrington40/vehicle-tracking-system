import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../lib/theme";
import Card from "../components/ui/Card";

export default function Widgets() {
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
      <Text style={styles.h1}>Widgets</Text>
      <Card><Text>Reusable UI widgets library.</Text></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg }});
