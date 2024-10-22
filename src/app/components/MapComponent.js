

"use client";  // Mark this as a client component

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TableComponent from '../components/pages/TableComponent';
import RightPanel from '../components/pages/RightPanel';
import { fetchRouteWithStops } from '../api-services/osrmService';
import L from 'leaflet';

// Import custom icons (except carIcon, which we handle manually here)
import { motorbikeIcon, personIcon } from '../../resource/customIcons';

// Remove default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Function to calculate distance between two points (in kilometers)
const calculateDistance = (start, end) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(end[0] - start[0]);
  const dLon = toRad(end[1] - start[1]);
  const lat1 = toRad(start[0]);
  const lat2 = toRad(end[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Function to calculate bearing between two points (in degrees)
const calculateBearing = (start, end) => {
  const startLat = (start[0] * Math.PI) / 180;
  const startLng = (start[1] * Math.PI) / 180;
  const endLat = (end[0] * Math.PI) / 180;
  const endLng = (end[1] * Math.PI) / 180;

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360; // Normalize to 0-360
};

// Function to create a rotated car icon with the correct orientation
const createRotatedCarIcon = (bearing) => {
  return L.divIcon({
    className: 'custom-car-icon',
    html: `<div style="transform: rotate(${bearing - 160}deg); transform-origin: center center;">
             <img src="/icons/car.svg" alt="Car Icon" style="width:32px;height:32px;">
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Function to create an arrow icon
const createArrowIcon = (bearing) => {
  return L.divIcon({
    className: 'custom-arrow-icon',
    html: `<div style="transform: rotate(${bearing + 90}deg); transform-origin: center center;">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L19 21H5L12 2Z" fill="white"/> <!-- Set arrow path fill to white -->
             </svg>
           </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const MapComponent = () => {
  const [isClient, setIsClient] = useState(false);
  const [geofenceActive, setGeofenceActive] = useState(false); // Track geofence activation
  const [markers, setMarkers] = useState([]); // Store marker positions for geofence
  const [routeCoordinates, setRouteCoordinates] = useState([]); // Store route coordinates
  const [traveledRoute, setTraveledRoute] = useState([]); // Store the portion of the route already traveled
  const [stops, setStops] = useState([]); // Store stop points along the route
  const [carPosition, setCarPosition] = useState(null); // Car's current position
  const [carBearing, setCarBearing] = useState(0); // Car's current bearing (direction)
  const [distanceTraveled, setDistanceTraveled] = useState(0); // Distance traveled in miles

  const start = { lat: 6.4281, lng: -10.7969 }; // Start point (Liberia)
  const end = { lat: 6.4343, lng: -10.6987 };   // End point (Liberia)

  const MILE_THRESHOLD = 5 * 1.60934; // 5 miles converted to kilometers

  useEffect(() => {
    setIsClient(true);

    // Fetch the route and stops from OSRM backend
    const getRouteAndStops = async () => {
      const { route, stops } = await fetchRouteWithStops(start, end);
      setRouteCoordinates(route);
      setStops(stops);
      setCarPosition(route[0]); // Start car at the beginning of the route
      setCarBearing(calculateBearing(route[0], route[1])); // Initial bearing
    };

    getRouteAndStops();
  }, []);

  useEffect(() => {
    // Simulate car movement along the route
    if (routeCoordinates.length > 0) {
      const interval = setInterval(() => {
        setCarPosition((prevPosition) => {
          const currentIndex = routeCoordinates.findIndex(
            (pos) => pos[0] === prevPosition[0] && pos[1] === prevPosition[1]
          );
          if (currentIndex < routeCoordinates.length - 1) {
            const nextPosition = routeCoordinates[currentIndex + 1];
            setCarBearing(calculateBearing(prevPosition, nextPosition)); // Update car bearing

            // Calculate distance traveled
            const distance = calculateDistance(prevPosition, nextPosition);
            setDistanceTraveled((prevDistance) => prevDistance + distance);

            // Update traveled route if distance traveled exceeds 5 miles
            if (distanceTraveled + distance >= MILE_THRESHOLD) {
              setTraveledRoute(routeCoordinates.slice(0, currentIndex + 1)); // Show route up to the current point
            }

            return nextPosition;
          } else {
            clearInterval(interval); // Stop moving when the car reaches the final destination
            return end; // Set car at the final destination
          }
        });
      }, 1000); // Move every second

      return () => clearInterval(interval);
    }
  }, [routeCoordinates, distanceTraveled]);

  // Function to handle geofence activation
  const activateGeofence = () => {
    setGeofenceActive(!geofenceActive);
    setMarkers([]); // Reset markers when activating geofence
    console.log('Geofence activated:', !geofenceActive); // Debug log
  };

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      {/* Main Map Container */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[6.4281, -10.7969]} zoom={13} style={{ height: '80vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Render traveled route (appears after 5 miles) */}
          {traveledRoute.length > 0 && (
            <Polyline
              positions={traveledRoute}
              color="blue"
              weight={4} // Increase width of the polyline
            />
          )}

          {/* Render arrow markers every 5 miles along the route */}
          {traveledRoute.map((pos, index) => {
            if (index === traveledRoute.length - 1) return null;

            const nextPos = traveledRoute[index + 1];
            const bearing = calculateBearing(pos, nextPos);
            const distance = calculateDistance(pos, nextPos);

            // Only place an arrow every 5 miles
            if (distanceTraveled >= MILE_THRESHOLD && (distanceTraveled % MILE_THRESHOLD) < 1) {
              return (
                <Marker
                  key={`arrow-${index}`}
                  position={pos}
                  icon={createArrowIcon(bearing)} // Render arrow icon
                />
              );
            }
            return null;
          })}

          {/* Render start marker */}
          <Marker position={[start.lat, start.lng]} icon={createRotatedCarIcon(0)}>
            <Popup>Start Point</Popup>
          </Marker>

          {/* Render end marker */}
          <Marker position={[end.lat, end.lng]} icon={createRotatedCarIcon(carBearing)}>
            <Popup>End Point</Popup>
          </Marker>

          {/* Render markers for stops */}
          {stops.map((stop, index) => (
            <Marker key={index} position={stop}>
              <Popup>Stop Point {index + 1}</Popup>
            </Marker>
          ))}

          {/* Render car's current position */}
          {carPosition && (
            <Marker position={carPosition} icon={createRotatedCarIcon(carBearing)}>
              <Popup>Car is moving</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bottom Panel with Data Grid */}
      <TableComponent />

      {/* Right-hand Sidebar */}
      <RightPanel activateGeofence={activateGeofence} />
    </div>
  );
};

export default MapComponent;
