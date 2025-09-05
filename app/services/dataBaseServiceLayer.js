
import { DB_NAME, TABLES } from './../../lib/database/rethinkdb-schema.js';
class RethinkDBService {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await r.connect({
        host: process.env.RETHINKDB_HOST || 'localhost',
        port: process.env.RETHINKDB_PORT || 28015,
        db: DB_NAME
      });
      console.log('Connected to RethinkDB');
      return this.connection;
    } catch (error) {
      console.error('RethinkDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      console.log('Disconnected from RethinkDB');
    }
  }

  // Generic CRUD operations
  async create(table, document) {
    try {
      document.created_at = new Date();
      document.updated_at = new Date();
      
      const result = await r.table(table).insert(document).run(this.connection);
      
      if (result.inserted === 1) {
        return { ...document, id: result.generated_keys[0] };
      }
      throw new Error('Failed to insert document');
    } catch (error) {
      console.error(`Error creating document in ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    try {
      return await r.table(table).get(id).run(this.connection);
    } catch (error) {
      console.error(`Error finding document by id in ${table}:`, error);
      throw error;
    }
  }

  async findByIndex(table, index, value) {
    try {
      const cursor = await r.table(table).getAll(value, { index }).run(this.connection);
      return await cursor.toArray();
    } catch (error) {
      console.error(`Error finding documents by index in ${table}:`, error);
      throw error;
    }
  }

  async update(table, id, updates) {
    try {
      updates.updated_at = new Date();
      
      const result = await r.table(table).get(id).update(updates).run(this.connection);
      
      if (result.replaced === 1 || result.unchanged === 1) {
        return await this.findById(table, id);
      }
      throw new Error('Document not found or not updated');
    } catch (error) {
      console.error(`Error updating document in ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      const result = await r.table(table).get(id).delete().run(this.connection);
      return result.deleted === 1;
    } catch (error) {
      console.error(`Error deleting document in ${table}:`, error);
      throw error;
    }
  }

  // Real-time subscription for vehicle tracking
  async subscribeToVehicleEvents(vehicleId, callback) {
    try {
      const cursor = await r.table(TABLES.vehicle_events)
        .filter({ vehicle_id: vehicleId })
        .orderBy(r.desc('timestamp'))
        .limit(100)
        .changes({ includeInitial: true })
        .run(this.connection);

      cursor.each((err, row) => {
        if (err) {
          console.error('Vehicle events subscription error:', err);
          return;
        }
        callback(row);
      });

      return cursor;
    } catch (error) {
      console.error('Error subscribing to vehicle events:', error);
      throw error;
    }
  }

  // Real-time subscription for device data
  async subscribeToDeviceData(deviceIds, callback) {
    try {
      const cursor = await r.table(TABLES.device_data)
        .getAll(r.args(deviceIds), { index: 'device_id' })
        .orderBy(r.desc('timestamp'))
        .limit(1000)
        .changes({ includeInitial: false })
        .run(this.connection);

      cursor.each((err, row) => {
        if (err) {
          console.error('Device data subscription error:', err);
          return;
        }
        callback(row);
      });

      return cursor;
    } catch (error) {
      console.error('Error subscribing to device data:', error);
      throw error;
    }
  }

  // Batch insert for high-frequency data
  async batchInsert(table, documents) {
    try {
      const timestamp = new Date();
      const docsWithTimestamp = documents.map(doc => ({
        ...doc,
        created_at: timestamp
      }));

      const result = await r.table(table).insert(docsWithTimestamp).run(this.connection);
      return result;
    } catch (error) {
      console.error(`Error batch inserting to ${table}:`, error);
      throw error;
    }
  }
}

export default new RethinkDBService();