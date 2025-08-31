import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/theme';

export default function OSMMap({ 
  vehicles = [], 
  initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showControls = true,
  style
}) {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(initialRegion);
  
  // Use demo vehicles if none provided
  const demoVehicles = vehicles.length > 0 ? vehicles : [
    { id: 1, name: "Truck 101", latitude: 37.78825, longitude: -122.4324, status: "moving", speed: 65 },
    { id: 2, name: "Van 202", latitude: 37.78525, longitude: -122.4354, status: "stopped", speed: 0 },
    { id: 3, name: "Car 303", latitude: 37.78925, longitude: -122.4224, status: "idle", speed: 5 },
  ];
  
  // Get marker color based on vehicle status
  const getMarkerColor = (status) => {
    switch(status) {
      case 'moving': return COLORS.primary || '#8BC34A'; // Green
      case 'stopped': return COLORS.danger || '#FF5252'; // Red
      case 'idle': return COLORS.warning || '#FFC107';   // Yellow
      default: return COLORS.primary || '#8BC34A';
    }
  };
  
  const zoomIn = () => {
    mapRef.current?.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    });
  };
  
  const zoomOut = () => {
    mapRef.current?.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    });
  };
  
  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        customMapStyle={mapStyle}
      >
        {demoVehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            coordinate={{ 
              latitude: vehicle.latitude, 
              longitude: vehicle.longitude 
            }}
          >
            <View style={[
              styles.markerContainer, 
              { backgroundColor: getMarkerColor(vehicle.status) }
            ]}>
              <Ionicons 
                name={vehicle.status === 'moving' ? 'car' : 
                      vehicle.status === 'stopped' ? 'square' : 'alert-circle'} 
                size={16} 
                color="#fff" 
              />
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{vehicle.name}</Text>
                <Text style={styles.calloutDetail}>Status: {vehicle.status}</Text>
                <Text style={styles.calloutDetail}>Speed: {vehicle.speed} km/h</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {showControls && (
        <View style={styles.controls}>
          <Pressable style={styles.controlButton} onPress={zoomIn}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
          <Pressable style={styles.controlButton} onPress={zoomOut}>
            <Ionicons name="remove" size={20} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  callout: {
    width: 140,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDetail: {
    fontSize: 12,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  controlButton: {
    backgroundColor: COLORS.primary || '#8BC34A',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
});

// Custom map style to match green theme
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5f5e0"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8BC34A"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];