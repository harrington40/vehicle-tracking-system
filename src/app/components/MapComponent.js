"use client";  // Mark this as a client component

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TableComponent from '../components/pages/TableComponent';
import RightPanel from '../components/pages/RightPanel';

// Import custom icons
import { carIcon, motorbikeIcon, personIcon } from '../../resource/customIcons';

// Remove default Leaflet icons
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const [isClient, setIsClient] = useState(false);

  // Simulate positions for car, motorbike, and person
  const [carPosition, setCarPosition] = useState([6.4281, -10.7969]);
  const [motorbikePosition, setMotorbikePosition] = useState([6.4381, -10.7969]);
  const [personPosition, setPersonPosition] = useState([6.4481, -10.7969]);

  useEffect(() => {
    setIsClient(true);

    // Simulate movement for the markers (example: move every 1 second)
    const interval = setInterval(() => {
      setCarPosition((prevPosition) => [prevPosition[0] + 0.0001, prevPosition[1] + 0.0001]);
      setMotorbikePosition((prevPosition) => [prevPosition[0] + 0.00005, prevPosition[1] + 0.00005]);
      setPersonPosition((prevPosition) => [prevPosition[0] - 0.0001, prevPosition[1] - 0.0001]);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      {/* Main Map Container */}
      <div style={{ flex: 1 }}>
        <MapContainer center={carPosition} zoom={13} style={{ height: '80vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Car Marker */}
          <Marker position={carPosition} icon={carIcon}>
            <Popup>Car is here!</Popup>
          </Marker>

          {/* Motorbike Marker */}
          <Marker position={motorbikePosition} icon={motorbikeIcon}>
            <Popup>Motorbike is here!</Popup>
          </Marker>

          {/* Person Marker */}
          <Marker position={personPosition} icon={personIcon}>
            <Popup>Person is here!</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Bottom Panel with Data Grid */}
      <TableComponent />

      {/* Right-hand Sidebar */}
      <RightPanel />
    </div>
  );
};

export default MapComponent;
