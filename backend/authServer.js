const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const r = require('rethinkdb');
const fs = require('fs');
const path = require('path');

// Define the path to your .proto file
const PROTO_PATH = path.join(__dirname, 'auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Load JWT secret from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  acc[key] = value;
  return acc;
}, {});
const JWT_SECRET = envContent.JWT_SECRET || 'your_jwt_secret';
const RETHINKDB_CONFIG = { host: 'localhost', port: 28015, db: 'vehicle_tracking' };

// gRPC RegisterUser Method
async function registerUser(call, callback) {
  const { name, email, password } = call.request;
  console.log("Register attempt with email:", email);

  let connection = null;

  try {
    connection = await r.connect(RETHINKDB_CONFIG);

    // Check if the user already exists
    const cursor = await r.table('Users').filter({ email }).run(connection);
    const existingUser = await cursor.toArray();

    if (existingUser.length > 0) {
      callback(null, { error: 'User with this email already exists', success: false });
      return;
    }

    // Generate `userId` based on specified format
    const countryCode = 'US'; // Replace with actual country code if needed
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Calculate device count based on existing IDs with the same prefix
    const deviceCountCursor = await r.table('Users')
      .filter(r.row('id').match(`^TT-${countryCode}\\d{3}-${year}${month}${day}`))
      .count()
      .run(connection);

    const deviceCount = deviceCountCursor || 0; // Use 0 if no records
    const deviceIdSuffix = deviceCount.toString().padStart(1, '0');
    const userId = `TT-${countryCode}${Math.floor(Math.random() * 900 + 100)}-${year}${month}${day}${deviceIdSuffix}`;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user record with `userId` as the `id`
    const result = await r.table('Users')
      .insert({ id: userId, name, email, password: hashedPassword, createdAt: new Date() })
      .run(connection);

    if (result.inserted === 1) {
      console.log("User registered successfully with ID:", userId);
      callback(null, { success: true, message: 'User registered successfully', id: userId });
    } else {
      console.log("Failed to register user.");
      callback(null, { success: false, error: 'Failed to register user' });
    }
  } catch (err) {
    console.error("Error during registration:", err);
    callback(null, { success: false, error: 'Registration failed' });
  } finally {
    if (connection) connection.close();
  }
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(authProto.AuthService.service, { 
    RegisterUser: registerUser, // Add RegisterUser service
    // Add other services (e.g., Login, VerifyToken) as needed
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
    server.start();
  });
}

main();
