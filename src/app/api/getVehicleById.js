import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../../lib/grpcClient'; // Adjust the path as needed

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID query parameter is required' });
  }

  client.GetVehicleById({ id }, (error, response) => {
    if (error) {
      console.error('Error in gRPC client for GetVehicleById:', error);
      return res.status(500).json({ error: 'Failed to fetch data from gRPC server' });
    }
    return res.status(200).json({ vehicles: response.vehicles });
  });
}
