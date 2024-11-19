import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'backend', 'auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
const client = new authProto.AuthService('0.0.0.0:50051', grpc.credentials.createInsecure());

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Promise((resolve) => {
    client.Login({ email, password }, (error, response) => {
      if (error) {
        console.error('gRPC Error:', error);
        resolve(
          new Response(JSON.stringify({ error: 'Internal server error.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      } else if (response && response.token) {
        resolve(
          new Response(JSON.stringify({ message: 'Login successful.' }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': `token=${response.token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
            },
          })
        );
      } else {
        resolve(
          new Response(JSON.stringify({ error: response.error || 'Invalid credentials.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
    });
  });
}
