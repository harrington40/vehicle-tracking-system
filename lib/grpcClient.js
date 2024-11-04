// Import the necessary modules for gRPC and file path operations
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the .proto file and create a package definition
// This file defines the gRPC service, messages, and RPC methods
const packageDefinition = protoLoader.loadSync(
  path.resolve(__dirname, '../grpc-server/protos/service.proto'), // Path to the .proto file
  {
    keepCase: true,    // Preserve the original case of field names
    longs: String,     // Convert long data types to strings
    enums: String,     // Convert enum values to strings
    defaults: true,    // Use default values for fields if they are not set
    oneofs: true       // Include `oneof` fields as part of the object structure
  }
);

// Load the service definition from the package definition
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Create a gRPC client instance for communication with the server
// '0.0.0.0:50051' is the address of the gRPC server
// `grpc.credentials.createInsecure()` is used for unencrypted communication
const client = new serviceProto.MyService('0.0.0.0:50051', grpc.credentials.createInsecure());

/**
 * Function to get data from the gRPC server using a query parameter.
 * @param {string} query - The make of the vehicle to be queried.
 * @returns {Promise<Object>} A promise that resolves with the response from the server or rejects with an error.
 */
export function getDataFromServer(query) {
  return new Promise((resolve, reject) => {
    // Call the GetVehicleByMake method on the gRPC client
    client.GetVehicleByMake({ make: query }, (err, response) => {
      if (err) {
        // Reject the promise if there is an error
        reject(err);
      } else {
        // Resolve the promise with the response data
        resolve(response);
      }
    });
  });
}
