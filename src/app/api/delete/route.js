export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let connection;
  
    try {
      if (!id) {
        return NextResponse.json({ success: false, message: 'Vehicle ID is required for deletion' }, { status: 400 });
      }
  
      connection = await getDBConnection();
      const result = await rethinkdb.table('vehicle').get(id).delete().run(connection);
  
      console.log('Vehicle deleted:', result);
      if (result.deleted === 0) {
        return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, message: 'Vehicle deleted successfully', result });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return NextResponse.json({ success: false, message: 'Failed to delete vehicle', error: error.message }, { status: 500 });
    } finally {
      if (connection) {
        connection.close();
        console.log('Database connection closed after DELETE.');
      }
    }
  }
  