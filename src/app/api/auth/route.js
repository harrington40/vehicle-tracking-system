import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './backend/auth.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { 
  keepCase: true, 
  longs: String, 
  enums: String, 
  defaults: true, 
  oneofs: true 
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
const client = new authProto.AuthService('0.0.0.0:50051', grpc.credentials.createInsecure());

export async function POST(req) {
  const { email, password } = await req.json();

  return new Promise((resolve) => {
    client.Login({ email, password }, (error, response) => {
      if (error) {
        console.error('gRPC Error:', error.message); // Log gRPC error
        resolve(
          new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
              status: 500, // Internal Server Error
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
        return;
      }
    
      if (!response || response.error || !response.token) {
        resolve(
          new Response(
            JSON.stringify({ error: response?.error || 'Authentication failed' }),
            {
              status: 401, // Unauthorized
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
        return;
      }
    
      // Token is valid, proceed to set the cookie and respond.
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? 'Secure;' : '';
      const cookie = `token=${response.token}; HttpOnly; ${secureFlag} Path=/; Max-Age=3600; SameSite=Strict`;
    
      resolve(
        new Response(
          JSON.stringify({ message: 'Login successful' }),
          {
            status: 200, // OK
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': cookie,
            },
          }
        )
      );
    });
  });
}
