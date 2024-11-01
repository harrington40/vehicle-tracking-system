import client from '../../lib/grpcClient';

export default async (req, res) => {
  const { vehicleId, location, status } = req.body;
  client.UpdateVehicleData({ vehicleId, location, status }, (error, response) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(response);
  });
};
