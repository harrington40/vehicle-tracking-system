// pages/api/register.js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load the .proto file
const PROTO_PATH = path.resolve('./backend/auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Initialize gRPC client to connect with the gRPC server
const client = new authProto.AuthService(
  '0.0.0.0:50051', // Replace with your gRPC server address
  grpc.credentials.createInsecure()
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    // Call the RegisterUser gRPC method
    client.RegisterUser({ name, email, password }, (error, response) => {
      if (error) {
        res.status(500).json({ error: error.message });
      } else if (response.success) {
        res.status(200).json({ message: response.message });
      } else {
        res.status(400).json({ error: response.error });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
