import RethinkDBService from '../database/RethinkDBService.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import { 
  CustomerValidationSchema, 
  UserValidationSchema, 
  DeviceValidationSchema,
  VehicleValidationSchema,
  VehicleEventValidationSchema,
  DeviceDataValidationSchema,
  GeofenceValidationSchema,
  NotificationValidationSchema,
  SubscriptionValidationSchema,
  BillingRecordValidationSchema,
  PaginationSchema,
  DateRangeSchema
} from '../schemas/DocumentSchemas.js';
import { SchemaFactory } from '../schemas/SchemaFactory.js';
import r from 'rethinkdb';
import { v4 as uuidv4 } from 'uuid';

export class DocumentRepository {
  constructor() {
    this.db = RethinkDBService;
    this.schemaFactory = SchemaFactory;
  }

  // ==================== GENERIC CRUD OPERATIONS ====================

  /**
   * Generic create method with validation
   */
  async create(tableName, data, validationSchema = null) {
    try {
      // Validate data if schema provided
      if (validationSchema) {
        const { error, value } = validationSchema.validate(data);
        if (error) {
          throw new Error(`Validation error: ${error.details[0].message}`);
        }
        data = value;
      }

      // Add ID and timestamps if not present
      if (!data.id) data.id = uuidv4();
      if (!data.created_at) data.created_at = new Date();
      if (!data.updated_at) data.updated_at = new Date();

      const result = await r.table(tableName)
        .insert(data, { returnChanges: true })
        .run(this.db.connection);

      if (result.errors > 0) {
        throw new Error(`Insert failed: ${result.first_error}`);
      }

      return result.changes[0].new_val;
    } catch (error) {
      console.error(`Error creating document in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generic find by ID method
   */
  async findById(tableName, id) {
    try {
      const result = await r.table(tableName)
        .get(id)
        .run(this.db.connection);

      return result;
    } catch (error) {
      console.error(`Error finding document by ID in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generic find by index method
   */
  async findByIndex(tableName, indexName, value, options = {}) {
    try {
      let query = r.table(tableName).getAll(value, { index: indexName });

      // Apply ordering
      if (options.orderBy) {
        query = options.desc 
          ? query.orderBy(r.desc(options.orderBy))
          : query.orderBy(options.orderBy);
      }

      // Apply pagination
      if (options.limit) {
        if (options.offset) query = query.skip(options.offset);
        query = query.limit(options.limit);
      }

      const cursor = await query.run(this.db.connection);
      return await cursor.toArray();
    } catch (error) {
      console.error(`Error finding documents by index in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generic update method
   */
  async update(tableName, id, updates) {
    try {
      updates.updated_at = new Date();

      const result = await r.table(tableName)
        .get(id)
        .update(updates, { returnChanges: true })
        .run(this.db.connection);

      if (result.errors > 0) {
        throw new Error(`Update failed: ${result.first_error}`);
      }

      if (result.replaced === 0 && result.unchanged === 0) {
        throw new Error('Document not found');
      }

      return result.changes[0]?.new_val || await this.findById(tableName, id);
    } catch (error) {
      console.error(`Error updating document in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generic delete method
   */
  async delete(tableName, id) {
    try {
      const result = await r.table(tableName)
        .get(id)
        .delete()
        .run(this.db.connection);

      if (result.errors > 0) {
        throw new Error(`Delete failed: ${result.first_error}`);
      }

      return result.deleted > 0;
    } catch (error) {
      console.error(`Error deleting document in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generic batch insert method
   */
  async batchInsert(tableName, documents) {
    try {
      // Add IDs and timestamps to all documents
      const processedDocs = documents.map(doc => ({
        ...doc,
        id: doc.id || uuidv4(),
        created_at: doc.created_at || new Date(),
        updated_at: doc.updated_at || new Date()
      }));

      const result = await r.table(tableName)
        .insert(processedDocs, { returnChanges: true })
        .run(this.db.connection);

      if (result.errors > 0) {
        console.error(`Batch insert had ${result.errors} errors:`, result.first_error);
      }

      return {
        inserted: result.inserted,
        errors: result.errors,
        documents: result.changes.map(change => change.new_val)
      };
    } catch (error) {
      console.error(`Error batch inserting documents in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generic count method
   */
  async count(tableName, filter = null) {
    try {
      let query = r.table(tableName);
      
      if (filter) {
        query = query.filter(filter);
      }

      return await query.count().run(this.db.connection);
    } catch (error) {
      console.error(`Error counting documents in ${tableName}:`, error);
      throw error;
    }
  }

  // ==================== CUSTOMER REPOSITORY ====================

  async createCustomer(customerData) {
    return await this.create(TABLES.customers, customerData, CustomerValidationSchema);
  }

  async findCustomerById(customerId) {
    return await this.findById(TABLES.customers, customerId);
  }

  async findCustomerByEmail(email) {
    const results = await this.findByIndex(TABLES.customers, 'email', email.toLowerCase());
    return results[0] || null;
  }

  async updateCustomer(customerId, updates) {
    return await this.update(TABLES.customers, customerId, updates);
  }

  async findCustomersByStatus(status, options = {}) {
    return await this.findByIndex(TABLES.customers, 'status', status, options);
  }

  async getCustomerStats(customerId) {
    try {
      const [vehicleCount, deviceCount, userCount, activeSubscription] = await Promise.all([
        this.count(TABLES.vehicles, { customer_id: customerId }),
        this.count(TABLES.devices, { customer_id: customerId }),
        this.count(TABLES.users, { customer_id: customerId, is_active: true }),
        this.findActiveSubscription(customerId)
      ]);

      return {
        vehicles: vehicleCount,
        devices: deviceCount,
        active_users: userCount,
        subscription_status: activeSubscription?.status || 'none'
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      throw error;
    }
  }

  // ==================== USER REPOSITORY ====================

  async createUser(userData) {
    return await this.create(TABLES.users, userData, UserValidationSchema);
  }

  async findUserById(userId) {
    return await this.findById(TABLES.users, userId);
  }

  async findUserByEmail(email) {
    const results = await this.findByIndex(TABLES.users, 'email', email.toLowerCase());
    return results[0] || null;
  }

  async findUserByAuth0Id(auth0Id) {
    try {
      const cursor = await r.table(TABLES.users)
        .filter({ auth0_user_id: auth0Id })
        .run(this.db.connection);
      
      const users = await cursor.toArray();
      return users[0] || null;
    } catch (error) {
      console.error('Error finding user by Auth0 ID:', error);
      return null;
    }
  }

  async findUsersByCustomer(customerId, options = {}) {
    return await this.findByIndex(TABLES.users, 'customer_id', customerId, options);
  }

  async findUsersByRole(customerId, role, options = {}) {
    try {
      let query = r.table(TABLES.users)
        .getAll(customerId, { index: 'customer_id' })
        .filter({ role: role });

      if (options.activeOnly) {
        query = query.filter({ is_active: true });
      }

      if (options.orderBy) {
        query = options.desc 
          ? query.orderBy(r.desc(options.orderBy))
          : query.orderBy(options.orderBy);
      }

      if (options.limit) {
        if (options.offset) query = query.skip(options.offset);
        query = query.limit(options.limit);
      }

      const cursor = await query.run(this.db.connection);
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    // Remove sensitive fields that shouldn't be updated directly
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.password_hash;
    delete sanitizedUpdates.created_at;

    return await this.update(TABLES.users, userId, sanitizedUpdates);
  }

  async updateUserLastLogin(userId) {
    return await this.update(TABLES.users, userId, {
      last_login: new Date(),
      login_count: r.row('login_count').default(0).add(1)
    });
  }

  async deactivateUser(userId) {
    return await this.update(TABLES.users, userId, {
      is_active: false,
      deactivated_at: new Date()
    });
  }

  async activateUser(userId) {
    return await this.update(TABLES.users, userId, {
      is_active: true,
      deactivated_at: null
    });
  }

  // ==================== DEVICE REPOSITORY ====================

  async createDevice(deviceData) {
    return await this.create(TABLES.devices, deviceData, DeviceValidationSchema);
  }

  async findDeviceById(deviceId) {
    return await this.findById(TABLES.devices, deviceId);
  }

  async findDeviceBySerialNumber(serialNumber) {
    const results = await this.findByIndex(TABLES.devices, 'serial_number', serialNumber.toUpperCase());
    return results[0] || null;
  }

  async findDevicesByCustomer(customerId, options = {}) {
    return await this.findByIndex(TABLES.devices, 'customer_id', customerId, options);
  }

  async findDevicesByStatus(status, options = {}) {
    return await this.findByIndex(TABLES.devices, 'status', status, options);
  }

  async updateDevice(deviceId, updates) {
    return await this.update(TABLES.devices, deviceId, updates);
  }

  async updateDeviceHeartbeat(deviceId, locationData = null) {
    const updates = { last_heartbeat: new Date() };
    
    if (locationData) {
      updates.last_location = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy || 10,
        timestamp: new Date()
      };
    }

    return await this.update(TABLES.devices, deviceId, updates);
  }

  async findDevicesNeedingMaintenance() {
    try {
      const cursor = await r.table(TABLES.devices)
        .filter(
          r.row('warranty')('end_date').lt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days
        )
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding devices needing maintenance:', error);
      return [];
    }
  }

  // ==================== VEHICLE REPOSITORY ====================

  async createVehicle(vehicleData) {
    return await this.create(TABLES.vehicles, vehicleData, VehicleValidationSchema);
  }

  async findVehicleById(vehicleId) {
    return await this.findById(TABLES.vehicles, vehicleId);
  }

  async findVehicleByDeviceId(deviceId) {
    const results = await this.findByIndex(TABLES.vehicles, 'device_id', deviceId);
    return results[0] || null;
  }

  async findVehiclesByCustomer(customerId, options = {}) {
    return await this.findByIndex(TABLES.vehicles, 'customer_id', customerId, options);
  }

  async findVehiclesByDriver(driverId, options = {}) {
    return await this.findByIndex(TABLES.vehicles, 'assigned_driver_id', driverId, options);
  }

  async findVehiclesByStatus(customerId, status, options = {}) {
    try {
      let query = r.table(TABLES.vehicles)
        .getAll(customerId, { index: 'customer_id' })
        .filter({ status: status });

      if (options.orderBy) {
        query = options.desc 
          ? query.orderBy(r.desc(options.orderBy))
          : query.orderBy(options.orderBy);
      }

      if (options.limit) {
        if (options.offset) query = query.skip(options.offset);
        query = query.limit(options.limit);
      }

      const cursor = await query.run(this.db.connection);
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding vehicles by status:', error);
      throw error;
    }
  }

  async updateVehicle(vehicleId, updates) {
    return await this.update(TABLES.vehicles, vehicleId, updates);
  }

  async assignDriverToVehicle(vehicleId, driverId, assignedBy) {
    return await this.update(TABLES.vehicles, vehicleId, {
      assigned_driver_id: driverId,
      assigned_at: new Date(),
      assigned_by: assignedBy
    });
  }

  async unassignDriverFromVehicle(vehicleId) {
    return await this.update(TABLES.vehicles, vehicleId, {
      assigned_driver_id: null,
      assigned_at: null,
      assigned_by: null
    });
  }

  async findVehiclesNeedingMaintenance(customerId) {
    try {
      const cursor = await r.table(TABLES.vehicles)
        .getAll(customerId, { index: 'customer_id' })
        .filter(
          r.row('maintenance')('next_service_due').lt(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
        )
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding vehicles needing maintenance:', error);
      return [];
    }
  }

  // ==================== VEHICLE EVENT REPOSITORY ====================

  async createVehicleEvent(eventData) {
    const event = this.schemaFactory.createVehicleEvent(eventData);
    return await this.create(TABLES.vehicle_events, event);
  }

  async findEventById(eventId) {
    return await this.findById(TABLES.vehicle_events, eventId);
  }

  async findEventsByVehicle(vehicleId, options = {}) {
    const defaultOptions = {
      orderBy: 'timestamp',
      desc: true,
      limit: 50
    };
    
    return await this.findByIndex(TABLES.vehicle_events, 'vehicle_id', vehicleId, { ...defaultOptions, ...options });
  }

  async findEventsByCustomer(customerId, options = {}) {
    const defaultOptions = {
      orderBy: 'timestamp',
      desc: true,
      limit: 100
    };
    
    return await this.findByIndex(TABLES.vehicle_events, 'customer_id', customerId, { ...defaultOptions, ...options });
  }

  async findEventsByType(customerId, eventType, options = {}) {
    try {
      let query = r.table(TABLES.vehicle_events)
        .getAll(customerId, { index: 'customer_id' })
        .filter({ event_type: eventType });

      if (options.startDate && options.endDate) {
        query = query.filter(
          r.row('timestamp').during(options.startDate, options.endDate)
        );
      }

      if (options.vehicleId) {
        query = query.filter({ vehicle_id: options.vehicleId });
      }

      if (options.severity) {
        query = query.filter({ severity: options.severity });
      }

      query = query.orderBy(r.desc('timestamp'));

      if (options.limit) {
        if (options.offset) query = query.skip(options.offset);
        query = query.limit(options.limit);
      }

      const cursor = await query.run(this.db.connection);
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding events by type:', error);
      throw error;
    }
  }

  async findRecentAlerts(customerId, hours = 24) {
    try {
      const sinceTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const cursor = await r.table(TABLES.vehicle_events)
        .getAll(customerId, { index: 'customer_id' })
        .filter(
          r.row('timestamp').gt(sinceTime)
          .and(r.row('severity').match('warning|critical'))
        )
        .orderBy(r.desc('timestamp'))
        .limit(50)
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding recent alerts:', error);
      return [];
    }
  }

  async acknowledgeEvent(eventId, userId) {
    return await this.update(TABLES.vehicle_events, eventId, {
      acknowledged: true,
      acknowledged_by: userId,
      acknowledged_at: new Date()
    });
  }

  async resolveEvent(eventId, userId) {
    return await this.update(TABLES.vehicle_events, eventId, {
      resolved: true,
      resolved_by: userId,
      resolved_at: new Date()
    });
  }

  // ==================== DEVICE DATA REPOSITORY ====================

  async createDeviceData(deviceData) {
    // Handle both single object and array
    if (Array.isArray(deviceData)) {
      return await this.batchInsert(TABLES.device_data, deviceData);
    } else {
      return await this.create(TABLES.device_data, deviceData, DeviceDataValidationSchema);
    }
  }

  async findLatestDeviceData(deviceId, limit = 1) {
    try {
      const cursor = await r.table(TABLES.device_data)
        .getAll(deviceId, { index: 'device_id' })
        .orderBy(r.desc('timestamp'))
        .limit(limit)
        .run(this.db.connection);
      
      const results = await cursor.toArray();
      return limit === 1 ? (results[0] || null) : results;
    } catch (error) {
      console.error('Error finding latest device data:', error);
      return limit === 1 ? null : [];
    }
  }

  async findDeviceDataInRange(deviceId, startTime, endTime, limit = 1000) {
    try {
      const cursor = await r.table(TABLES.device_data)
        .getAll(deviceId, { index: 'device_id' })
        .filter(r.row('timestamp').during(startTime, endTime))
        .orderBy('timestamp')
        .limit(limit)
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding device data in range:', error);
      return [];
    }
  }

  async findDeviceDataForTrip(deviceId, tripStart, tripEnd) {
    return await this.findDeviceDataInRange(deviceId, tripStart, tripEnd);
  }

  async aggregateDeviceData(deviceId, startTime, endTime, interval = '1h') {
    try {
      const cursor = await r.table(TABLES.device_data)
        .getAll(deviceId, { index: 'device_id' })
        .filter(r.row('timestamp').during(startTime, endTime))
        .group(r.row('timestamp').floor(interval))
        .ungroup()
        .map((group) => ({
          timestamp: group('group'),
          count: group('reduction').count(),
          avg_speed: group('reduction').avg('location')('speed'),
          max_speed: group('reduction').max('location')('speed'),
          distance: group('reduction').sum('distance') // Assuming distance is calculated
        }))
        .orderBy('timestamp')
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error aggregating device data:', error);
      return [];
    }
  }

  async cleanupOldDeviceData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await r.table(TABLES.device_data)
        .filter(r.row('timestamp').lt(cutoffDate))
        .delete()
        .run(this.db.connection);

      console.log(`Cleaned up ${result.deleted} old device data records`);
      return result.deleted;
    } catch (error) {
      console.error('Error cleaning up old device data:', error);
      throw error;
    }
  }

  // ==================== GEOFENCE REPOSITORY ====================

  async createGeofence(geofenceData) {
    return await this.create(TABLES.geofences, geofenceData, GeofenceValidationSchema);
  }

  async findGeofenceById(geofenceId) {
    return await this.findById(TABLES.geofences, geofenceId);
  }

  async findGeofencesByCustomer(customerId, options = {}) {
    return await this.findByIndex(TABLES.geofences, 'customer_id', customerId, options);
  }

  async updateGeofence(geofenceId, updates) {
    return await this.update(TABLES.geofences, geofenceId, updates);
  }

  async deleteGeofence(geofenceId) {
    return await this.delete(TABLES.geofences, geofenceId);
  }

  async findActiveGeofences(customerId) {
    try {
      const cursor = await r.table(TABLES.geofences)
        .getAll(customerId, { index: 'customer_id' })
        .filter({ active: true })
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding active geofences:', error);
      return [];
    }
  }

  // ==================== SUBSCRIPTION REPOSITORY ====================

  async createSubscription(subscriptionData) {
    return await this.create(TABLES.subscriptions, subscriptionData, SubscriptionValidationSchema);
  }

  async findSubscriptionById(subscriptionId) {
    return await this.findById(TABLES.subscriptions, subscriptionId);
  }

  async findActiveSubscription(customerId) {
    try {
      const cursor = await r.table(TABLES.subscriptions)
        .getAll(customerId, { index: 'customer_id' })
        .filter({ status: 'active' })
        .orderBy(r.desc('created_at'))
        .limit(1)
        .run(this.db.connection);
      
      const results = await cursor.toArray();
      return results[0] || null;
    } catch (error) {
      console.error('Error finding active subscription:', error);
      return null;
    }
  }

  async updateSubscription(subscriptionId, updates) {
    return await this.update(TABLES.subscriptions, subscriptionId, updates);
  }

  async findExpiredTrials() {
    try {
      const now = new Date();
      const cursor = await r.table(TABLES.subscriptions)
        .filter(
          r.row('status').eq('trial')
          .and(r.row('trial_end').lt(now))
        )
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding expired trials:', error);
      return [];
    }
  }

  // ==================== BILLING REPOSITORY ====================

  async createBillingRecord(billingData) {
    return await this.create(TABLES.billing_records, billingData, BillingRecordValidationSchema);
  }

  async findBillingRecordsByCustomer(customerId, options = {}) {
    const defaultOptions = {
      orderBy: 'created_at',
      desc: true,
      limit: 50
    };
    
    return await this.findByIndex(TABLES.billing_records, 'customer_id', customerId, { ...defaultOptions, ...options });
  }

  async findPendingPayments() {
    return await this.findByIndex(TABLES.billing_records, 'status', 'pending');
  }

  async updateBillingRecord(recordId, updates) {
    return await this.update(TABLES.billing_records, recordId, updates);
  }

  // ==================== NOTIFICATION REPOSITORY ====================

  async createNotification(notificationData) {
    return await this.create(TABLES.notifications, notificationData, NotificationValidationSchema);
  }

  async findNotificationsByUser(userId, options = {}) {
    const defaultOptions = {
      orderBy: 'created_at',
      desc: true,
      limit: 50
    };
    
    return await this.findByIndex(TABLES.notifications, 'user_id', userId, { ...defaultOptions, ...options });
  }

  async findUnreadNotifications(userId) {
    try {
      const cursor = await r.table(TABLES.notifications)
        .getAll(userId, { index: 'user_id' })
        .filter({ read: false })
        .orderBy(r.desc('created_at'))
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error finding unread notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId) {
    return await this.update(TABLES.notifications, notificationId, {
      read: true,
      read_at: new Date()
    });
  }

  async archiveNotification(notificationId) {
    return await this.update(TABLES.notifications, notificationId, {
      archived: true,
      archived_at: new Date()
    });
  }

  // ==================== SEARCH AND ANALYTICS ====================

  async searchVehicles(customerId, searchTerm, options = {}) {
    try {
      const cursor = await r.table(TABLES.vehicles)
        .getAll(customerId, { index: 'customer_id' })
        .filter((vehicle) =>
          vehicle('vehicle_info')('make').match(`(?i)${searchTerm}`)
          .or(vehicle('vehicle_info')('model').match(`(?i)${searchTerm}`))
          .or(vehicle('vehicle_info')('license_plate').match(`(?i)${searchTerm}`))
          .or(vehicle('vehicle_info')('vin').match(`(?i)${searchTerm}`))
        )
        .limit(options.limit || 20)
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
  }

  async getFleetAnalytics(customerId, timeRange = '7d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate start date based on time range
      switch (timeRange) {
        case '24h': startDate.setHours(startDate.getHours() - 24); break;
        case '7d': startDate.setDate(startDate.getDate() - 7); break;
        case '30d': startDate.setDate(startDate.getDate() - 30); break;
        case '90d': startDate.setDate(startDate.getDate() - 90); break;
        default: startDate.setDate(startDate.getDate() - 7);
      }

      const [totalEvents, alertEvents, speedEvents, maintenanceEvents] = await Promise.all([
        this.count(TABLES.vehicle_events, { 
          customer_id: customerId,
          timestamp: r.row('timestamp').during(startDate, endDate)
        }),
        this.count(TABLES.vehicle_events, { 
          customer_id: customerId,
          severity: r.row('severity').match('warning|critical'),
          timestamp: r.row('timestamp').during(startDate, endDate)
        }),
        this.count(TABLES.vehicle_events, { 
          customer_id: customerId,
          event_type: 'speed_alert',
          timestamp: r.row('timestamp').during(startDate, endDate)
        }),
        this.count(TABLES.vehicle_events, { 
          customer_id: customerId,
          event_type: 'maintenance_due',
          timestamp: r.row('timestamp').during(startDate, endDate)
        })
      ]);

      return {
        time_range: timeRange,
        total_events: totalEvents,
        alert_events: alertEvents,
        speed_events: speedEvents,
        maintenance_events: maintenanceEvents,
        alert_rate: totalEvents > 0 ? (alertEvents / totalEvents * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting fleet analytics:', error);
      throw error;
    }
  }

  // ==================== MAINTENANCE METHODS ====================

  async getHealthStatus() {
    try {
      const tableStatuses = await Promise.all(
        Object.values(TABLES).map(async (tableName) => {
          const count = await this.count(tableName);
          return { table: tableName, count };
        })
      );

      return {
        status: 'healthy',
        timestamp: new Date(),
        tables: tableStatuses,
        connection: this.db.isConnected()
      };
    } catch (error) {
      console.error('Error getting repository health status:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  async performMaintenance() {
    try {
      console.log('Starting repository maintenance...');
      
      // Cleanup old device data (older than 90 days)
      const cleanedRecords = await this.cleanupOldDeviceData(90);
      
      // Mark expired notifications as archived
      const expiredNotifications = await r.table(TABLES.notifications)
        .filter(
          r.row('expires_at').lt(new Date())
          .and(r.row('archived').eq(false))
        )
        .update({ archived: true, archived_at: new Date() })
        .run(this.db.connection);

      console.log(`Maintenance completed: ${cleanedRecords} device records cleaned, ${expiredNotifications.replaced} notifications archived`);
      
      return {
        device_data_cleaned: cleanedRecords,
        notifications_archived: expiredNotifications.replaced
      };
    } catch (error) {
      console.error('Error performing maintenance:', error);
      throw error;
    }
  }
}

export default new DocumentRepository();