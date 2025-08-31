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
import OSMMap from '../components/maps/MapView';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Dashboard Component
 * ------------------
 * Main dashboard view with uniformly sized and spaced cards
 */
export default function Dashboard() {
  // Maximum content width in pixels
  const MAX = 1280;
  const { width } = useWindowDimensions();
  const router = useRouter();
  
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
            <Text style={styles.headerSubtitle}>·eCommerce</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* Notification Bell with Badge */}
            <Pressable style={styles.notificationBell}>
              <Ionicons name="notifications-outline" size={22} color="#64748b" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </Pressable>

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

        {/* FIRST ROW: Vehicle Map Card with OSM integration */}
        <CardGrid spacing={cardSpacing} columns={1}>
          <DashboardCard 
            title="Vehicle Map" 
            showOptions 
            style={{ 
              minHeight: 320,
              maxHeight: 420,
              marginBottom: 16
            }}
          >
            {/* Compact notification banner with green theme */}
            <View style={styles.compactNotificationBanner}>
              <View style={styles.compactNotificationIcon}>
                <Ionicons name="notifications" size={18} color="#fff" />
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationDotText}>3</Text>
                </View>
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.compactNotificationTitle}>Stateful & Stateless Notification</Text>
                <View style={styles.notificationBar} />
              </View>
            </View>
            
            {/* OpenStreetMap Integration */}
            <View style={styles.mapWrapper}>
              {typeof OSMMap !== 'undefined' ? (
                <OSMMap 
                  style={{flex: 1, height: 260, borderRadius: 8}}
                  vehicles={[
                    { id: 1, name: "Truck 101", latitude: 37.78825, longitude: -122.4324, status: "moving", speed: 65 },
                    { id: 2, name: "Van 202", latitude: 37.78525, longitude: -122.4354, status: "stopped", speed: 0 },
                    { id: 3, name: "Car 303", latitude: 37.78925, longitude: -122.4224, status: "idle", speed: 5 },
                  ]}
                />
              ) : (
                <View style={styles.mapContainer}>
                  <Ionicons name="map-outline" size={48} color={COLORS.primary} />
                  <Text style={styles.mapPlaceholderText}>Vehicle Map</Text>
                </View>
              )}
            </View>
            
            {/* View full map button */}
            <View style={styles.viewMapButtonContainer}>
              <Button
                title="View Full Map"
                iconRight="arrow-forward"
                variant="filled"
                size="small"
                onPress={() => router.push('/tracking')}
                style={{backgroundColor: COLORS.primary, alignSelf: 'flex-end', marginTop: 10}}
              />
            </View>
          </DashboardCard>
        </CardGrid>

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
                <Pressable style={({ pressed }) => [
                  styles.settingsBtn, 
                  { backgroundColor: COLORS.primary },
                  pressed && { opacity: 0.9 }
                ]}>
                  <Ionicons name="settings-outline" size={16} color="white" />
                  <Text style={{ color: "white", fontWeight: "700", marginLeft: 4 }}>Settings</Text>
                </Pressable>
              </Link>
            </View>

            <View style={{ marginVertical: SPACING.md }}>
              <Sparkline 
                data={[3, 5, 4, 7, 6, 9, 5, 6]} 
                height={80} 
                stroke={COLORS.primary} 
                fillOpacity={0.2} 
              />
            </View>
          </DashboardCard>

          {/* CARD #2: Key Metrics Summary with Vertical Dividers */}
          <DashboardCard noHeader style={{ padding: 0 }}>
            <View style={styles.metricsContainer}>
              {[
                { icon: "cart-outline", value: "85,246", label: "Orders", color: COLORS.primary, bgColor: COLORS.primaryLight || "#e0e7ff" },
                { icon: "print-outline", value: "$96,147", label: "Income", color: COLORS.success || "#10b981", bgColor: "#d1fae5" },
                { icon: "notifications-outline", value: "846", label: "Notifications", color: COLORS.danger || "#f43f5e", bgColor: "#ffe4e6" },
                { icon: "card-outline", value: "$84,472", label: "Payment", color: COLORS.info || "#0ea5e9", bgColor: "#e0f2fe" }
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
                stroke={COLORS.primary}
                fillOpacity={0.1}
              />
            </View>
          </DashboardCard>

          {/* CARD #4: Active Users Card */}
          <DashboardCard title="Active Users" showOptions>
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <RingProgress value={78} size={100} stroke={10} color={COLORS.primary} label="78%" />
              <Text style={styles.kpi}>42.5K</Text>
              <Text style={styles.sub}>24K users increased from last month</Text>
            </View>
          </DashboardCard>

          {/* CARD #5: Sales & Views Chart with Performance Metrics */}
          <DashboardCard title="Sales & Views" showOptions columnSpan={2} style={{ minHeight: 420 }}>
            <BarMini 
              data={[12, 22, 60, 45, 10, 20, 28, 18, 32, 26, 14, 24]} 
              secondaryData={[8, 15, 40, 30, 8, 14, 22, 16, 25, 18, 10, 20]}
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]}
              height={220}
              style={{ marginVertical: 20 }}
              barColors={[COLORS.primary, "#8b5cf6"]} // Green and Purple
            />
            
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <Legend swatch={COLORS.primary}>Sales</Legend>
              <Legend swatch="#8b5cf6">Views</Legend>
            </View>

            {/* Horizontal divider */}
            <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 20 }} />
            
            {/* Three ring progress circles with vertical dividers */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
              {/* First ring progress */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Conversion</Text>
                <RingProgress value={68} size={80} stroke={8} color={COLORS.primary} label="68%" />
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
                <RingProgress value={89} size={80} stroke={8} color={COLORS.success} label="89%" />
                <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>12,047</Text>
              </View>
            </View>
          </DashboardCard>

          {/* CARD #6: Sales This Year */}
          <DashboardCard title="Sales This Year" style={{ 
           minHeight: 200,
           maxWidth: 650
           }}>
            <View style={styles.rowStart}>
              <Text style={styles.kpiLarge}>$65,129</Text>
              <Chip text="↑ 8.6%" tone="success" style={{ marginLeft: 8, alignSelf: 'center' }} />
            </View>
            
            <View style={{ marginTop: SPACING.md }}>
              <ProgressBar 
                value={78} 
                height={12}
                color={COLORS.primary} 
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
                <RingProgress value={65} size={100} stroke={10} color={COLORS.primary} label="65%" />
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
function DashboardCard({ children, title, showOptions = false, noHeader = false, style = {}, padding }) {
  // Set a default padding value if not specified in style
  const cardPadding = padding !== undefined ? padding : 
    (style && typeof style === 'object' && style.padding !== undefined ? style.padding : 20);
  
  return (
    <Card style={[{ height: '100%', minHeight: 220 }, style]}>
      <View style={[
        { padding: cardPadding, flex: 1 }
      ]}>
        {!noHeader && (
          <View style={[styles.rowBetween, { marginBottom: 12 }]}>
            {title && <Text style={styles.cardTitle}>{title}</Text>}
            {showOptions && (
              <Pressable style={({ pressed }) => pressed && { opacity: 0.7 }}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.subtext} />
              </Pressable>
            )}
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
function KPICircle({ icon, value, label, color = COLORS.primary, bgColor = '#e0f2fe' }) {
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
          shadowColor: "#000",
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

  // Compact Notification Banner Styles with green theme
  compactNotificationBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  compactNotificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  compactNotificationTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    width: '80%',
  },

  // Vehicle Map styles
  mapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 6,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
  },
  mapWrapper: {
    flex: 1,
    minHeight: 260,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewMapButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
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

  // Notification Banner Styles
  notificationBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notificationDotText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  // Header Notification Bell Styles
  notificationBell: {
    position: 'relative',
    marginLeft: 16,
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f5f7fa',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});