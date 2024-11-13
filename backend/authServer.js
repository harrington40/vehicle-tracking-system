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
    const countryCode = 'US';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const deviceCount = await r.table('Users')
      .filter(r.row('id').match(`^TT-${countryCode}\\d{3}-${year}${month}${day}`))
      .count()
      .run(connection);
    const deviceIdSuffix = (deviceCount || 0).toString().padStart(1, '0');
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

// gRPC Login Method
async function login(call, callback) {
  const { email, password } = call.request;
  console.log("Login attempt with email:", email);

  let connection = null;

  try {
    connection = await r.connect(RETHINKDB_CONFIG);

    // Find user by email
    const cursor = await r.table('Users').filter({ email }).run(connection);
    const user = await cursor.next().catch(() => null);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      callback(null, { error: 'Invalid email or password', token: '' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '4h' });
    console.log("Generated JWT Token:", token);
    callback(null, { token, success: true, message: 'Login successful' });
  } catch (err) {
    console.error("Error during login:", err);
    callback(null, { error: 'Login failed', token: '' });
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

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      callback(null, { success: false, error: 'Invalid or expired token' });
    } else {
      callback(null, { success: true, user: { id: decoded.id, email: decoded.email } });
    }
  });
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(authProto.AuthService.service, { 
    RegisterUser: registerUser,
    Login: login,
    VerifyToken: verifyToken
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
    server.start();
  });
}

main();
