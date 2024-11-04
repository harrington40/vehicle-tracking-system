// Import necessary modules for gRPC and database operations
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const rethinkdb = require('rethinkdb');
const path = require('path');

// Load the .proto file for defining the gRPC service
console.log('Loading .proto file...');
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, 'protos', 'service.proto'), // Path to the .proto file
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

// Load the gRPC service package definition
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage;

// Ensure the service was loaded correctly
if (serviceProto && serviceProto.AuthService) {
  console.log('Loaded gRPC Service:', serviceProto.AuthService);
} else {
  console.error('Failed to load gRPC service definition. Check the .proto file and package name.');
  process.exit(1);
}

// Establish a connection to the RethinkDB database
console.log('Attempting to connect to RethinkDB...');
let dbConnection;
rethinkdb.connect({ host: 'localhost', port: 28015, db: 'vehicle_tracking' }, (err, conn) => {
  if (err) {
    console.error('Error connecting to RethinkDB:', err);
    process.exit(1);
  } else {
    console.log('Connected to RethinkDB');
    dbConnection = conn;
  }
});

/**
 * Implementation of the GetUser gRPC method to fetch user details, including the hashed password.
 * @param {Object} call - The gRPC call object containing the request.
 * @param {Function} callback - The callback function to send the response.
 */
function getUser(call, callback) {
  console.log('Received gRPC request for GetUser');
  const email = call.request.email.trim(); // Trim to remove any unexpected whitespace
  console.log(`Fetching user with email: "${email}"`);

  rethinkdb.table('Users').filter({ email }).run(dbConnection, (err, cursor) => {
    if (err) {
      console.error('Error querying RethinkDB:', err);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Error querying the database',
      });
      return;
    }

    cursor.toArray((err, result) => {
      if (err) {
        console.error('Error converting cursor to array:', err);
        callback({
          code: grpc.status.INTERNAL,
          message: 'Error processing database result',
        });
      } else if (result.length === 0) {
        console.log('No user found for the given email.');
        callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found',
        });
      } else {
        console.log('Returning user to client:', result[0]);
        callback(null, {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          password: result[0].password, // Ensure this is a hashed password
        });
      }
    });
  });
}

// Create the gRPC server and add the AuthService
const server = new grpc.Server();
server.addService(serviceProto.AuthService.service, { getUser });

// Start the server and bind it to a specific port
const PORT = '0.0.0.0:50051';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind gRPC server:', err);
    return;
  }
  console.log(`gRPC server running at ${PORT}`);
  server.start();
});
