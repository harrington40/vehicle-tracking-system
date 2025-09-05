import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { useAuth0 } from "@auth0/auth0-react"; // ← Comment out for now
import { COLORS } from '../../lib/theme';

export default function OSMMap({ 
  vehicles = [], 
  style,
  osrmServerUrl = "https://api.transtechologies.com",
  initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showControls = true,
}) {
  // const { getAccessTokenSilently } = useAuth0(); // ← Comment out for now
  const [isMapReady, setIsMapReady] = useState(true); // Set to true for now
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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

  // Demo route calculation (without Auth0 for now)
  const calculateRoute = async (start, end) => {
    try {
      console.log('🗺️ Demo route calculation:', start, end);
      
      // Show demo alert for now
      Alert.alert(
        'Demo Route Calculated',
        `Route from ${start.name} to ${end.name}\nDistance: ~5.2 km\nDuration: ~12 min`
      );
      
      // TODO: Add real OSRM integration with Auth0 later
      // const token = await getAccessTokenSilently({
      //   authorizationParams: { 
      //     audience: "https://api.transtechologies.com" 
      //   }
      // });
      
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Route Error', 'Unable to calculate route');
    }
  };

  // Handle vehicle selection
  const onVehiclePress = (vehicle) => {
    setSelectedVehicle(vehicle);
    console.log('Selected vehicle:', vehicle.name);
  };

  // Handle route calculation
  const showRouteToVehicle = (targetVehicle) => {
    if (demoVehicles.length > 0) {
      const startVehicle = demoVehicles[0]; // Route from first vehicle
      if (targetVehicle.id !== startVehicle.id) {
        calculateRoute(startVehicle, targetVehicle);
      }
    }
  };

  const toggleVehicleList = () => {
    setShowVehicleList(!showVehicleList);
  };

  const handleViewFullMap = () => {
    console.log('Opening full map view');
    Alert.alert('Full Map', 'Opening full map view...');
  };

  return (
    <View style={[styles.container, style]}>
      {/* Notification Bar */}
      <View style={styles.notificationBar}>
        <View style={styles.notificationIcon}>
          <Ionicons name="checkmark-circle" size={16} color="white" />
        </View>
        <Text style={styles.notificationText}>Stateful & Stateless Notification</Text>
        <View style={styles.progressBar} />
      </View>

      {/* Map Content - Native Placeholder for now */}
      <View style={styles.mapContent}>
        <Ionicons name="map-outline" size={48} color={COLORS.primary} />
        <Text style={styles.mapTitle}>Vehicle Map (Native)</Text>
        <Text style={styles.mapSubtitle}>
          {demoVehicles.length} vehicles currently tracked
        </Text>
        
        {/* Vehicle List */}
        <View style={styles.vehicleList}>
          {demoVehicles.map(vehicle => (
            <TouchableOpacity 
              key={vehicle.id} 
              style={styles.vehicleItem}
              onPress={() => onVehiclePress(vehicle)}
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
                onPress={() => showRouteToVehicle(vehicle)}
              >
                <Ionicons name="navigate-outline" size={16} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vehicle List Toggle */}
      <TouchableOpacity style={styles.vehicleToggle} onPress={toggleVehicleList}>
        <Ionicons 
          name={showVehicleList ? "list" : "car"} 
          size={18} 
          color="white" 
        />
      </TouchableOpacity>

      {/* Vehicle List Overlay */}
      {showVehicleList && (
        <View style={styles.vehicleListOverlay}>
          <View style={styles.vehicleListHeader}>
            <Text style={styles.vehicleListTitle}>Active Vehicles</Text>
            <TouchableOpacity onPress={toggleVehicleList}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.overlayVehicleList}>
            {demoVehicles.map(vehicle => (
              <TouchableOpacity 
                key={vehicle.id} 
                style={styles.overlayVehicleItem}
                onPress={() => showRouteToVehicle(vehicle)}
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
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* View Full Map Button */}
      <TouchableOpacity style={styles.viewMapButton} onPress={handleViewFullMap}>
        <Text style={styles.viewMapButtonText}>View Full Map</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 300,
    position: 'relative',
  },

  // Notification Bar
  notificationBar: {
    backgroundColor: COLORS.primary || '#8BC34A',
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Map Content
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 24,
  },
  mapTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text || '#333',
    textAlign: 'center',
  },
  mapSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.subtext || '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Vehicle List
  vehicleList: {
    width: '100%',
    maxWidth: 320,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.text || '#333',
  },
  vehicleStatus: {
    fontSize: 12,
    color: COLORS.subtext || '#666',
    marginTop: 2,
  },
  routeButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Controls
  vehicleToggle: {
    position: 'absolute',
    top: 70,
    left: 12,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Vehicle List Overlay
  vehicleListOverlay: {
    position: 'absolute',
    top: 70,
    left: 56,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  vehicleListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  overlayVehicleList: {
    maxHeight: 120,
  },
  overlayVehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  // View Full Map Button
  viewMapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMapButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
});