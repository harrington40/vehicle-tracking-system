import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { parse } from 'cookie';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'backend', 'auth.proto');

// Load gRPC definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// gRPC Client
const client = new authProto.AuthService('0.0.0.0:50051', grpc.credentials.createInsecure());

export async function POST(req) {
  try {
    // Parse cookies from the request headers
    const cookies = req.headers.get('cookie');
    console.log('Cookies:', cookies); // Debugging
    const parsedCookies = cookies ? parse(cookies) : {};
    const token = parsedCookies.token;
    console.log('Parsed Token:', token); // Debugging

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use gRPC client to verify the token
    return new Promise((resolve) => {
      client.VerifyToken({ token }, (error, response) => {
        if (error) {
          console.error('gRPC Error:', error);
          resolve(
            new Response(JSON.stringify({ error: 'Internal server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else if (response && response.error) {
          console.error('VerifyToken Error:', response.error);
          resolve(
            new Response(JSON.stringify({ error: response.error }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else if (response && response.success) {
          resolve(
            new Response(
              JSON.stringify({
                success: true,
                message: 'Token is valid.',
                user: response.user,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          );
        } else {
          resolve(
            new Response(JSON.stringify({ error: 'Unexpected server response.' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      });
    });
  } catch (err) {
    console.error('Unexpected error in POST handler:', err);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
