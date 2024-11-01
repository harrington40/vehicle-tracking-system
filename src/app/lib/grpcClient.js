import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './protos/vehicle.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const VehicleService = grpc.loadPackageDefinition(packageDefinition).VehicleService;

const client = new VehicleService('localhost:50051', grpc.credentials.createInsecure());

export default client;
