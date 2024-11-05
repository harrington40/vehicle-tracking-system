import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

// Load the gRPC service definition
const packageDefinition = protoLoader.loadSync(
  path.resolve('./grpc-server/protos/service.proto'), // Update to your .proto file path
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Create a gRPC client for AuthService
const client = new serviceProto.AuthService('localhost:50051', grpc.credentials.createInsecure());

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    // Call the gRPC AddUser method
    client.AddUser({ name, email, password }, (error, response) => {
      if (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user' });
      } else {
        res.status(200).json({ success: true, user_id: response.user_id });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
