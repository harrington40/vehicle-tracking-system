const updateVehicleData = async (vehicleId, location, status) => {
    const response = await fetch('/api/updateVehicleData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, location, status }),
    });
    return await response.json();
  };
  