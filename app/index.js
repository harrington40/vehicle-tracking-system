import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { COLORS, SPACING } from "../lib/theme";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Sparkline from "../components/charts/Sparkline";
import BarMini from "../components/charts/BarMini";
import Chip from "../components/ui/Chip";
import ProgressBar from "../components/ui/ProgressBar";
import RingProgress from "../components/ui/RingProgress";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/**
 * Dashboard Component
 * ------------------
 * Main dashboard view with uniformly sized and spaced cards
 */
export default function Dashboard() {
  // Maximum content width in pixels
  const MAX = 1280;
  const { width } = useWindowDimensions();
  
  // Calculate card dimensions and layout
  const cardSpacing = 16; // Space between cards
  const containerPadding = 16; // Padding on container sides
  const availableWidth = Math.min(width - (containerPadding * 2), MAX);
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <Container maxWidth={MAX} style={{ paddingHorizontal: containerPadding, paddingVertical: 20 }}>
        {/* Page header with breadcrumb navigation */}
        <Text style={styles.breadcrumb}>
          Dashboard · <Text style={{ color: COLORS.subtext }}>eCommerce</Text>
        </Text>

        {/* Uniform Card Grid */}
        <CardGrid spacing={cardSpacing} columns={2}>
          {/* CARD #1: Weekly Sales with Sparkline Chart */}
          <DashboardCard title="Average Weekly Sales">
            <View style={styles.rowBetween}>
              <View style={styles.rowStart}>
                <Text style={styles.kpiLarge}>$9,568</Text>
                <Chip text="▼ 8.6%" tone="danger" style={{ marginLeft: 8, alignSelf: 'center' }} />
              </View>
              <Link href="/settings" asChild>
                <Pressable style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.9 }]}>
                  <Ionicons name="settings-outline" size={16} color="white" />
                  <Text style={{ color: "white", fontWeight: "700", marginLeft: 4 }}>Settings</Text>
                </Pressable>
              </Link>
            </View>

            <View style={{ marginVertical: SPACING.md }}>
              <Sparkline 
                data={[3, 5, 4, 7, 6, 9, 5, 6]} 
                height={80} 
                stroke="#22c55e" 
                fillOpacity={0.2} 
              />
            </View>
          </DashboardCard>

          {/* CARD #2: Key Metrics Summary */}
          <DashboardCard noHeader>
            <View style={styles.kpiContainer}>
              <KPICircle 
                icon="cart-outline" 
                value="85,246" 
                label="Orders" 
                color="#6366f1" 
                bgColor="#e0e7ff"
              />
              <KPICircle 
                icon="cash-outline" 
                value="$96,147" 
                label="Income" 
                color="#10b981" 
                bgColor="#d1fae5"
              />
              <KPICircle 
                icon="notifications-outline" 
                value="846" 
                label="Notifications" 
                color="#f43f5e" 
                bgColor="#ffe4e6"
              />
              <KPICircle 
                icon="wallet-outline" 
                value="$84,472" 
                label="Payment" 
                color="#0ea5e9" 
                bgColor="#e0f2fe"
              />
            </View>
          </DashboardCard>

          {/* CARD #3: Total Users Card */}
          <DashboardCard title="Total Users" showOptions>
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={styles.kpiLarge}>97.4K</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.percentChange, { color: COLORS.success }]}>12.5%</Text>
                <Text style={styles.sub}> from last month</Text>
              </View>
            </View>
            
            <View style={{ marginTop: 16 }}>
              <Sparkline 
                data={[10, 18, 14, 22, 26, 20, 28]} 
                height={70} 
                stroke="#f43f5e"
                fillOpacity={0.1}
              />
            </View>
          </DashboardCard>

          {/* CARD #4: Active Users Card */}
          <DashboardCard title="Active Users" showOptions>
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <RingProgress value={78} size={100} stroke={10} color="#6366f1" label="78%" />
              <Text style={styles.kpi}>42.5K</Text>
              <Text style={styles.sub}>24K users increased from last month</Text>
            </View>
          </DashboardCard>

          {/* CARD #5: Sales & Views Chart */}
          <DashboardCard title="Sales & Views" showOptions>
            <BarMini 
              data={[12, 22, 60, 45, 10, 20, 28, 18, 32, 26, 14, 24]} 
              secondaryData={[8, 15, 40, 30, 8, 14, 22, 16, 25, 18, 10, 20]}
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]}
              height={140}
              style={{ marginVertical: 20 }}
            />
            
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Legend swatch="#3b82f6">Sales</Legend>
              <Legend swatch="#8b5cf6">Views</Legend>
            </View>
          </DashboardCard>

          {/* CARD #6: Sales This Year */}
          <DashboardCard title="Sales This Year">
            <View style={styles.rowStart}>
              <Text style={styles.kpiLarge}>$65,129</Text>
              <Chip text="↑ 8.6%" tone="success" style={{ marginLeft: 8, alignSelf: 'center' }} />
            </View>
            
            <View style={{ marginTop: SPACING.md }}>
              <ProgressBar 
                value={78} 
                height={12}
                color="#3b82f6" 
                style={{ marginVertical: 8 }} 
              />
              <Text style={styles.sub}>285 left to Goal</Text>
            </View>
          </DashboardCard>

          {/* CARD #7: Monthly & Yearly Performance */}
          <DashboardCard noHeader>
            <View style={styles.rowBetween}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={styles.cardTitle}>Monthly</Text>
                <RingProgress value={65} size={100} stroke={10} color="#3b82f6" label="65%" />
                <Text style={[styles.kpi, { marginTop: 8 }]}>65,127</Text>
                <Text style={[styles.percentChange, { color: COLORS.success }]}>16.5% (55.21 USD)</Text>
              </View>
              
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={styles.cardTitle}>Yearly</Text>
                <RingProgress value={84} size={100} stroke={10} color="#8b5cf6" label="84%" />
                <Text style={[styles.kpi, { marginTop: 8 }]}>984,246</Text>
                <Text style={[styles.percentChange, { color: COLORS.success }]}>24.9% (267.35 USD)</Text>
              </View>
            </View>
          </DashboardCard>
          
          {/* CARD #8: Quick Navigation - Example of a new card that fits into the grid */}
          <DashboardCard title="Quick Access">
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <NavButton href="/ecommerce" label="eCommerce" />
              <NavButton href="/widgets" label="Widgets" />
              <NavButton href="/forms" label="Forms" />
              <NavButton href="/settings" label="Settings" />
            </View>
          </DashboardCard>
        </CardGrid>
      </Container>
    </ScrollView>
  );
}

