import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { parse } from 'cookie';

const PROTO_PATH = process.env.PROTO_PATH || './backend/auth.proto';
const GRPC_SERVER = process.env.GRPC_SERVER || '0.0.0.0:50051';

// Load gRPC service definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
const client = new authProto.AuthService(GRPC_SERVER, grpc.credentials.createInsecure());

export async function POST(req) {
  try {
    // Parse cookies from the request headers
    const cookies = req.headers.get('cookie');
    const parsedCookies = cookies ? parse(cookies) : {};
    const token = parsedCookies.token;

    if (!token) {
      console.warn('Unauthorized access attempt: No token provided');
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify token via gRPC
    return new Promise((resolve) => {
      client.VerifyToken({ token }, (error, response) => {
        if (error) {
          console.error('gRPC VerifyToken error:', error.message);
          resolve(
            new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
          return;
        }

        if (response.error) {
          console.warn('Token verification failed:', response.error);
          resolve(
            new Response(JSON.stringify({ error: response.error }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
          return;
        }

        console.log('Token verification successful for user:', response.user);
        resolve(
          new Response(JSON.stringify({ success: true, user: response.user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
