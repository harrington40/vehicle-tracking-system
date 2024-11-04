const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the .proto file
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../grpc-server/protos/service.proto'), // Adjust this path if needed
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Create a gRPC client instance
const client = new serviceProto.MyService('localhost:50051', grpc.credentials.createInsecure());

// Function to fetch vehicle by make
function getVehicleByMake(make) {
  client.GetVehicleByMake({ make }, (error, response) => {
    if (error) {
      console.error('Error in gRPC client for GetVehicleByMake:', error);
    } else {
      console.log('Response from GetVehicleByMake:', response.vehicles);
    }
  });
}

// Function to fetch vehicle by ID
function getVehicleById(id) {
  client.GetVehicleById({ id }, (error, response) => {
    if (error) {
      console.error('Error in gRPC client for GetVehicleById:', error);
    } else {
      console.log('Response from GetVehicleById:', response.vehicles);
    }
  });
}

// Example usage
getVehicleByMake('Toyota'); // Replace 'Toyota' with any make for testing
getVehicleById('1'); // Replace '1' with any vehicle ID for testing
