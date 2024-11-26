const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(process.cwd(), 'proto/routing.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const routingProto = grpc.loadPackageDefinition(packageDefinition).routing;

const client = new routingProto.RoutingService('localhost:50051', grpc.credentials.createInsecure());

export default async function handler(req, res) {
  const { start, end } = req.query;

  client.GetRoute({ start, end }, (error, response) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json(response);
    }
  });
}
