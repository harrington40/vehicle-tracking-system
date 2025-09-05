import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../lib/theme';

export default function OSMMap({ 
  vehicles = [], 
  style,
  osrmServerUrl = "https://api.transtechologies.com", // ← Your domain
  initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    zoom: 13
  },
  showControls = true,
}) {
  //const { getAccessTokenSilently } = useAuth0();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showVehicleList, setShowVehicleList] = useState(false);
  const iframeRef = useRef(null);

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

  // After iframe loads, fetch token and post to iframe


  // After iframe loads, send demo token
  const onIframeLoad = async () => {
    setIsMapLoaded(true);
    
    // Send demo token for now (remove Auth0 logic)
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "authToken", token: "demo-token-12345" },
        "*"
      );
    }, 1000);
  };


  // Create the map HTML content with Auth0 integration
  const createMapHtml = () => {
    const vehicleMarkers = demoVehicles.map(vehicle => ({
      ...vehicle,
      color: getMarkerColor(vehicle.status)
    }));

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Vehicle Tracking Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .vehicle-popup {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 8px;
            }
            .vehicle-name { font-weight: 600; margin-bottom: 4px; }
            .vehicle-status { font-size: 12px; color: #666; }
            .route-button {
                background: ${COLORS.primary};
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                margin-top: 4px;
            }
            .route-button:hover {
                background: ${COLORS.primaryDark || '#76A934'};
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            let authToken = null;
            let routeLayer = null; // Store current route layer
            
            // Listen for auth token from parent
            window.addEventListener('message', function(event) {
                if (event.data.type === 'authToken') {
                    authToken = event.data.token;
                    console.log('✅ Received auth token from parent');
                }
            });

            // Initialize map
            const map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${initialRegion.zoom});
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Vehicle markers
            const vehicles = ${JSON.stringify(vehicleMarkers)};
            const vehicleMarkers = [];
            
            vehicles.forEach((vehicle, index) => {
                // Create custom marker
                const markerIcon = L.divIcon({
                    html: \`
                        <div style="
                            background-color: \${vehicle.color};
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            border: 2px solid white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        ">
                            <div style="
                                width: 8px;
                                height: 8px;
                                background-color: white;
                                border-radius: 50%;
                            "></div>
                        </div>
                    \`,
                    className: 'vehicle-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                // Add marker to map
                const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: markerIcon })
                    .addTo(map)
                    .bindPopup(\`
                        <div class="vehicle-popup">
                            <div class="vehicle-name">\${vehicle.name}</div>
                            <div class="vehicle-status">Status: \${vehicle.status}</div>
                            <div class="vehicle-status">Speed: \${vehicle.speed} km/h</div>
                            <button class="route-button" onclick="showRouteToVehicle(\${index})">
                                Show Route
                            </button>
                        </div>
                    \`);
                
                vehicleMarkers.push({...vehicle, marker});
            });
            
            // OSRM Integration with Auth0 token
            async function calculateRoute(start, end) {
                if (!authToken) {
                    console.warn('⚠️ No auth token available for OSRM request');
                    return null;
                }
                
                try {
                    console.log('🔄 Making OSRM request to:', '${osrmServerUrl}');
                    
                    const response = await fetch(\`${osrmServerUrl}/route/v1/driving/\${start[1]},\${start[0]};\${end[1]},\${end[0]}?overview=full&geometries=geojson\`, {
                        method: 'GET',
                        headers: {
                            'Authorization': \`Bearer \${authToken}\`,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'omit'
                    });
                    
                    if (!response.ok) {
                        throw new Error(\`OSRM API error: \${response.status} - \${response.statusText}\`);
                    }
                    
                    const data = await response.json();
                    console.log('✅ OSRM response received:', data);
                    
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        
                        // Remove previous route if exists
                        if (routeLayer) {
                            map.removeLayer(routeLayer);
                        }
                        
                        // Add new route
                        routeLayer = L.geoJSON(route.geometry, {
                            style: {
                                color: '${COLORS.primary}',
                                weight: 4,
                                opacity: 0.8
                            }
                        }).addTo(map);
                        
                        // Show route info
                        const distance = (route.distance / 1000).toFixed(1);
                        const duration = Math.round(route.duration / 60);
                        
                        L.popup()
                            .setLatLng([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2])
                            .setContent(\`
                                <div style="text-align: center;">
                                    <strong>Route Info</strong><br>
                                    Distance: \${distance} km<br>
                                    Duration: \${duration} min
                                </div>
                            \`)
                            .openOn(map);
                            
                        return route;
                    }
                } catch (error) {
                    console.error('❌ OSRM routing error:', error);
                    
                    // Show error popup
                    L.popup()
                        .setLatLng([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2])
                        .setContent(\`
                            <div style="text-align: center; color: red;">
                                <strong>Route Error</strong><br>
                                \${error.message}
                            </div>
                        \`)
                        .openOn(map);
                }
                return null;
            }
            
            // Function to show route to a specific vehicle
            window.showRouteToVehicle = function(vehicleIndex) {
                if (vehicleIndex >= vehicles.length) return;
                
                const targetVehicle = vehicles[vehicleIndex];
                const startVehicle = vehicles[0]; // Route from first vehicle
                
                if (targetVehicle && startVehicle && vehicleIndex !== 0) {
                    const start = [startVehicle.latitude, startVehicle.longitude];
                    const end = [targetVehicle.latitude, targetVehicle.longitude];
                    calculateRoute(start, end);
                }
            };
            
            // Demo: Calculate route between first two vehicles after auth
            setTimeout(() => {
                if (authToken && vehicles.length >= 2) {
                    console.log('🚗 Calculating demo route...');
                    const start = [vehicles[0].latitude, vehicles[0].longitude];
                    const end = [vehicles[1].latitude, vehicles[1].longitude];
                    calculateRoute(start, end);
                }
            }, 3000); // Wait 3 seconds for auth token
            
            // Fit map to show all vehicles
            if (vehicles.length > 0) {
                const group = new L.featureGroup(vehicles.map(v => 
                    L.marker([v.latitude, v.longitude])
                ));
                map.fitBounds(group.getBounds().pad(0.1));
            }
            
            // Send ready message to parent
            window.parent.postMessage({type: 'mapReady'}, '*');
        </script>
    </body>
    </html>
    `;
  };

  const handleViewFullMap = () => {
    console.log('Opening full map view');
  };

  const toggleVehicleList = () => {
    setShowVehicleList(!showVehicleList);
  };

  // Web implementation with iframe
  if (Platform.OS === 'web') {
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

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <iframe
            ref={iframeRef}
            srcDoc={createMapHtml()}
            style={styles.mapIframe}
            frameBorder="0"
            onLoad={onIframeLoad}
          />
          
          {!isMapLoaded && (
            <View style={styles.loadingOverlay}>
              <Ionicons name="map-outline" size={48} color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading Interactive Map...</Text>
            </View>
          )}
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
        )}

        {/* View Full Map Button */}
        <TouchableOpacity style={styles.viewMapButton} onPress={handleViewFullMap}>
          <Text style={styles.viewMapButtonText}>View Full Map</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback for non-web platforms (existing placeholder)
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
  // Container for web with notification bar
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 300,
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
  
  // Map Styles
  mapContainer: {
    flex: 1,
    position: 'relative',
    minHeight: 250,
  },
  
  mapIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.subtext,
  },

  // Controls
  vehicleToggle: {
    position: 'absolute',
    top: 70, // Below notification bar
    left: 12,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },

  controlButton: {
    backgroundColor: COLORS.primary || '#8BC34A',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Vehicle List Overlay
  vehicleListOverlay: {
    position: 'absolute',
    top: 70, // Below notification bar
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

  // Fallback placeholder styles (for non-web)
  webPlaceholder: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 20,
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

  topMapCard: {
    height: 280,
    marginBottom: 16,
    borderRadius: 10,
  },

  webVehicleList: {
    width: '100%',
    marginTop: 16,
    maxHeight: 120,
    overflow: 'auto',
  },
  
  webVehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  
  webVehicleStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  
  webVehicleInfo: {
    flex: 1,
  },
  
  webVehicleName: {
    fontWeight: '500',
    fontSize: 12,
    color: COLORS.text,
  },
  
  webVehicleStatus: {
    fontSize: 10,
    color: COLORS.subtext,
    marginTop: 1,
  },
});