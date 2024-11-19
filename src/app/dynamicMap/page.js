import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';

// Component for adding click-to-set markers
const SetMarkers = ({ setStart, setEnd }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      // Dynamically set start or end point
      setStart((prev) => (prev ? prev : [lat, lng]));
      setEnd((prev) => (prev && !prev ? [lat, lng] : prev));
    },
  });

  return null;
};

export default function DynamicMap() {
  const [start, setStart] = useState(null); // Start point [lat, lng]
  const [end, setEnd] = useState(null); // End point [lat, lng]
  const [route, setRoute] = useState(null); // Route coordinates [[lat, lng], ...]

  // Fetch route when both start and end points are set
  useEffect(() => {
    const fetchRoute = async () => {
      if (start && end) {
        try {
          const response = await fetch(
            `/api/route?start=${start.join(',')}&end=${end.join(',')}`
          );
          const data = await response.json();

          if (data.geometry) {
            const coordinates = JSON.parse(data.geometry).coordinates.map(([lng, lat]) => [lat, lng]);
            setRoute(coordinates);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      }
    };

    fetchRoute();
  }, [start, end]);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }}>
      {/* OSM Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Add Markers */}
      {start && <Marker position={start} />}
      {end && <Marker position={end} />}

      {/* Draw Route */}
      {route && <Polyline positions={route} color="blue" />}

      {/* Handle Click Events to Set Markers */}
      <SetMarkers setStart={setStart} setEnd={setEnd} />
    </MapContainer>
  );
}
