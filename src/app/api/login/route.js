// Import NextResponse for sending HTTP responses in a Next.js API route
import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import rethinkdb from 'rethinkdb';
import bcrypt from 'bcrypt';

const PROTO_PATH = './grpc-server/protos/service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage.AuthService;
const client = new serviceProto(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

async function getDBConnection() {
  return await rethinkdb.connect({ host: 'localhost', port: 28015, db: 'vehicle_tracking' });
}

export async function POST(req) {
  let dbConnection;

  try {
    const { email, password } = await req.json();
    console.log(`Login request received for email: ${email}`);
    console.log(`Provided password: ${password}`);

    // Function to call the gRPC method
    const getUser = (email) => {
      return new Promise((resolve, reject) => {
        client.getUser({ email }, (error, response) => {
          if (error) {
            console.error('Error from gRPC server:', error);
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
    };

    // Retrieve user data from gRPC
    const user = await getUser(email);

    if (!user || !user.password) {
      console.warn(`User not found or missing password for email: ${email}`);
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    console.log(`Stored hashed password from gRPC: ${user.password}`);

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn('Password verification failed for user:', email);
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    console.log('User authenticated successfully:', email);

    // Get database connection
    dbConnection = await getDBConnection();
    const cursor = await rethinkdb.table('Users').run(dbConnection);
    const vehicles = await cursor.toArray();

    console.log(`Fetched ${vehicles.length} vehicles from the database.`);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      vehicles,
    });
  } catch (error) {
    console.error('Error during login operation:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  } finally {
    if (dbConnection) {
      dbConnection.close();
      console.log('Database connection closed.');
    }
  }
}
