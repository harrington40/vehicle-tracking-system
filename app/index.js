import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions, Image } from "react-native";
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
        {/* Page header with breadcrumb navigation and avatar */}
        <View style={styles.pageHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.breadcrumb}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>· eCommerce</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Link href="/settings" asChild>
              <Pressable style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.9 }]}>
                <Text style={{ color: "white", fontWeight: "700", marginRight: 4 }}>Settings</Text>
                <Ionicons name="chevron-down" size={16} color="white" />
              </Pressable>
            </Link>
            
            {/* Avatar */}
            <Pressable style={styles.avatar}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatarImage}
              />
            </Pressable>
          </View>
        </View>

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

          {/* CARD #2: Key Metrics Summary with Vertical Dividers */}
          <DashboardCard noHeader style={{ padding: 0 }}>
            <View style={styles.metricsContainer}>
              {[
                { icon: "cart-outline", value: "85,246", label: "Orders", color: "#6366f1", bgColor: "#e0e7ff" },
                { icon: "print-outline", value: "$96,147", label: "Income", color: "#10b981", bgColor: "#d1fae5" },
                { icon: "notifications-outline", value: "846", label: "Notifications", color: "#f43f5e", bgColor: "#ffe4e6" },
                { icon: "card-outline", value: "$84,472", label: "Payment", color: "#0ea5e9", bgColor: "#e0f2fe" }
              ].map((metric, index, array) => (
                <View key={index} style={styles.metricColumn}>
                  <View style={styles.metricContent}>
                    <View style={[styles.iconCircle, { backgroundColor: metric.bgColor }]}>
                      <Ionicons name={metric.icon} size={24} color={metric.color} />
                    </View>
                    <Text style={styles.kpi}>{metric.value}</Text>
                    <Text style={styles.kpiLabel}>{metric.label}</Text>
                  </View>
                  
                  {/* Add divider after each metric except the last one */}
                  {index < array.length - 1 && (
                    <View style={styles.metricDivider} />
                  )}
                </View>
              ))}
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
 // Update Card #5 (Sales & Views Chart)

{/* CARD #5: Sales & Views Chart with Performance Metrics */}
<DashboardCard title="Sales & Views" showOptions columnSpan={2} style={{ minHeight: 42-0 }}>
  <BarMini 
    data={[12, 22, 60, 45, 10, 20, 28, 18, 32, 26, 14, 24]} 
    secondaryData={[8, 15, 40, 30, 8, 14, 22, 16, 25, 18, 10, 20]}
    labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]}
    height={220}
    style={{ marginVertical: 20 }}
    barColors={["#3b82f6", "#8b5cf6"]} // Blue and Purple
  />
  
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
    <Legend swatch="#3b82f6">Sales</Legend>
    <Legend swatch="#8b5cf6">Views</Legend>
  </View>

  {/* Horizontal divider */}
  <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 20 }} />
  
  {/* Three ring progress circles with vertical dividers */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
    {/* First ring progress */}
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Conversion</Text>
      <RingProgress value={68} size={80} stroke={8} color="#3b82f6" label="68%" />
      <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>35,462</Text>
    </View>
    
    {/* First vertical divider */}
    <View style={{ width: 1, height: 120, backgroundColor: '#e2e8f0' }} />
    
    {/* Second ring progress */}
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Engagement</Text>
      <RingProgress value={52} size={80} stroke={8} color="#8b5cf6" label="52%" />
      <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>23,594</Text>
    </View>
    
    {/* Second vertical divider */}
    <View style={{ width: 1, height: 120, backgroundColor: '#e2e8f0' }} />
    
    {/* Third ring progress */}
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Retention</Text>
      <RingProgress value={89} size={80} stroke={8} color="#10b981" label="89%" />
      <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>12,047</Text>
    </View>
  </View>
</DashboardCard>

          {/* CARD #6: Sales This Year */}
          <DashboardCard title="Sales This Year" style={{ 
           minHeight: 200,
           maxWidth: 600
           }}>
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
 */
/**
 * CardGrid Component
 * ------------------
 * Creates a grid of equally sized and spaced cards
 */
function CardGrid({ children, spacing = 16, columns = 2 }) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      marginLeft: -spacing/2,
      marginRight: -spacing/2,
    }}>
      {React.Children.map(children, (child, index) => {
        // Check if child is valid and has props before accessing columnSpan
        const columnSpan = child && child.props && child.props.columnSpan ? child.props.columnSpan : 1;
        
        return (
          <View style={[
            styles.gridItem, 
            { 
              padding: spacing/2, 
              width: `${(100/columns) * columnSpan}%` 
            }
          ]}>
            {child && React.isValidElement(child) ? 
              React.cloneElement(child, {
                style: {
                  ...(child.props.style || {}),
                  height: child.props.expandHeight ? '100%' : undefined,
                }
              }) : child}
          </View>
        );
      })}
    </View>
  );
}

/**
 * DashboardCard Component
 * ------------------
 * Wrapper for Card component with consistent styling and optional header
 */
/**
 * DashboardCard Component
 * ------------------
 * Wrapper for Card component with consistent styling and optional header
 */
function DashboardCard({ children, title, showOptions = false, noHeader = false, style = {} }) {
  // Set a default empty object for style
  
  return (
    <Card style={[{ height: '100%', minHeight: 220 }, style]}>
      <View style={[
        { padding: 20, flex: 1 },
        // Safely check if style exists and has a padding property
        style && typeof style === 'object' && style.padding !== undefined ? { padding: style.padding } : null
      ]}>
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
  // Header styles
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  headerSubtitle: {
    color: COLORS.subtext, 
    fontSize: 14, 
    marginLeft: 4, 
    alignSelf: 'flex-end'
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginLeft: 16,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9', // Fallback
  },
  

  // Styles for ring progress metrics
  horizontalDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricColumn: {
    alignItems: 'center', 
    flex: 1,
  },
  metricLabel: {
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 8,
  },
  verticalDivider: {
    width: 1, 
    height: 120, 
    backgroundColor: '#e2e8f0',
  },


  // General styles
  breadcrumb: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
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
  
  // Text styles
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
  
  // Button styles
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  // KPI Metric container with dividers
  metricsContainer: {
    flexDirection: "row",
    padding: 20,
    flex: 1,
    position: 'relative',
  },
  metricColumn: {
    flex: 1,
    position: 'relative',
  },
  metricContent: {
    alignItems: "center",
    padding: 10,
  },
  metricDivider: {
    position: 'absolute',
    top: '15%',
    right: 0,
    width: 1,
    height: '70%',
    backgroundColor: '#e2e8f0',
  },
  
  // Legacy KPI styles for backward compatibility
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