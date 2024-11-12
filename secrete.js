const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const r = require('rethinkdb');
const crypto = require('crypto');
const path = require('path');

// Load gRPC proto definitions
const PROTO_PATH = path.join(__dirname, 'auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Generate a dynamic JWT secret
const JWT_SECRET = crypto.randomBytes(64).toString('base64'); // Generates a 64-byte random base64 string

const RETHINKDB_CONFIG = { host: 'localhost', port: 28015, db: 'vehicle_tracking' };

// Define gRPC methods
async function login(call, callback) {
    const { email, password } = call.request;
    try {
        const connection = await r.connect(RETHINKDB_CONFIG);
        const cursor = await r.table('Users').filter({ email }).run(connection);
        const user = await cursor.next();

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '4h' });
            callback(null, { token, success: true, message: 'Login successful' });
        } else {
            callback(null, { error: 'Invalid email or password', success: false });
        }
        connection.close();
    } catch (err) {
        console.error("Error during authentication:", err);
        callback(null, { error: 'Authentication failed', success: false });
    }
}

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

function main() {
    const server = new grpc.Server();
    server.addService(authProto.AuthService.service, { Login: login, VerifyToken: verifyToken });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('gRPC server running on port 50051');
        server.start();
    });
}

main();
