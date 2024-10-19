import { useEffect, useState } from 'react';

export default function VehicleInfo() {
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    fetch('/api/vehicle') // Fetch from the corresponding LoopBack API
      .then(response => response.json())
      .then(data => setVehicle(data));
  }, []);

  if (!vehicle) return <div>Loading...</div>;

  return (
    <div>
      <h1>Vehicle Information</h1>
      <p>Make/Model: {vehicle.make} / {vehicle.model}</p>
      <p>License Plate: {vehicle.licensePlate}</p>
      <p>Status: {vehicle.status}</p>
    </div>
  );
}
