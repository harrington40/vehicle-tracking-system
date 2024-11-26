'use client'; // Required for client components in Next.js 13+

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet'; // Import Leaflet
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css'; // Import marker cluster styles

// Define a custom icon using road.png
const customRoadIcon = new L.Icon({
  iconUrl: '/marker-icon.png', // Path to road.png inmaker-icon the public folder
  iconSize: [50, 50], // Adjust the size as needed
  iconAnchor: [25, 50], // Anchor the icon to its base (middle bottom)
  popupAnchor: [0, -50], // Position the popup above the icon
});

// Define a custom car icon
const carIcon = new L.Icon({
  iconUrl: '/car.svg', // Path to car.png in the public folder
  iconSize: [50, 50], // Adjust the size as needed
  iconAnchor: [25, 25], // Anchor the icon at its center
});

const OSMMap = ({ points }) => {
  const defaultPosition = [6.3156, -10.8072]; // Center the map on Monrovia, Liberia

  // Extract polyline coordinates from the points
  const polylineCoordinates = points.map((point) => [point.lat, point.lon]);

  // Get the last point in the polyline
  const lastPoint = points[points.length - 1];

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: '100vh', width: '100%' }}>
      {/* OSM Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Marker Clusters */}
      <MarkerClusterGroup>
        {points.map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lon]}
            icon={customRoadIcon} // Use the custom road icon
          >
            <Popup>{point.name}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {/* Add Polyline */}
      <Polyline positions={polylineCoordinates} color="red" weight={4} />
      {/* Add Car Icon at the End of the Line */}
      {lastPoint && (
        <Marker position={[lastPoint.lat, lastPoint.lon]} icon={carIcon}>
          <Popup>End of Route</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default OSMMap;
