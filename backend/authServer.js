const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mqtt = require('mqtt');
const fetch = require('node-fetch');
const path = require('path');

// Constants
const PROTO_PATH = path.join(__dirname, 'auth.proto');
const JWT_SECRET = 'your_jwt_secret'; // Store securely in environment variables
const MQTT_BROKER_URL = 'mqtt://localhost'; // Replace with your MQTT broker URL
const OSRM_BASE_URL = 'http://localhost:5000'; // Replace with your OSRM instance URL

// Load Proto File
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// Simulated Database
const users = [];

// MQTT Client Setup
const mqttClient = mqtt.connect(MQTT_BROKER_URL);
mqttClient.on('connect', () => console.log('Connected to MQTT broker'));

// Register User
function RegisterUser(call, callback) {
  const { name, email, password } = call.request;
  if (users.find((user) => user.email === email)) {
    callback(null, { error: 'User already exists.' });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = `user-${users.length + 1}`;
  users.push({ id, name, email, password: hashedPassword });

  callback(null, { id, message: 'User registered successfully.' });
}

// Login User
function Login(call, callback) {
  const { email, password } = call.request;
  const user = users.find((user) => user.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    callback(null, { error: 'Invalid email or password.' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  callback(null, { token });
}

// Verify Token
function VerifyToken(call, callback) {
  const { token } = call.request;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      callback(null, { success: false, error: err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.' });
    } else {
      const user = users.find((u) => u.id === decoded.id);
      if (user) {
        callback(null, { success: true, user: { id: user.id, email: user.email } });
      } else {
        callback(null, { success: false, error: 'User not found.' });
      }
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
function main() {
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
