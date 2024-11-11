// Load necessary modules
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const r = require('rethinkdb');

// Define the path to your .proto file
const PROTO_PATH = './auth.proto'

// Load the protobuf definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the package definition and access the AuthService from the `auth` package
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Set up JWT secret and database configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const RETHINKDB_CONFIG = { host: 'localhost', port: 28015, db: 'vehicle_tracking' };

// gRPC Login Method
async function login(call, callback) {
  const { email, password } = call.request;
  console.log("Login attempt with email:", email);

  let connection = null;

  try {
    connection = await r.connect(RETHINKDB_CONFIG);

    // Step 1: Filter user by email
    const cursor = await r.table('Users').filter({ email }).run(connection);

    let user;
    try {
      // Step 2: Retrieve the user record
      user = await cursor.next();
      console.log("User found:", user);
    } catch (error) {
      console.log("User not found");
      callback(null, { error: 'Invalid email or password' });
      return;
    }

    // Step 3: Check if provided password matches hashed password in database
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", passwordMatch);

    if (passwordMatch) {
      // Step 4: Generate JWT token if passwords match
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      
      // Print the token for debugging purposes
      console.log("Generated JWT Token:", token);
      
      callback(null, { token });
    } else {
      console.log("Invalid password");
      callback(null, { error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error("Error during authentication:", err);
    callback(null, { error: 'Authentication failed' });
  } finally {
    if (connection) connection.close();
  }
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(authProto.AuthService.service, { Login: login }); // Make sure service matches your .proto file
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
  });
}

main();
