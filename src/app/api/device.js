export default function handler(req, res) {
    if (req.method === 'GET') {
      // Mock data for devices
      res.status(200).json([
        { id: 1, name: 'Device 1', isActive: true },
        { id: 2, name: 'Device 2', isActive: false },
        { id: 3, name: 'Device 3', isActive: true },
        // Add more devices as needed
      ]);
    } else if (req.method === 'DELETE') {
      // Handle delete request for mock
      res.status(204).end();
    } else if (req.method === 'PUT') {
      // Handle toggle status request for mock
      res.status(200).end();
    }
  }
  