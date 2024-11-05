const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the .proto file
const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, 'grpc-server', 'protos', 'service.proto'), // Updated path
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    }
  );
  
// Load the gRPC package
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Create a client instance for the AuthService
const client = new serviceProto.AuthService('localhost:50051', grpc.credentials.createInsecure());

// Test data for a new user
const newUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'securePassword123'  // In production, ensure this is hashed
};

// Call the AddUser method
client.AddUser(newUser, (error, response) => {
  if (error) {
    console.error('Error adding user:', error);
  } else {
    console.log('User added successfully:', response);
  }
});
