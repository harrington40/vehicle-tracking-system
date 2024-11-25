const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mqtt = require('mqtt');
const fetch = require('node-fetch');
const path = require('path');
const r = require('rethinkdb');

// Constants
const PROTO_PATH = path.join(__dirname, 'auth.proto');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Store securely in environment variables
const MQTT_BROKER_URL = 'mqtt://localhost'; // Replace with your MQTT broker URL
const OSRM_BASE_URL = 'http://localhost:5000'; // Replace with your OSRM instance URL
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 28015;
const DB_NAME = 'vehicle_tracking';

// RethinkDB Connection
let dbConnection;

async function connectToDB() {
  try {
    dbConnection = await r.connect({ host: DB_HOST, port: DB_PORT, db: DB_NAME });
    console.log('Connected to RethinkDB');
  } catch (error) {
    console.error('Failed to connect to RethinkDB:', error);
  }
}

// Load Proto File
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER_URL);
mqttClient.on('connect', () => console.log('Connected to MQTT broker'));

// Register User
async function RegisterUser(call, callback) {
  const { name, email, password } = call.request;

  try {
    const existingUser = await r.table('Users').filter({ email }).run(dbConnection);
    if ((await existingUser.toArray()).length > 0) {
      callback(null, { error: 'User already exists.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await r.table('Users').insert({ name, email, password: hashedPassword }).run(dbConnection);

    if (result.inserted === 1) {
      callback(null, { id: result.generated_keys[0], message: 'User registered successfully.' });
    } else {
      callback(null, { error: 'Failed to register user.' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    callback(null, { error: 'Internal server error.' });
  }
}

// Login User
async function Login(call, callback) {
  const { email, password } = call.request;

  try {
    const userCursor = await r.table('Users').filter({ email }).run(dbConnection);
    const users = await userCursor.toArray();

    if (users.length === 0 || !bcrypt.compareSync(password, users[0].password)) {
      callback(null, { error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: users[0].id, email: users[0].email }, JWT_SECRET, { expiresIn: '1h' });
    callback(null, { token });
  } catch (error) {
    console.error('Error logging in user:', error);
    callback(null, { error: 'Internal server error.' });
  }
}

// Verify Token
async function VerifyToken(call, callback) {
  const { token } = call.request;

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      callback(null, { success: false, error: err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.' });
      return;
    }

    try {
      const userCursor = await r.table('Users').get(decoded.id).run(dbConnection);
      if (!userCursor) {
        callback(null, { success: false, error: 'User not found.' });
      } else {
        callback(null, { success: true, user: { id: userCursor.id, email: userCursor.email } });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      callback(null, { success: false, error: 'Internal server error.' });
    }
  });
}

// Publish MQTT Message
function PublishMqttMessage(call, callback) {
  const { topic, message } = call.request;

  mqttClient.publish(topic, message, (err) => {
    if (err) {
      callback(null, { success: false, error: 'Failed to publish message.' });
    } else {
      callback(null, { success: true });
    }
  });
}

// Subscribe to MQTT Topic
function SubscribeMqttTopic(call, callback) {
  const { topic } = call.request;

  mqttClient.subscribe(topic, (err) => {
    if (err) {
      callback(null, { success: false, error: 'Failed to subscribe to topic.' });
    } else {
      mqttClient.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
          callback(null, { success: true, message: message.toString() });
        }
      });
    }
  });
}

// Get Route (OSRM)
async function GetRoute(call, callback) {
  const { start, end } = call.request;

  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok') {
      callback(null, {
        geometry: JSON.stringify(data.routes[0].geometry),
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
      });
    } else {
      callback(null, { error: 'Failed to fetch route.' });
    }
  } catch (error) {
    callback(null, { error: 'Error fetching route data.' });
  }
}

// Start gRPC Server
async function main() {
  await connectToDB();

  const server = new grpc.Server();
  server.addService(authProto.AuthService.service, {
    RegisterUser,
    Login,
    VerifyToken,
    PublishMqttMessage,
    SubscribeMqttTopic,
    GetRoute,
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
    server.start();
  });
}

main();
