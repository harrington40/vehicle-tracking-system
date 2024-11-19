import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { RateLimiterMemory } from 'rate-limiter-flexible';
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
  'localhost:50051', // gRPC server address
  grpc.credentials.createInsecure()
);

// Initialize rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 5, // Allow 5 requests
  duration: 60, // Per 60 seconds
});

export async function POST(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // Consume a point for this IP address
    await rateLimiter.consume(ip);

    const { name, email, password } = await req.json();

    return new Promise((resolve) => {
      client.RegisterUser({ name, email, password }, (error, response) => {
        if (error) {
          console.error('gRPC error:', error);
          resolve(
            new Response(
              JSON.stringify({ error: 'Internal server error' }),
              { status: 500 }
            )
          );
        } else {
          console.log('gRPC response:', response);

          // Adjust response handling to match the server response structure
          if (response.id && response.message) {
            // Registration was successful
            resolve(
              new Response(
                JSON.stringify({ message: response.message, id: response.id }),
                { status: 200 }
              )
            );
          } else if (response.error) {
            // Registration failed, return the error message
            resolve(
              new Response(
                JSON.stringify({ error: response.error }),
                { status: 400 }
              )
            );
          } else {
            // Unknown failure case
            resolve(
              new Response(
                JSON.stringify({ error: 'Unknown registration error' }),
                { status: 400 }
              )
            );
          }
        }
      });
    });
  } catch (rateLimiterRes) {
    // Too many requests
    console.warn(`Rate limit exceeded for IP ${ip}`);
    return new Response(
      JSON.stringify({ error: 'Too many registration attempts. Please try again later.' }),
      {
        status: 429, // HTTP status code for Too Many Requests
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Optional handler for GET requests (if needed)
export async function GET(req) {
  return new Response(JSON.stringify({ message: 'This endpoint supports POST for user registration.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
