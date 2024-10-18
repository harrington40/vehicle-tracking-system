"use client";  // Mark this as a client component

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const [isClient, setIsClient] = useState(false);
  const [route, setRoute] = useState(null); // State for route coordinates

  // Start and end points for the route
  const start = [6.4281, -10.7969]; // Start point in Liberia
  const end = [6.4343, -10.6987];   // End point in Liberia

  // Additional markers with coordinates in Liberia
  const additionalMarkers = [
    { position: [6.3000, -10.7000], popup: "Marker 1" },
    { position: [6.4000, -10.6500], popup: "Marker 2" },
    { position: [6.4500, -10.6200], popup: "Marker 3" },
    { position: [6.4700, -10.6000], popup: "Marker 4" },
    { position: [6.4800, -10.5900], popup: "Marker 5" },
    { position: [6.4900, -10.5800], popup: "Marker 6" },
    { position: [6.5000, -10.5700], popup: "Marker 7" },
    { position: [6.5100, -10.5600], popup: "Marker 8" },
  ];

  useEffect(() => {
    setIsClient(true);

    // Fetch route from OSRM backend
    const fetchRoute = async () => {
      const osrmUrl = `http://127.0.0.1:5000/route/v1/driving/-10.7969,6.4281;-10.6987,6.4343?overview=full&geometries=geojson`;

      try {
        const response = await fetch(osrmUrl);
        const data = await response.json();
        console.log('OSRM Response:', data); // Log the entire response for debugging

        if (data.routes && data.routes.length > 0) {
          // Map the coordinates correctly (OSRM returns [lon, lat], Leaflet needs [lat, lon])
          const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          console.log('Route Coordinates:', coordinates); // Log the coordinates to check

          // Check if the last coordinate matches the endpoint, if not, add it manually
          if (coordinates[coordinates.length - 1][0] !== end[0] || coordinates[coordinates.length - 1][1] !== end[1]) {
            console.log('Adding missing endpoint to the route');
            coordinates.push(end);  // Add endpoint if missing
          }

          setRoute(coordinates); // Set the route data
        } else {
          console.warn('No routes found.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, []);

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  return (
    <MapContainer center={start} zoom={13} style={{ height: '100vh', width: '100%' }} id="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={start}>
        <Popup>Start Point</Popup>
      </Marker>
      <Marker position={end}>
        <Popup>End Point</Popup>
      </Marker>

      {/* Render additional markers */}
      {additionalMarkers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}

      {/* Render the route */}
      {route && route.length > 0 && <Polyline positions={route} color="blue" />}
    </MapContainer>
  );
};

export default MapComponent;
