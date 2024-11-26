const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/routing.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const routingProto = grpc.loadPackageDefinition(packageDefinition).routing;

const server = new grpc.Server();

// Implement the GetRoute RPC method
server.addService(routingProto.RoutingService.service, {
  GetRoute: (call, callback) => {
    const { start, end } = call.request;

    // Your OSRM logic here
    const response = {
      status: "success",
      distance: 1234.56,
      duration: 567.89,
      route_steps: [
        {
          instruction: "Turn left onto Main Street",
          distance: 150.0,
          duration: 30,
          geometry: "encoded-polyline",
        },
      ],
    };

    callback(null, response);
  },
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on port 50051');
  server.start();
});
