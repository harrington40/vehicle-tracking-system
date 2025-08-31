import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/theme';

export default function OSMMap({ 
  vehicles = [], 
  style,
  // Accept but ignore native-specific props
  initialRegion = {},
  showControls = true,
}) {
  // Use demo vehicles if none provided
  const demoVehicles = vehicles.length > 0 ? vehicles : [
    { id: 1, name: "Truck 101", latitude: 37.78825, longitude: -122.4324, status: "moving", speed: 65 },
    { id: 2, name: "Van 202", latitude: 37.78525, longitude: -122.4354, status: "stopped", speed: 0 },
    { id: 3, name: "Car 303", latitude: 37.78925, longitude: -122.4224, status: "idle", speed: 5 },
  ];
  
  // Get marker color based on vehicle status
  const getMarkerColor = (status) => {
    switch(status) {
      case 'moving': return COLORS.primary || '#8BC34A';
      case 'stopped': return COLORS.danger || '#FF5252';
      case 'idle': return COLORS.warning || '#FFC107';
      default: return COLORS.primary || '#8BC34A';
    }
  };

  return (
    <View style={[styles.webPlaceholder, style]}>
      <Ionicons name="map-outline" size={48} color={COLORS.primary} />
      <Text style={styles.placeholderTitle}>Vehicle Map</Text>
      <Text style={styles.placeholderSubtitle}>
        {demoVehicles.length} vehicles currently tracked
      </Text>
      
      <View style={styles.webVehicleList}>
        {demoVehicles.map(vehicle => (
          <View key={vehicle.id} style={styles.webVehicleItem}>
            <View style={[
              styles.webVehicleStatusDot,
              { backgroundColor: getMarkerColor(vehicle.status) }
            ]} />
            <View style={styles.webVehicleInfo}>
              <Text style={styles.webVehicleName}>{vehicle.name}</Text>
              <Text style={styles.webVehicleStatus}>
                {vehicle.status} • {vehicle.speed} km/h
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webPlaceholder: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  placeholderTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text || '#000',
  },
  placeholderSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.subtext || '#666',
    marginBottom: 16,
  },

controlButton: {
  backgroundColor: COLORS.primary || '#8BC34A',
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
  boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  elevation: 3, 
   
},

  webVehicleList: {
    width: '100%',
    marginTop: 16,
  },
  webVehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    width: '100%',
  },
  webVehicleStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  webVehicleInfo: {
    flex: 1,
  },
  webVehicleName: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.text || '#000',
  },
  webVehicleStatus: {
    fontSize: 12,
    color: COLORS.subtext || '#666',
    marginTop: 2,
  },
});