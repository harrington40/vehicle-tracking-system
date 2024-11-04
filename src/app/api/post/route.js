import { NextResponse } from 'next/server';
import rethinkdb from 'rethinkdb';

async function getDBConnection() {
  try {
    return await rethinkdb.connect({ host: 'localhost', port: 28015, db: 'VehicleDB' });
  } catch (err) {
    console.error('Error establishing a new RethinkDB connection:', err);
    throw err;
  }
}

export async function POST(request) {
  let connection;
  try {
    connection = await getDBConnection();
    const data = await request.json();

    if (!data || !data.make || !data.model) {
      return NextResponse.json({ success: false, message: 'Invalid input data' }, { status: 400 });
    }

    const result = await rethinkdb.table('vehicle').insert(data).run(connection);
    console.log('Vehicle added:', result);

    return NextResponse.json({ success: true, message: 'Vehicle added successfully', result });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return NextResponse.json({ success: false, message: 'Failed to add vehicle', error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      connection.close();
      console.log('Database connection closed after POST.');
    }
  }
}
