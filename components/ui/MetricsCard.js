import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import { COLORS } from "../../lib/theme";

export default function MetricsCard({ style }) {
  const metrics = [
    {
      icon: "cart-outline",
      value: "85,246",
      label: "Orders",
      color: "#3b82f6",
      bgColor: "#e0f2fe"
    },
    {
      icon: "print-outline",
      value: "$96,147",
      label: "Income",
      color: "#10b981",
      bgColor: "#d1fae5"
    },
    {
      icon: "notifications-outline",
      value: "846",
      label: "Notifications",
      color: "#f43f5e",
      bgColor: "#ffe4e6"
    },
    {
      icon: "card-outline",
      value: "$84,472",
      label: "Payment",
      color: "#0ea5e9",
      bgColor: "#e0f2fe"
    }
  ];

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.container}>
        {metrics.map((metric, index) => (
          <React.Fragment key={index}>
            <View style={styles.metricContainer}>
              <View style={[styles.iconCircle, { backgroundColor: metric.bgColor }]}>
                <Ionicons name={metric.icon} size={24} color={metric.color} />
              </View>
              <Text style={styles.value}>{metric.value}</Text>
              <Text style={styles.label}>{metric.label}</Text>
            </View>
            
            {/* Add vertical divider except after the last item */}
            {index < metrics.length - 1 && (
              <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  metricContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  divider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e2e8f0',
  }
});