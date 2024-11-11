import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

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
  const { token } = await req.json();

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
