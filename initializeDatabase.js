const r = require('rethinkdbdash')({
  host: 'localhost', // adjust if your RethinkDB server is not on localhost
  port: 28015,
});

const DB_NAME = 'vehicleMS';
const TABLES_WITH_INDEXES = {
  Vehicle: [],
  Location: [],
  VehicleLocations: ['vehicle_id', 'timestamp'],
  Diagnostic: ['vehicle_id', 'error_code', 'timestamp'],
  Trips: ['vehicle_id', 'start_time', 'end_time'],
  GeoFences: ['vehicle_id', 'type'],
  GeoFenceEvents: ['vehicle_id', 'geo_fence_id', 'timestamp'],
  Role: [],
  User: [],
  UserRole: []
};

async function setupDatabase() {
  try {
    // Check if the database exists, create if it doesn't
    const dbList = await r.dbList();
    if (!dbList.includes(DB_NAME)) {
      console.log(`Creating database: ${DB_NAME}`);
      await r.dbCreate(DB_NAME);
    } else {
      console.log(`Database ${DB_NAME} already exists.`);
    }

    const db = r.db(DB_NAME);

    // Check and create tables and indexes
    const tableList = await db.tableList();
    for (const [table, indexes] of Object.entries(TABLES_WITH_INDEXES)) {
      if (!tableList.includes(table)) {
        console.log(`Creating table: ${table}`);
        await db.tableCreate(table);
      } else {
        console.log(`Table ${table} already exists.`);
      }

      // Ensure indexes for each table
      if (Array.isArray(indexes)) {  // Check that indexes are defined
        const existingIndexes = await db.table(table).indexList();
        for (const index of indexes) {
          if (!existingIndexes.includes(index)) {
            console.log(`Creating index: ${index} on table ${table}`);
            await db.table(table).indexCreate(index);
            await db.table(table).indexWait(index); // Wait for the index to be ready
            console.log(`Index ${index} is now ready on table ${table}`);
          } else {
            console.log(`Index ${index} already exists on table ${table}`);
          }
        }
      } else {
        console.log(`No indexes defined for table ${table}`);
      }
    }

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the RethinkDB connection pool
    r.getPoolMaster().drain();
  }
}

setupDatabase();
