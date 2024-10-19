import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the MapComponent without SSR
const MapComponent = dynamic(() => import('../src/components/MapComponent'), { ssr: false });

const GeofencePage = () => {
  const [geofenceData, setGeofenceData] = useState({
    latitude: 40.7128,  // Geofence center (latitude)
    longitude: -74.0060,  // Geofence center (longitude)
    radius: 500  // Radius in meters
  });

  const [vehicleLocation, setVehicleLocation] = useState({
    latitude: 40.7130,  // Default vehicle location
    longitude: -74.0055
  });

  // Fetch geofence data from the backend API (LoopBack)
  useEffect(() => {
    fetch('/api/geofence')
      .then((response) => response.json())
      .then((data) => setGeofenceData(data));
  }, []);

  // Function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Detect if the vehicle is inside the geofence or not
  useEffect(() => {
    const distance = calculateDistance(
      geofenceData.latitude, geofenceData.longitude,
      vehicleLocation.latitude, vehicleLocation.longitude
    );

    if (distance <= geofenceData.radius) {
      console.log('Vehicle is inside the geofence');
    } else {
      console.log('Vehicle is outside the geofence');
    }
  }, [vehicleLocation, geofenceData]);

  // Simulate vehicle location change or fetch real-time vehicle location
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleLocation({
        latitude: vehicleLocation.latitude + 0.0001,  // Simulate movement
        longitude: vehicleLocation.longitude + 0.0001
      });
    }, 5000); // Update location every 5 seconds

    return () => clearInterval(interval);
  }, [vehicleLocation]);

  return (
    <div>
      <h1>Geofence Page</h1>
      <MapComponent geofenceData={geofenceData} vehicleLocation={vehicleLocation} />
      <p>Geofence Radius: {geofenceData.radius} meters</p>
    </div>
  );
};

export default GeofencePage;
