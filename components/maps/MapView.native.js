import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapViewNative, { UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/theme';

export default function OSMMap({
  vehicles = [],
  style,
  initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showControls = true,
  children,
}) {
  const [showVehicleList, setShowVehicleList] = useState(false);
  const demoVehicles = vehicles.length ? vehicles : [
    { id: 1, name: "Truck 101", latitude: 37.78825, longitude: -122.4324, status: "moving", speed: 65 },
    { id: 2, name: "Van 202", latitude: 37.78525, longitude: -122.4354, status: "stopped", speed: 0 },
    { id: 3, name: "Car 303", latitude: 37.78925, longitude: -122.4224, status: "idle", speed: 5 },
  ];

  const getMarkerColor = (status) => {
    switch (status) {
      case 'moving': return COLORS.primary || '#8BC34A';
      case 'stopped': return COLORS.danger || '#FF5252';
      case 'idle': return COLORS.warning || '#FFC107';
      default: return COLORS.primary || '#8BC34A';
    }
  };

  const calculateRoute = async (start, end) => {
    Alert.alert('Demo Route', `Route from ${start.name} to ${end.name}\n~5.2 km · ~12 min`);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Map layer */}
      <MapViewNative
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsCompass={!!showControls}
      >
        {/* OSM raster tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          zIndex={-1}
        />
        {/* Geofence overlays and other children */}
        {children}
      </MapViewNative>

      {/* UI overlays (existing content) */}
      <View style={styles.notificationBar}>
        <View style={styles.notificationIcon}>
          <Ionicons name="checkmark-circle" size={16} color="white" />
        </View>
        <Text style={styles.notificationText}>Stateful & Stateless Notification</Text>
        <View style={styles.progressBar} />
      </View>

      <View style={styles.mapContent}>
        <Ionicons name="map-outline" size={48} color={COLORS.primary} />
        <Text style={styles.mapTitle}>Vehicle Map (Native)</Text>
        <Text style={styles.mapSubtitle}>
          {demoVehicles.length} vehicles currently tracked
        </Text>
        <View style={styles.vehicleList}>
          {demoVehicles.map(vehicle => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleItem}
              onPress={() => {}}
            >
              <View style={[
                styles.vehicleStatusDot,
                { backgroundColor: getMarkerColor(vehicle.status) }
              ]} />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleStatus}>
                  {vehicle.status} • {vehicle.speed} km/h
                </Text>
              </View>
              <TouchableOpacity
                style={styles.routeButton}
                onPress={() => calculateRoute(demoVehicles[0], vehicle)}
              >
                <Ionicons name="navigate-outline" size={16} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.vehicleToggle} onPress={() => setShowVehicleList(v => !v)}>
        <Ionicons name={showVehicleList ? "list" : "car"} size={18} color="white" />
      </TouchableOpacity>

      {showVehicleList && (
        <View style={styles.vehicleListOverlay}>
          <View style={styles.vehicleListHeader}>
            <Text style={styles.vehicleListTitle}>Active Vehicles</Text>
            <TouchableOpacity onPress={() => setShowVehicleList(false)}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.overlayVehicleList}>
            {demoVehicles.map(vehicle => (
              <TouchableOpacity key={vehicle.id} style={styles.overlayVehicleItem}>
                <View style={[
                  styles.vehicleStatusDot,
                  { backgroundColor: getMarkerColor(vehicle.status) }
                ]} />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehicleStatus}>
                    {vehicle.status} • {vehicle.speed} km/h
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.viewMapButton} onPress={() => Alert.alert('Full Map', 'Opening full map view...')}>
        <Text style={styles.viewMapButtonText}>View Full Map</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f8fafc', borderRadius: 12, overflow: 'hidden', minHeight: 300, position: 'relative' },
  notificationBar: { backgroundColor: COLORS.primary || '#8BC34A', padding: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 10 },
  notificationIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  notificationText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
  progressBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  mapContent: { alignItems: 'center', justifyContent: 'flex-start', padding: 16, paddingTop: 24 },
  mapTitle: { marginTop: 16, fontSize: 20, fontWeight: '600', color: COLORS.text || '#333', textAlign: 'center' },
  mapSubtitle: { marginTop: 8, fontSize: 14, color: COLORS.subtext || '#666', textAlign: 'center', marginBottom: 20 },
  vehicleList: { width: '100%', maxWidth: 320 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'white', borderRadius: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  vehicleStatusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontWeight: '600', fontSize: 14, color: COLORS.text || '#333' },
  vehicleStatus: { fontSize: 12, color: COLORS.subtext || '#666', marginTop: 2 },
  routeButton: { backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  vehicleToggle: { position: 'absolute', top: 70, left: 12, backgroundColor: COLORS.primary, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  vehicleListOverlay: { position: 'absolute', top: 70, left: 56, right: 12, backgroundColor: 'white', borderRadius: 8, maxHeight: 200, zIndex: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  vehicleListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  vehicleListTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  overlayVehicleList: { maxHeight: 120 },
  overlayVehicleItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  viewMapButton: { position: 'absolute', bottom: 12, right: 12, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  viewMapButtonText: { color: 'white', fontSize: 12, fontWeight: '600', marginRight: 6 },
});