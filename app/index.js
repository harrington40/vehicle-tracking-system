import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions, Image } from "react-native";
import { COLORS, SPACING } from "../lib/theme";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Sparkline from "../components/charts/Sparkline";
import BarMini from "../components/charts/BarMini";
import Chip from "../components/ui/Chip";
import ProgressBar from "../components/ui/ProgressBar";
import RingProgress from "../components/ui/RingProgress";
import MapView from "../components/maps/MapView"; // Import the cross-platform MapView component
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import NestedTableRN from '../components/nested-table/NestedTableRN';
import { LinearGradient } from 'expo-linear-gradient';

// Geofence additions
import GeofenceLayer from "../components/geoFence/geofenceLayer.js";
import GeofenceEventList from "../components/geoFence/geofenceEventList.js";
import { GeofenceService } from "../lib/geofence/geofenceService.js";
import { createCircle, createPolygon } from "../lib/geofence/model.js";
import { useGeofenceEvents } from "../hooks/geofence/useGeofenceEvent.js";

import { useAuth } from "../lib/authContext";

// Initialize geofence service
const geofenceService = new GeofenceService();

export default function Dashboard() {
  // Maximum content width in pixels
  const MAX = 1280;
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { session, loading } = useAuth();

  // Demo vehicle data for the map - MOVE THIS UP before any useEffect that uses it
  const liveVehicleData = [
    { id: 1, name: "Truck 101", latitude: 37.78825, longitude: -122.4324, status: "moving", speed: 65 },
    { id: 2, name: "Van 202", latitude: 37.78525, longitude: -122.4354, status: "stopped", speed: 0 },
    { id: 3, name: "Car 303", latitude: 37.78925, longitude: -122.4224, status: "idle", speed: 5 },
    { id: 4, name: "Delivery 404", latitude: 37.79025, longitude: -122.4124, status: "moving", speed: 45 },
  ];

  // Geofence events hook
  const geofenceEvents = useGeofenceEvents();
  const [webMap, setWebMap] = useState(null); // Add this for the map reference

  // Load sample geofences once (circle + polygon example)
  useEffect(() => {
    geofenceService.load([
      createCircle({
        id: 'hq-yard',
        name: 'HQ Yard',
        center: { lat: 37.78825, lng: -122.4324 },
        radiusMeters: 400,
        color: '#16a34a'
      }),
      createPolygon({
        id: 'corridor-1',
        name: 'Downtown Zone',
        coordinates: [
          [37.7875, -122.4400],
          [37.7920, -122.4385],
          [37.7932, -122.4288],
          [37.7890, -122.4250],
          [37.7852, -122.4302],
        ],
        color: '#dc2626'
      })
    ]);
  }, []);

  // Evaluate static positions (replace with real-time feed for production)
  useEffect(() => {
    const now = Date.now();
    liveVehicleData.forEach(v => {
      geofenceService.evaluateLocation({
        id: v.id,
        lat: v.latitude,
        lng: v.longitude,
        speedKph: v.speed,
        timestamp: now
      });
    });
  }, [liveVehicleData]);

  // Placeholder while checking / redirecting
  if (loading || !session) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor:"#f5f7fa" }}>
        <Text style={{ color:"#64748b" }}>Authenticating...</Text>
      </View>
    );
  }
  
  // Calculate card dimensions and layout
  const cardSpacing = 16; // Space between cards
  const containerPadding = 16; // Padding on container sides
  const availableWidth = Math.min(width - (containerPadding * 2), MAX);

  // Demo vehicle tracking data for the NestedTableRN - FIXED incomplete array
  const vehicleTrackingData = [
    {
      id: 1,
      vehicle: "Truck 101",
      driver: "John Smith",
      status: "Moving",
      location: "Highway 101, CA",
      lastUpdate: "2 min ago",
      events: [
        { timestamp: "14:30", event: "Started Route", location: "Warehouse A", details: "Loaded 15 packages" },
        { timestamp: "14:45", event: "Speed Alert", location: "Highway 101", details: "Exceeded 75 mph" },
        { timestamp: "15:00", event: "Rest Stop", location: "Rest Area B", details: "15 min break" },
      ]
    },
    {
      id: 2,
      vehicle: "Van 202",
      driver: "Sarah Johnson",
      status: "Stopped",
      location: "Downtown SF",
      lastUpdate: "5 min ago",
      events: [
        { timestamp: "13:15", event: "Delivery", location: "123 Main St", details: "Package delivered" },
        { timestamp: "13:45", event: "Stopped", location: "Downtown SF", details: "Engine off" },
      ]
    },
    {
      id: 3,
      vehicle: "Car 303",
      driver: "Mike Davis",
      status: "Idle",
      location: "Office Parking",
      lastUpdate: "1 min ago",
      events: [
        { timestamp: "12:00", event: "Arrived", location: "Office Parking", details: "End of route" },
        { timestamp: "12:30", event: "Maintenance", location: "Office Parking", details: "Scheduled check" },
      ]
    },
    {
      id: 4,
      vehicle: "Delivery 404",
      driver: "Alex Wilson",
      status: "Moving",
      location: "Interstate 280",
      lastUpdate: "3 min ago",
      events: [
        { timestamp: "11:45", event: "Started Route", location: "Distribution Center", details: "Loaded 22 packages" },
        { timestamp: "12:15", event: "Delivery", location: "456 Oak Ave", details: "Package delivered" },
        { timestamp: "12:45", event: "Route Change", location: "Interstate 280", details: "Traffic reroute" },
      ]
    },
    {
      id: 5,
      vehicle: "Truck 205",
      driver: "Maria Garcia",
      status: "Loading",
      location: "Warehouse B",
      lastUpdate: "8 min ago",
      events: [
        { timestamp: "10:30", event: "Arrived", location: "Warehouse B", details: "Ready for loading" },
        { timestamp: "10:45", event: "Loading", location: "Warehouse B", details: "Loading in progress" },
      ]
    },
  ];


  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <Container maxWidth={MAX} style={{ paddingHorizontal: containerPadding, paddingVertical: 20 }}>
      
        {/* Page header with breadcrumb navigation and avatar */}
        <View style={styles.pageHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.breadcrumb}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>·Vehicle Tracking</Text>
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

        {/* FIRST ROW: Vehicle Map Card with Cross-Platform MapView */}
        <CardGrid spacing={cardSpacing} columns={1}>
          <DashboardCard 
            title="Vehicle Tracking Map" 
            showOptions 
            style={styles.topMapCard}
            padding={0} // Remove padding to let MapView handle its own spacing
          >
            {/* Cross-Platform MapView with OSRM Integration */}
            <MapView 
              osrmServerUrl="https://api.transtechologies.com"
              vehicles={liveVehicleData}
              style={styles.mapViewStyle}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
                zoom: 13
              }}
              showControls={true}
               onWebMapReady={setWebMap} 
            
            
            
            
            
            
            
            
            
            
            
            
            >
                <GeofenceLayer geofences={geofenceService.geofences} map={webMap} />
            </MapView>
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
                { icon: "car-outline", value: "12", label: "Active Vehicles", color: COLORS.primary, bgColor: COLORS.primaryLight || "#e0e7ff" },
                { icon: "location-outline", value: "3,247", label: "Total Miles", color: COLORS.success || "#10b981", bgColor: "#d1fae5" },
                { icon: "notifications-outline", value: "5", label: "Alerts", color: COLORS.danger || "#f43f5e", bgColor: "#ffe4e6" },
                { icon: "time-outline", value: "98.2%", label: "Uptime", color: COLORS.info || "#0ea5e9", bgColor: "#e0f2fe" }
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
          <DashboardCard title="Fleet Efficiency" showOptions>
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={styles.kpiLarge}>94.7%</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.percentChange, { color: COLORS.success }]}>+2.1%</Text>
                <Text style={styles.sub}> from last month</Text>
              </View>
            </View>
            
            <View style={{ marginTop: 16 }}>
              <Sparkline 
                data={[88, 91, 87, 94, 96, 92, 94]} 
                height={70} 
                stroke={COLORS.primary}
                fillOpacity={0.1}
              />
            </View>
          </DashboardCard>

          {/* CARD #4: Active Users Card */}
          <DashboardCard title="Vehicle Status" showOptions>
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <RingProgress value={75} size={100} stroke={10} color={COLORS.primary} label="75%" />
              <Text style={styles.kpi}>9/12</Text>
              <Text style={styles.sub}>vehicles currently active</Text>
            </View>
          </DashboardCard>

          {/* CARD #5: Sales & Views Chart with Performance Metrics */}
          <DashboardCard title="Fleet Performance" showOptions columnSpan={2} style={{ minHeight: 420 }}>
            <BarMini 
              data={[450, 380, 420, 380, 340, 380, 450, 420, 480, 460, 390, 440]} 
              secondaryData={[320, 280, 310, 290, 260, 290, 340, 310, 360, 340, 290, 330]}
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]}
              height={220}
              style={{ marginVertical: 20 }}
              barColors={[COLORS.primary, "#8b5cf6"]} // Green and Purple
            />
            
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <Legend swatch={COLORS.primary}>Distance (km)</Legend>
              <Legend swatch="#8b5cf6">Fuel Usage (L)</Legend>
            </View>

            {/* Horizontal divider */}
            <View style={{ height: 1, backgroundColor: '#e2e8f0', marginBottom: 20 }} />
            
            {/* Three ring progress circles with vertical dividers */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
              {/* First ring progress */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Fuel Efficiency</Text>
                <RingProgress value={82} size={80} stroke={8} color={COLORS.primary} label="82%" />
                <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>12.4L/100km</Text>
              </View>
              
              {/* First vertical divider */}
              <View style={{ width: 1, height: 120, backgroundColor: '#e2e8f0' }} />
              
              {/* Second ring progress */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Route Optimization</Text>
                <RingProgress value={76} size={80} stroke={8} color="#8b5cf6" label="76%" />
                <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>Optimized</Text>
              </View>
              
              {/* Second vertical divider */}
              <View style={{ width: 1, height: 120, backgroundColor: '#e2e8f0' }} />
              
              {/* Third ring progress */}
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>On-Time Delivery</Text>
                <RingProgress value={94} size={80} stroke={8} color={COLORS.success} label="94%" />
                <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 8 }}>Deliveries</Text>
              </View>
            </View>
          </DashboardCard>

          {/* CARD #6: Monthly Revenue */}
          <DashboardCard title="Monthly Revenue" style={{ 
           minHeight: 200,
           maxWidth: 650
           }}>
            <View style={styles.rowStart}>
              <Text style={styles.kpiLarge}>$45,129</Text>
              <Chip text="↑ 12.3%" tone="success" style={{ marginLeft: 8, alignSelf: 'center' }} />
            </View>
            
            <View style={{ marginTop: SPACING.md }}>
              <ProgressBar 
                value={68} 
                height={12}
                color={COLORS.primary} 
                style={{ marginVertical: 8 }} 
              />
              <Text style={styles.sub}>$15K left to monthly goal</Text>
            </View>
          </DashboardCard>

          {/* CARD #7: Monthly & Yearly Performance */}
          <DashboardCard noHeader>
            <View style={styles.rowBetween}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={styles.cardTitle}>This Month</Text>
                <RingProgress value={68} size={100} stroke={10} color={COLORS.primary} label="68%" />
                <Text style={[styles.kpi, { marginTop: 8 }]}>2,847 km</Text>
                <Text style={[styles.percentChange, { color: COLORS.success }]}>+8.2% vs last month</Text>
              </View>
              
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={styles.cardTitle}>This Year</Text>
                <RingProgress value={84} size={100} stroke={10} color="#8b5cf6" label="84%" />
                <Text style={[styles.kpi, { marginTop: 8 }]}>34,128 km</Text>
                <Text style={[styles.percentChange, { color: COLORS.success }]}>+15.7% vs last year</Text>
              </View>
            </View>
          </DashboardCard>
          
  
            {/* CARD #8: Vehicle Activity Log - NestedTableRN */}
          <DashboardCard title="Vehicle Activity Log" showOptions>
            <NestedTableRN
              data={vehicleTrackingData}
              configuration={{
                detailsTemplate: true,
                tableLayout: { hover: true },
                testID: "vehicle-activity-table"
              }}
              pagination={true}
              initialRowsPerPage={3}
              zebra={true}
              stickyHeader={false} // Disable sticky header in card
              style={{ flex: 1, marginTop: 8 }}
              onRowClickEvent={(event, index) => {
                console.log('Vehicle row clicked:', index);
              }}
            />
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
function CardGrid({ children, spacing, columns }) {
  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing / 2,
      marginVertical: spacing / 2,
    }}>
      {React.Children.map(children, (child, index) => {
        const cardStyle = {
          width: columns === 1 ? '100%' : '50%',
          paddingHorizontal: spacing / 2,
          paddingVertical: spacing / 2,
        };
        
        return (
          <View style={cardStyle}>
            {child}
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
    topMapCard: {
    minHeight: 350,
    maxHeight: 450,
    marginBottom: 16,
    borderRadius: 12,
  },

  mapViewStyle: {
    flex: 1,
    minHeight: 320,
    borderRadius: 12,
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