/**
 * CardGrid Component
 * ------------------
 * Creates a grid of equally sized and spaced cards
 * 
 * @param {ReactNode} children - Card components to display in grid
 * @param {number} spacing - Space between cards in pixels
 * @param {number} columns - Number of columns in desktop view
 */
function CardGrid({ children, spacing = 16, columns = 2 }) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      marginLeft: -spacing/2,
      marginRight: -spacing/2,
    }}>
      {React.Children.map(children, (child, index) => (
        <View style={[
          styles.gridItem, 
          { 
            padding: spacing/2, 
            width: `${100/columns}%` 
          }
        ]}>
          {child}
        </View>
      ))}
    </View>
  );
}

/**
 * DashboardCard Component
 * ------------------
 * Wrapper for Card component with consistent styling and optional header
 * 
 * @param {ReactNode} children - Card content
 * @param {string} title - Card title (optional)
 * @param {boolean} showOptions - Whether to show options menu (three dots)
 * @param {boolean} noHeader - Whether to hide header completely
 * @param {Object} style - Additional card styles
 */
function DashboardCard({ children, title, showOptions = false, noHeader = false, style }) {
  return (
    <Card style={[{ height: '100%', minHeight: 220 }, style]}>
      <View style={{ padding: 20, flex: 1 }}>
        {!noHeader && (
          <View style={[styles.rowBetween, { marginBottom: 12 }]}>
            {title && <Text style={styles.cardTitle}>{title}</Text>}
            {showOptions && <Ionicons name="ellipsis-vertical" size={20} color={COLORS.subtext} />}
          </View>
        )}
        {children}
      </View>
    </Card>
  );
}

/**
 * KPICircle Component
 * ------------------
 * Displays a KPI metric with an icon in a colored circle
 */
function KPICircle({ icon, value, label, color = '#3b82f6', bgColor = '#e0f2fe' }) {
  return (
    <View style={styles.kpiCircleContainer}>
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.kpi}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

/**
 * Legend Component
 * ------------------
 * Creates a legend item with a color swatch and label
 */
function Legend({ children, swatch = "#2c8ac0ff", style }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", marginRight: 12 }, style]}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: swatch, marginRight: 6 }} />
      <Text style={{ color: COLORS.subtext }}>{children}</Text>
    </View>
  );
}

/**
 * NavButton Component
 * ------------------
 * Creates a styled navigation button
 */
function NavButton({ href, label }) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: COLORS.primary,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          shadowColor: "#9e3939ff",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          marginRight: 8,
          marginBottom: 8,
          ...(pressed ? { opacity: 0.85 } : null),
        })}
      >
        <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>{label}</Text>
      </Pressable>
    </Link>
  );
}

/**
 * Component Styles
 * ------------------
 * Centralized styles for consistent UI
 */
const styles = StyleSheet.create({
  breadcrumb: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  gridItem: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowStart: {
    flexDirection: "row",
    alignItems: "center",
  },
  kpiLarge: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
  },
  kpi: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  kpiLabel: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 2,
  },
  percentChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  sub: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  kpiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    flex: 1,
  },
  kpiCircleContainer: {
    alignItems: "center",
    flex: 1,
    padding: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
});