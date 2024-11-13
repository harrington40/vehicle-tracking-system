import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load the .proto file and initialize the gRPC client
const PROTO_PATH = path.join(process.cwd(), 'backend', 'auth.proto'); 
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthService(
  '0.0.0.0:50051', // gRPC server address
  grpc.credentials.createInsecure()
);

// Named handler for POST requests
export async function POST(req) {
  const { name, email, password } = await req.json();

  return new Promise((resolve) => {
    client.RegisterUser({ name, email, password }, (error, response) => {
      if (error) {
        console.error('gRPC error:', error);
        resolve(new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 }));
      } else if (response.success) {
        resolve(new Response(JSON.stringify({ message: response.message, id: response.id }), { status: 200 }));
      } else {
        resolve(new Response(JSON.stringify({ error: response.error || 'Registration failed' }), { status: 400 }));
      }
    });
  });
}

// Optional handler for GET requests (if needed)
export async function GET(req) {
  return new Response(JSON.stringify({ message: 'This endpoint supports POST for user registration.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
