const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const r = require('rethinkdb');
const path = require('path');
const { mqtt, io, iot } = require('aws-iot-device-sdk-v2');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const RETHINKDB_CONFIG = {
    host: process.env.RETHINKDB_HOST || 'localhost',
    port: parseInt(process.env.RETHINKDB_PORT, 10) || 28015,
    db: process.env.RETHINKDB_DB || 'vehicle_tracking',
};
const PROTO_PATH = path.join(__dirname, 'auth.proto');

// Load gRPC proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// MQTT Configuration
const mqttClientBootstrap = new io.ClientBootstrap();
const mqttConfigBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
    process.env.AWS_IOT_CERT_PATH,
    process.env.AWS_IOT_KEY_PATH
);

mqttConfigBuilder.with_certificate_authority_from_path(undefined, process.env.AWS_IOT_CA_PATH);
mqttConfigBuilder.with_clean_session(true);
mqttConfigBuilder.with_client_id(process.env.AWS_IOT_CLIENT_ID || 'YourClientID');
mqttConfigBuilder.with_endpoint(process.env.AWS_IOT_HOST || 'your-aws-iot-endpoint.amazonaws.com');

const mqttConfig = mqttConfigBuilder.build();
const mqttClient = new mqtt.MqttClient(mqttClientBootstrap);
const mqttConnection = mqttClient.new_connection(mqttConfig);

// MQTT Event Handlers
mqttConnection.on('connect', () => console.log('Connected to AWS IoT'));
mqttConnection.on('disconnect', () => console.log('Disconnected from AWS IoT'));
mqttConnection.on('error', (error) => console.error('MQTT Connection Error:', error));

// Connect to MQTT and subscribe to topics
async function setupMqtt() {
    await mqttConnection.connect();
    console.log('Successfully connected to AWS IoT');
    await mqttConnection.subscribe('vehicle/tracking/#', mqtt.QoS.AtMostOnce, (topic, payload) => {
        const message = Buffer.from(payload).toString();
        console.log(`Received message on topic ${topic}: ${message}`);
        // Further processing of the message
    });
}

// Helper function to generate a unique user ID with the last digit as zero
function generateUniqueUserId() {
    const timestamp = Date.now();
    const adjustedTimestamp = Math.floor(timestamp / 10) * 10; // Ensures last digit is 0
    return `TT-${adjustedTimestamp}`;
}

// gRPC Methods
async function registerUser(call, callback) {
    const { name, email, password } = call.request;
    console.log('Register attempt with email:', email);

    let connection = null;
    try {
        connection = await r.connect(RETHINKDB_CONFIG);
        const cursor = await r.table('Users').filter({ email }).run(connection);
        const existingUser = await cursor.toArray();

        if (existingUser.length > 0) {
            callback(null, { error: 'User with this email already exists', success: false });
            return;
        }

        const userId = generateUniqueUserId();
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await r.table('Users').insert({
            id: userId,
            name,
            email,
            password: hashedPassword,
            clientId: `TT-${userId}`,
            createdAt: new Date(),
        }).run(connection);

        if (result.inserted === 1) {
            console.log('User registered successfully:', userId);
            callback(null, { success: true, message: 'User registered successfully', id: userId });

            // Publish welcome message
            await mqttConnection.publish(`user/${userId}/welcome`, JSON.stringify({ message: 'Welcome to our service!' }), mqtt.QoS.AtMostOnce);
        } else {
            callback(null, { success: false, error: 'Failed to register user' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        callback(null, { success: false, error: 'Registration failed' });
    } finally {
        if (connection) connection.close();
    }
}

async function login(call, callback) {
    const { email, password } = call.request;
    console.log('Login attempt with email:', email);

    let connection = null;
    try {
        connection = await r.connect(RETHINKDB_CONFIG);
        const cursor = await r.table('Users').filter({ email }).run(connection);
        const user = await cursor.next().catch(() => null);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            callback(null, { error: 'Invalid email or password', token: '' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '4h' });
        callback(null, { token, success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        callback(null, { error: 'Login failed', token: '' });
    } finally {
        if (connection) connection.close();
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

// gRPC Server Setup
function startGrpcServer() {
    const server = new grpc.Server();
    server.addService(authProto.AuthService.service, {
        RegisterUser: registerUser,
        Login: login,
        VerifyToken: verifyToken,
    });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('gRPC server running on port 50051');
        server.start();
    });
}

// Main Function
(async () => {
    try {
        await setupMqtt(); // Setup MQTT connection
        startGrpcServer(); // Start gRPC server
    } catch (error) {
        console.error('Application error:', error);
    }
})();
