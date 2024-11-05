const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader'); // Ensure this is correct
const path = require('path');


// Load the .proto file
const packageDefinition = protoLoader.loadSync(
  path.resolve('./grpc-server/protos/service.proto'), // Adjust if needed
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Create a gRPC client instance for AuthService
const client = new serviceProto.AuthService('localhost:50051', grpc.credentials.createInsecure());

// Define the POST request handler for the API route
export async function POST(req) {
  const { name, email, password } = await req.json();

  // Return a Promise to handle the async gRPC call
  return new Promise((resolve) => {
    // Call the gRPC AddUser method
    client.AddUser({ name, email, password }, (error, response) => {
      if (error) {
        console.error('Error adding user:', error);
        // Send a 500 error response with the error message
        resolve(new Response(JSON.stringify({ message: 'Failed to register user', error: error.message }), { status: 500 }));
      } else {
        console.log('User added successfully:', response);
        // Send a 200 success response with the user ID
        resolve(new Response(JSON.stringify({ success: true, user_id: response.user_id }), { status: 200 }));
      }
    });
  });
}
