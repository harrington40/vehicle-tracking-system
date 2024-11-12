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

// Load the package definition and access the AuthService from the `auth` package
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
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '4h' });
      
      console.log("Generated JWT Token:", token);

      // Step 5: Send the token in the response
      callback(null, { token, success: true, message: 'Login successful' });
    } else {
      console.log("Invalid password");
      callback(null, { error: 'Invalid email or password', success: false });
    }
  } catch (err) {
    console.error("Error during authentication:", err);
    callback(null, { error: 'Authentication failed', success: false });
  } finally {
    if (connection) connection.close();
  }
}

// gRPC VerifyToken Method
function verifyToken(call, callback) {
  const { token } = call.request;

  if (!token) {
    return callback(null, { success: false, error: 'No token provided' });
  }

  // Verify the JWT token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      callback(null, { success: false, error: 'Invalid or expired token' });
    } else {
      // Token is valid, return user info
      callback(null, { success: true, user: { id: decoded.id, email: decoded.email } });
    }
  });
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(authProto.AuthService.service, { 
    Login: login, 
    VerifyToken: verifyToken 
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
    server.start();
  });
}

main();
