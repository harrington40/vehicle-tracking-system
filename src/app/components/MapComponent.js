"use client";  // Mark this as a client component

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';  // Import leaflet to handle icons
import 'leaflet/dist/leaflet.css';

// Fix the default marker icon path
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const [isClient, setIsClient] = useState(false);
  const position = [51.505, -0.09]; // Example coordinates

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Don't render the map on the server
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: '1000px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
