export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let connection;
  
    try {
      connection = await getDBConnection();
      let result;
  
      if (id) {
        console.log(`Fetching vehicle with ID: ${id}`);
        result = await rethinkdb.table('vehicle').get(id).run(connection);
        if (!result) {
          return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
        }
      } else {
        console.log('Fetching all vehicles');
        const cursor = await rethinkdb.table('vehicle').run(connection);
        result = await cursor.toArray();
      }
  
      return NextResponse.json({ success: true, vehicles: result });
    } catch (error) {
      console.error('Error fetching vehicle(s):', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch vehicle(s)', error: error.message }, { status: 500 });
    } finally {
      if (connection) {
        connection.close();
        console.log('Database connection closed after GET.');
      }
    }
  }
  