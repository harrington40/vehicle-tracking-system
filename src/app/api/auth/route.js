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

const client = new authProto.AuthService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

export async function POST(req) {
  try {
    const { email, password } = await req.json(); // Parse the request body

    if (!email || !password) {
      // Return early if required fields are missing
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Promise((resolve) => {
      client.Login({ email, password }, (error, response) => {
        if (error) {
          console.error('gRPC error:', error);
          resolve(
            new Response(JSON.stringify({ error: 'Internal server error.' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else if (response && response.token) {
          resolve(
            new Response(
              JSON.stringify({
                message: 'Login successful.',
                token: response.token,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          );
        } else if (response && response.error) {
          resolve(
            new Response(JSON.stringify({ error: response.error }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
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

export async function GET(req) {
  return new Response(
    JSON.stringify({ message: 'This endpoint supports POST for authentication.' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
