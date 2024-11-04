import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load the .proto file
const packageDefinition = protoLoader.loadSync(path.join(process.cwd(), 'protos', 'service.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Create a gRPC client
const client = new serviceProto.MyService('localhost:50051', grpc.credentials.createInsecure());

export default function handler(req, res) {
  if (req.method === 'GET') {
    const make = req.query.make; // Get the vehicle make from query params

    client.GetVehicleByMake({ make }, (err, response) => {
      if (err) {
        console.error('Error calling gRPC service:', err);
        res.status(500).json({ error: 'Failed to fetch data from gRPC service' });
      } else {
        res.status(200).json(response);
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
