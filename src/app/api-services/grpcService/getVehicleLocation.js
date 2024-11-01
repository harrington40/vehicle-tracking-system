import client from '../../lib/grpcClient';

export default async (req, res) => {
  const { vehicleId } = req.query;
  client.GetVehicleLocation({ vehicleId }, (error, response) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json(response);
  });
};
