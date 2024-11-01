const fetchVehicleLocation = async (vehicleId) => {
    const response = await fetch(`/api/getVehicleLocation?vehicleId=${vehicleId}`);
    const data = await response.json();
    return data;
  };
  