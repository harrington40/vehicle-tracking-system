const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

const client = new serviceProto.MyService('localhost:50051', grpc.credentials.createInsecure());

// Fetch vehicle by make
client.GetVehicleByMake({ make: 'Toyota' }, (error, response) => {
  if (error) {
    console.error('Error in gRPC client:', error);
  } else {
    console.log('Response from gRPC server:', response.vehicles);
  }
});
