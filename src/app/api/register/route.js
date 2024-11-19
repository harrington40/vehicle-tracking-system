import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'auth.proto');
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
  try {
    const { name, email, password } = await req.json();

    return new Promise((resolve) => {
      client.RegisterUser({ name, email, password }, (error, response) => {
        if (error) {
          resolve(
            new Response(JSON.stringify({ error: 'Internal server error.' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else if (response.error) {
          resolve(
            new Response(JSON.stringify({ error: response.error }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else {
          resolve(
            new Response(JSON.stringify({ id: response.id, message: response.message }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      });
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
