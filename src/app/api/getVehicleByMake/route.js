// Import NextResponse for sending HTTP responses in a Next.js API route
import { NextResponse } from 'next/server';

// Import the RethinkDB library for database operations
import rethinkdb from 'rethinkdb';

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
 * GET handler for fetching vehicle data from the RethinkDB.
 * @param {Request} request - The HTTP request object.
 * @returns {Response} JSON response containing the query result or an error message.
 */
export async function GET(request) {
  // Extract search parameters from the request URL
  const { searchParams } = new URL(request.url);
  // Get the 'make' query parameter or set a default value if not provided
  const make = searchParams.get('make') || 'Default Make';
  let connection;

  try {
    console.log(`Fetching vehicles with make: ${make}`);

    // Establish a new connection to the database
    connection = await getDBConnection();

    // Check if the connection was successful
    if (!connection) {
      throw new Error('Failed to establish a connection to the database.');
    }

    // Query the 'vehicle' table for documents that match the specified 'make'
    const cursor = await rethinkdb.table('Vehicles').filter({ make }).run(connection);
    // Convert the cursor result to an array of vehicles
    const vehicles = await cursor.toArray();

    console.log(`Fetched ${vehicles.length} vehicles from the database.`);

    // Return a successful JSON response with the fetched vehicles
    return NextResponse.json({ success: true, vehicles });
  } catch (error) {
    // Log the error to the console and return an error response
    console.error('Error fetching data from the database:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data from the database', error: error.message },
      { status: 500 } // Set the HTTP status code to 500 (Internal Server Error)
    );
  } finally {
    // Ensure the connection is closed if it was established
    if (connection) {
      connection.close();
      console.log('Database connection closed.');
    }
  }
}
