import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../lib/theme";
import Card from "../components/ui/Card";

export default function Settings() {
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
      <Text style={styles.h1}>Settings</Text>
      <Card><Text>App preferences, theme toggles, account, etc.</Text></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg }});
