import "expo-router/entry";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, SPACING } from "../lib/theme";
import Container, { GrowGrid } from "../components/layout/Container";
import Card from "../components/ui/Card";
import Sparkline from "../components/charts/Sparkline";
import BarMini from "../components/charts/BarMini";
import ProgressBar from "../components/ui/ProgressBar";
import RingProgress from "../components/ui/RingProgress";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  return (
    <Container>
      <Text style={styles.breadcrumb}>
        Dashboard · <Text style={{ color: COLORS.subtext }}>eCommerce</Text>
      </Text>

      {/* First grid */}
      <GrowGrid minItemWidth={420}>
        <Card>{/* KPI or chart content here */}</Card>
        <Card>{/* KPI block here */}</Card>
      </GrowGrid>

      {/* Second grid */}
      <GrowGrid minItemWidth={320}>
        <Card>{/* Total Users */}</Card>
        <Card>{/* Active Users */}</Card>
        <Card>{/* Sales & Views */}</Card>
      </GrowGrid>

      {/* Third grid */}
      <GrowGrid minItemWidth={380}>
        <Card>{/* Yearly progress bar */}</Card>
        <Card>{/* Monthly ring progress */}</Card>
      </GrowGrid>
    </Container>
  );
}

const styles = StyleSheet.create({
  breadcrumb: { fontSize: 22, fontWeight: "800", color: COLORS.text }
});
