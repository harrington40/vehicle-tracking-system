import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { NextResponse } from 'next/server';

const PROTO_PATH = './backend/auth.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthService('localhost:50051', grpc.credentials.createInsecure());

export async function POST(req) {
  const { email, password } = await req.json();

  return new Promise((resolve) => {
    client.Login({ email, password }, (error, response) => {
      if (error || response.error) {
        resolve(
          NextResponse.json(
            { error: response?.error || 'Authentication failed' },
            { status: 401 }
          )
        );
      } else {
        // Set token in an HttpOnly cookie for secure storage
        const res = NextResponse.json({ success: true });
        res.cookies.set({
          name: 'token',
          value: response.token,
          httpOnly: true, // Secure and only accessible on the server
          maxAge: 60 * 60, // 1 hour
        });
        resolve(res);
      }
    });
  });
}
