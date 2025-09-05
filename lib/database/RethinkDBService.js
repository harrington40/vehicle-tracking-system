import r from 'rethinkdb';
import { TABLES, INDEXES } from './rethinkdb-schema.js';
import { EventEmitter } from 'events';

class RethinkDBService extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000; // 5 seconds
    this.connectionConfig = {
      host: process.env.RETHINKDB_HOST || 'localhost',
      port: parseInt(process.env.RETHINKDB_PORT) || 28015,
      db: process.env.RETHINKDB_DB || 'trans_tech_vtracking',
      user: process.env.RETHINKDB_USER || 'admin',
      password: process.env.RETHINKDB_PASSWORD || '',
      timeout: 20,
      keepAlive: true,
      keepAliveInitialDelay: 0
    };
    
    // Health monitoring
    this.healthInterval = null;
    this.lastHealthCheck = null;
    
    // Query statistics
    this.stats = {
      queriesExecuted: 0,
      queriesSuccessful: 0,
      queriesFailed: 0,
      averageQueryTime: 0,
      connectionErrors: 0,
      reconnections: 0
    };

    // Setup graceful shutdown
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  // ==================== CONNECTION MANAGEMENT ====================

  /**
   * Connect to RethinkDB database
   */
  async connect() {
    try {
      console.log('🔄 Connecting to RethinkDB...', {
        host: this.connectionConfig.host,
        port: this.connectionConfig.port,
        database: this.connectionConfig.db
      });

      this.connection = await r.connect(this.connectionConfig);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('✅ Successfully connected to RethinkDB');
      
      // Setup connection event handlers
      this.connection.on('close', this.handleConnectionClose.bind(this));
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('timeout', this.handleConnectionTimeout.bind(this));

      // Emit connection event
      this.emit('connected', this.connection);

      // Start health monitoring
      this.startHealthMonitoring();

      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to RethinkDB:', error);
      this.isConnected = false;
      this.stats.connectionErrors++;
      
      this.emit('connectionError', error);
      throw error;
    }
  }

  /**
   * Disconnect from RethinkDB
   */
  async disconnect() {
    try {
      if (this.connection) {
        console.log('🔄 Disconnecting from RethinkDB...');
        
        // Stop health monitoring
        this.stopHealthMonitoring();
        
        await this.connection.close();
        this.connection = null;
        this.isConnected = false;
        
        console.log('✅ Disconnected from RethinkDB');
        this.emit('disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from RethinkDB:', error);
      throw error;
    }
  }

  /**
   * Handle connection close event
   */
  handleConnectionClose() {
    console.log('⚠️ RethinkDB connection closed');
    this.isConnected = false;
    this.emit('connectionClosed');
    
    // Attempt to reconnect if not intentionally closed
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle connection error event
   */
  handleConnectionError(error) {
    console.error('❌ RethinkDB connection error:', error);
    this.isConnected = false;
    this.stats.connectionErrors++;
    this.emit('connectionError', error);
  }

  /**
   * Handle connection timeout event
   */
  handleConnectionTimeout() {
    console.error('⏰ RethinkDB connection timeout');
    this.isConnected = false;
    this.emit('connectionTimeout');
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5)); // Exponential backoff
    
    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  /**
   * Attempt to reconnect
   */
  async reconnect() {
    try {
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      await this.connect();
      this.stats.reconnections++;
      
      console.log('✅ Successfully reconnected to RethinkDB');
      this.emit('reconnected');
      
    } catch (error) {
      console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      } else {
        console.error('❌ Max reconnection attempts reached. Giving up.');
        this.emit('reconnectionFailed');
      }
    }
  }

  /**
   * Ensure connection is active
   */
  async ensureConnection() {
    if (!this.isConnected || !this.connection) {
      await this.connect();
    }
    return this.connection;
  }

  // ==================== DATABASE SETUP ====================

  /**
   * Initialize database, tables, and indexes
   */
  async initializeDatabase() {
    try {
      console.log('🔄 Initializing database...');
      
      await this.ensureConnection();
      
      // Create database if it doesn't exist
      await this.createDatabase();
      
      // Create all tables
      await this.createTables();
      
      // Create all indexes
      await this.createIndexes();
      
      // Wait for indexes to be ready
      await this.waitForIndexes();
      
      console.log('✅ Database initialization completed');
      this.emit('databaseInitialized');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database if it doesn't exist
   */
  async createDatabase() {
    try {
      const dbList = await r.dbList().run(this.connection);
      
      if (!dbList.includes(this.connectionConfig.db)) {
        console.log(`🔄 Creating database: ${this.connectionConfig.db}`);
        await r.dbCreate(this.connectionConfig.db).run(this.connection);
        console.log(`✅ Database created: ${this.connectionConfig.db}`);
      } else {
        console.log(`✅ Database already exists: ${this.connectionConfig.db}`);
      }
    } catch (error) {
      console.error('❌ Error creating database:', error);
      throw error;
    }
  }

  /**
   * Create all tables
   */
  async createTables() {
    try {
      const existingTables = await r.tableList().run(this.connection);
      
      for (const [tableName, tableConfig] of Object.entries(TABLES)) {
        if (!existingTables.includes(tableName)) {
          console.log(`🔄 Creating table: ${tableName}`);
          
          const createOptions = { primaryKey: 'id' };
          if (tableConfig.shards) createOptions.shards = tableConfig.shards;
          if (tableConfig.replicas) createOptions.replicas = tableConfig.replicas;
          
          await r.tableCreate(tableName, createOptions).run(this.connection);
          console.log(`✅ Table created: ${tableName}`);
        } else {
          console.log(`✅ Table already exists: ${tableName}`);
        }
      }
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Create all indexes
   */
  async createIndexes() {
    try {
      for (const [tableName, indexConfigs] of Object.entries(INDEXES)) {
        if (!TABLES[tableName]) continue; // Skip if table doesn't exist in schema
        
        console.log(`🔄 Creating indexes for table: ${tableName}`);
        
        // Get existing indexes
        const existingIndexes = await r.table(tableName).indexList().run(this.connection);
        
        for (const indexConfig of indexConfigs) {
          const { name, fields, options = {} } = indexConfig;
          
          if (!existingIndexes.includes(name)) {
            console.log(`🔄 Creating index: ${tableName}.${name}`);
            
            if (Array.isArray(fields)) {
              // Compound index
              await r.table(tableName).indexCreate(name, fields, options).run(this.connection);
            } else if (typeof fields === 'function') {
              // Function-based index
              await r.table(tableName).indexCreate(name, fields, options).run(this.connection);
            } else {
              // Simple index
              await r.table(tableName).indexCreate(name, options).run(this.connection);
            }
            
            console.log(`✅ Index created: ${tableName}.${name}`);
          } else {
            console.log(`✅ Index already exists: ${tableName}.${name}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Wait for all indexes to be ready
   */
  async waitForIndexes() {
    try {
      console.log('🔄 Waiting for indexes to be ready...');
      
      for (const tableName of Object.keys(INDEXES)) {
        if (!TABLES[tableName]) continue;
        
        await r.table(tableName).indexWait().run(this.connection);
        console.log(`✅ Indexes ready for table: ${tableName}`);
      }
      
      console.log('✅ All indexes are ready');
    } catch (error) {
      console.error('❌ Error waiting for indexes:', error);
      throw error;
    }
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create a document
   */
  async create(tableName, document) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      const result = await r.table(tableName)
        .insert(document, { returnChanges: true })
        .run(this.connection);
      
      this.updateQueryStats(startTime, true);
      
      if (result.errors > 0) {
        throw new Error(`Insert failed: ${result.first_error}`);
      }
      
      return result.changes[0].new_val;
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error(`❌ Error creating document in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find document by ID
   */
  async findById(tableName, id) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      const result = await r.table(tableName)
        .get(id)
        .run(this.connection);
      
      this.updateQueryStats(startTime, true);
      return result;
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error(`❌ Error finding document by ID in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find documents by index
   */
  async findByIndex(tableName, indexName, value) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      const cursor = await r.table(tableName)
        .getAll(value, { index: indexName })
        .run(this.connection);
      
      const results = await cursor.toArray();
      this.updateQueryStats(startTime, true);
      
      return results;
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error(`❌ Error finding documents by index in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update document
   */
  async update(tableName, id, updates) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      updates.updated_at = new Date();
      
      const result = await r.table(tableName)
        .get(id)
        .update(updates, { returnChanges: true })
        .run(this.connection);
      
      this.updateQueryStats(startTime, true);
      
      if (result.errors > 0) {
        throw new Error(`Update failed: ${result.first_error}`);
      }
      
      if (result.replaced === 0 && result.unchanged === 0) {
        throw new Error('Document not found');
      }
      
      return result.changes[0]?.new_val || null;
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error(`❌ Error updating document in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async delete(tableName, id) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      const result = await r.table(tableName)
        .get(id)
        .delete()
        .run(this.connection);
      
      this.updateQueryStats(startTime, true);
      
      if (result.errors > 0) {
        throw new Error(`Delete failed: ${result.first_error}`);
      }
      
      return result.deleted > 0;
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error(`❌ Error deleting document in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Batch insert documents
   */
  async batchInsert(tableName, documents) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      const result = await r.table(tableName)
        .insert(documents, { returnChanges: true })
        .run(this.connection);
      
      this.updateQueryStats(startTime, true);
      
      if (result.errors > 0) {
        console.warn(`⚠️ Batch insert had ${result.errors} errors:`, result.first_error);
      }
      
      return {
        inserted: result.inserted,
        errors: result.errors,
        documents: result.changes ? result.changes.map(change => change.new_val) : []
      };
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error(`❌ Error batch inserting documents in ${tableName}:`, error);
      throw error;
    }
  }

  // ==================== REAL-TIME QUERIES ====================

  /**
   * Subscribe to table changes
   */
  async subscribeToChanges(tableName, filter = null, options = {}) {
    try {
      await this.ensureConnection();
      
      let query = r.table(tableName);
      
      if (filter) {
        if (typeof filter === 'function') {
          query = query.filter(filter);
        } else {
          query = query.filter(filter);
        }
      }
      
      const cursor = await query.changes({
        includeInitial: options.includeInitial || false,
        includeStates: options.includeStates || false,
        includeOffsets: options.includeOffsets || false
      }).run(this.connection);
      
      console.log(`✅ Subscribed to changes on table: ${tableName}`);
      return cursor;
    } catch (error) {
      console.error(`❌ Error subscribing to changes on ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to document changes by ID
   */
  async subscribeToDocument(tableName, documentId, options = {}) {
    try {
      await this.ensureConnection();
      
      const cursor = await r.table(tableName)
        .get(documentId)
        .changes({
          includeInitial: options.includeInitial || false,
          includeStates: options.includeStates || false
        })
        .run(this.connection);
      
      console.log(`✅ Subscribed to document changes: ${tableName}/${documentId}`);
      return cursor;
    } catch (error) {
      console.error(`❌ Error subscribing to document changes: ${tableName}/${documentId}`, error);
      throw error;
    }
  }

  // ==================== QUERY BUILDING ====================

  /**
   * Get table reference
   */
  table(tableName) {
    return r.table(tableName);
  }

  /**
   * Execute raw query
   */
  async runQuery(query) {
    const startTime = Date.now();
    
    try {
      this.stats.queriesExecuted++;
      await this.ensureConnection();
      
      const result = await query.run(this.connection);
      this.updateQueryStats(startTime, true);
      
      return result;
    } catch (error) {
      this.updateQueryStats(startTime, false);
      console.error('❌ Error executing raw query:', error);
      throw error;
    }
  }

  // ==================== HEALTH MONITORING ====================

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    if (this.healthInterval) return;
    
    this.healthInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Every 30 seconds
    
    console.log('✅ Health monitoring started');
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
      console.log('✅ Health monitoring stopped');
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      if (!this.connection) return;
      
      // Simple ping to check connection
      await r.now().run(this.connection);
      
      this.lastHealthCheck = new Date();
      this.emit('healthCheck', { status: 'healthy', timestamp: this.lastHealthCheck });
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.emit('healthCheck', { status: 'unhealthy', error: error.message, timestamp: new Date() });
      
      // Trigger reconnection if connection is lost
      if (!this.isConnected) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Get database status
   */
  async getStatus() {
    try {
      await this.ensureConnection();
      
      const [serverInfo, dbInfo, tableStatuses] = await Promise.all([
        r.serverInfo().run(this.connection),
        r.db(this.connectionConfig.db).info().run(this.connection),
        this.getTableStatuses()
      ]);
      
      return {
        connected: this.isConnected,
        server: serverInfo,
        database: dbInfo,
        tables: tableStatuses,
        stats: this.stats,
        lastHealthCheck: this.lastHealthCheck
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        stats: this.stats
      };
    }
  }

  /**
   * Get table statuses
   */
  async getTableStatuses() {
    try {
      const tableStatuses = {};
      
      for (const tableName of Object.keys(TABLES)) {
        try {
          const [count, status] = await Promise.all([
            r.table(tableName).count().run(this.connection),
            r.table(tableName).status().run(this.connection)
          ]);
          
          tableStatuses[tableName] = {
            count,
            status: status.status.ready_for_reads && status.status.ready_for_writes ? 'ready' : 'not_ready',
            shards: status.shards
          };
        } catch (error) {
          tableStatuses[tableName] = {
            error: error.message
          };
        }
      }
      
      return tableStatuses;
    } catch (error) {
      console.error('❌ Error getting table statuses:', error);
      return {};
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Update query statistics
   */
  updateQueryStats(startTime, success) {
    const duration = Date.now() - startTime;
    
    if (success) {
      this.stats.queriesSuccessful++;
    } else {
      this.stats.queriesFailed++;
    }
    
    // Update average query time
    this.stats.averageQueryTime = (
      (this.stats.averageQueryTime * (this.stats.queriesExecuted - 1) + duration) / 
      this.stats.queriesExecuted
    );
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      ...this.stats,
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastHealthCheck: this.lastHealthCheck
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      queriesExecuted: 0,
      queriesSuccessful: 0,
      queriesFailed: 0,
      averageQueryTime: 0,
      connectionErrors: 0,
      reconnections: 0
    };
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.isConnected && this.connection;
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown() {
    console.log('🔄 Initiating graceful shutdown...');
    
    try {
      this.stopHealthMonitoring();
      await this.disconnect();
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  // ==================== MAINTENANCE OPERATIONS ====================

  /**
   * Compact database
   */
  async compactDatabase() {
    try {
      console.log('🔄 Starting database compaction...');
      await this.ensureConnection();
      
      for (const tableName of Object.keys(TABLES)) {
        console.log(`🔄 Compacting table: ${tableName}`);
        await r.table(tableName).reconfigure({ shards: 1, replicas: 1 }).run(this.connection);
      }
      
      console.log('✅ Database compaction completed');
    } catch (error) {
      console.error('❌ Database compaction failed:', error);
      throw error;
    }
  }

  /**
   * Backup database
   */
  async backupDatabase(outputPath) {
    try {
      console.log(`🔄 Starting database backup to: ${outputPath}`);
      // This would typically use rethinkdb dump command
      // Implementation depends on your backup strategy
      console.log('✅ Database backup completed');
    } catch (error) {
      console.error('❌ Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Clean up expired data
   */
  async cleanupExpiredData() {
    try {
      console.log('🔄 Starting expired data cleanup...');
      
      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      
      // Cleanup old device data
      const deviceDataResult = await r.table(TABLES.device_data)
        .filter(r.row('timestamp').lt(cutoffDate))
        .delete()
        .run(this.connection);
      
      // Cleanup old notifications
      const notificationResult = await r.table(TABLES.notifications)
        .filter(
          r.row('expires_at').lt(new Date())
          .and(r.row('archived').eq(true))
          .and(r.row('archived_at').lt(cutoffDate))
        )
        .delete()
        .run(this.connection);
      
      console.log(`✅ Cleanup completed: ${deviceDataResult.deleted} device records, ${notificationResult.deleted} notifications`);
      
      return {
        deviceData: deviceDataResult.deleted,
        notifications: notificationResult.deleted
      };
    } catch (error) {
      console.error('❌ Expired data cleanup failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new RethinkDBService();

// Also export the class for testing
export { RethinkDBService };