import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { parse } from 'cookie';

const PROTO_PATH = './backend/auth.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
const client = new authProto.AuthService('0.0.0.0:50051', grpc.credentials.createInsecure());

export async function POST(req) {
  // Parse cookies from the request headers
  const cookies = req.headers.get('cookie');
  const parsedCookies = cookies ? parse(cookies) : {};
  const token = parsedCookies.token;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Promise((resolve) => {
    client.VerifyToken({ token }, (error, response) => {
      if (error || response.error) {
        resolve(
          new Response(JSON.stringify({ error: response?.error || 'Authentication failed' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      } else {
        resolve(
          new Response(JSON.stringify({ success: true, user: response.user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
    });
  });
}