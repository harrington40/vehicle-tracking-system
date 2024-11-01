import client from '../../lib/grpcClient';

export default (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const call = client.StreamVehicleUpdates({});
  call.on('data', (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
  call.on('end', () => res.end());
  call.on('error', (error) => res.status(500).json({ error: error.message }));
};
