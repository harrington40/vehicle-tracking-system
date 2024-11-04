// Import NextResponse for sending HTTP responses in a Next.js API route
import { NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js'; // Use named import
import * as protoLoader from '@grpc/proto-loader'; // Use named import
import rethinkdb from 'rethinkdb'; // Import RethinkDB for database operations
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed

// Define the path to the .proto file and load it
const PROTO_PATH = './grpc-server/protos/service.proto'; // Adjust the path as needed
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the AuthService from the loaded package definition
const serviceProto = grpc.loadPackageDefinition(packageDefinition).mypackage.AuthService;

// Create a gRPC client instance for AuthService
const client = new serviceProto(
  'localhost:50051', // Replace with your gRPC server address
  grpc.credentials.createInsecure()
);

/**
 * Helper function to create a new connection to the RethinkDB database.
 * @returns {Promise<rethinkdb.Connection>} The connection object.
 * @throws Will throw an error if the connection fails.
 */
async function getDBConnection() {
  try {
    // Attempt to establish a new connection to the RethinkDB server
    return await rethinkdb.connect({ host: 'localhost', port: 28015, db: 'vehicle_tracking' });
  } catch (err) {
    console.error('Error establishing a new RethinkDB connection:', err);
    throw err; // Rethrow the error to be handled by the caller
  }
}

/**
 * POST handler for user authentication using gRPC and querying the 'vehicle' table in RethinkDB.
 * @param {Request} req - The HTTP request object.
 * @returns {Response} JSON response containing the authentication result or an error message.
 */
export async function POST(req) {
  let dbConnection;

  try {
    const { email, password } = await req.json();
    console.log(`Received login request for email: ${email}`);

    // Create a promise-based function to call the gRPC method
    const getUser = (email) => {
      return new Promise((resolve, reject) => {
        client.getUser({ email }, (error, response) => {
          if (error) {
            console.error('Error from gRPC server:', error);
            reject(error);
          } else {
            console.log('User data received from gRPC server:', response);
            resolve(response);
          }
        });
      });
    };

    // Call the gRPC service to get the user data
    const user = await getUser(email);

    if (!user || !user.password) {
      console.warn(`User not found or missing password for email: ${email}`);
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn('Password verification failed for user:', email);
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    console.log('User authenticated successfully:', email);

    // Establish a connection to the RethinkDB database
    dbConnection = await getDBConnection();

    // Query the 'vehicle' table for all vehicles (or add your specific query logic)
    const cursor = await rethinkdb.table('Users').run(dbConnection);
    const vehicles = await cursor.toArray();

    console.log(`Fetched ${vehicles.length} vehicles from the database.`);

    // Respond with success, user data (excluding the password), and vehicle data
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
    // Ensure the database connection is closed
    if (dbConnection) {
      dbConnection.close();
      console.log('Database connection closed.');
    }
  }
}
