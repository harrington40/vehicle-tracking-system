export async function PUT(request) {
    let connection;
    try {
      connection = await getDBConnection();
      const data = await request.json();
      const { id, ...updates } = data;
  
      if (!id) {
        return NextResponse.json({ success: false, message: 'Vehicle ID is required for updating' }, { status: 400 });
      }
  
      const result = await rethinkdb.table('vehicle').get(id).update(updates).run(connection);
      console.log('Vehicle updated:', result);
  
      if (result.replaced === 0 && result.unchanged === 0) {
        return NextResponse.json({ success: false, message: 'Vehicle not found or no updates made' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, message: 'Vehicle updated successfully', result });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return NextResponse.json({ success: false, message: 'Failed to update vehicle', error: error.message }, { status: 500 });
    } finally {
      if (connection) {
        connection.close();
        console.log('Database connection closed after PUT.');
      }
    }
  }
  