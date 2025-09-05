import RethinkDBService from '../database/RethinkDBService.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import { SchemaFactory } from '../schemas/SchemaFactory.js';
import { 
  CustomerValidationSchema, 
  UserValidationSchema, 
  DeviceValidationSchema,
  VehicleValidationSchema 
} from '../schemas/DocumentSchemas.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import r from 'rethinkdb';

export class DataService {
  constructor() {
    this.db = RethinkDBService;
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  async createCustomer(customerData) {
    try {
      const { error, value } = CustomerValidationSchema.validate(customerData);
      if (error) throw new Error(`Validation error: ${error.details[0].message}`);
      
      // Check if customer already exists
      const existingCustomer = await this.findCustomerByEmail(value.email);
      if (existingCustomer) {
        throw new Error('Customer with this email already exists');
      }

      const customer = SchemaFactory.createCustomer(value);
      const result = await this.db.create(TABLES.customers, customer);

      // Create initial subscription
      const { default: BillingService } = await import('../business-logic/BillingService.js');
      await BillingService.createInitialSubscription(result.id);

      return result;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async findCustomerByEmail(email) {
    try {
      const customers = await this.db.findByIndex(TABLES.customers, 'email', email.toLowerCase());
      return customers[0] || null;
    } catch (error) {
      console.error('Error finding customer by email:', error);
      return null;
    }
  }

  async getCustomerById(customerId) {
    try {
      return await this.db.findById(TABLES.customers, customerId);
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, updates) {
    try {
      // Validate updates
      const { error, value } = CustomerValidationSchema.validate(updates, { 
        allowUnknown: true,
        stripUnknown: true 
      });
      
      if (error) throw new Error(`Validation error: ${error.details[0].message}`);

      return await this.db.update(TABLES.customers, customerId, value);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // ==================== USER MANAGEMENT ====================

  async createUser(userData) {
    try {
      const { error, value } = UserValidationSchema.validate(userData);
      if (error) throw new Error(`Validation error: ${error.details[0].message}`);
      
      // Check if user already exists
      const existingUser = await this.findUserByEmail(value.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password if provided (for non-Auth0 users)
      if (value.password && value.password !== 'auth0_managed') {
        value.password_hash = await bcrypt.hash(value.password, 10);
        delete value.password;
      } else if (!value.password_hash) {
        value.password_hash = 'auth0_managed';
      }

      const user = SchemaFactory.createUser(value);
      return await this.db.create(TABLES.users, user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findUserByEmail(email) {
    try {
      const users = await this.db.findByIndex(TABLES.users, 'email', email.toLowerCase());
      return users[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
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

  async getUserById(userId) {
    try {
      return await this.db.findById(TABLES.users, userId);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUsersByCustomerId(customerId) {
    try {
      return await this.db.findByIndex(TABLES.users, 'customer_id', customerId);
    } catch (error) {
      console.error('Error getting users by customer ID:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const sanitizedUpdates = { ...updates };
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.created_at;
      delete sanitizedUpdates.password_hash;

      return await this.db.update(TABLES.users, userId, sanitizedUpdates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserLastLogin(userId) {
    try {
      return await this.db.update(TABLES.users, userId, {
        last_login: new Date(),
        login_count: r.row('login_count').default(0).add(1)
      });
    } catch (error) {
      console.error('Error updating user last login:', error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      return await this.db.update(TABLES.users, userId, { 
        is_active: false,
        deactivated_at: new Date()
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      return await this.db.update(TABLES.users, userId, { 
        is_active: true,
        deactivated_at: null
      });
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // ==================== DEVICE MANAGEMENT ====================

  async createDevice(deviceData) {
    try {
      const { error, value } = DeviceValidationSchema.validate(deviceData);
      if (error) throw new Error(`Validation error: ${error.details[0].message}`);
      
      // Check if device already exists
      const existingDevice = await this.findDeviceBySerialNumber(value.serial_number);
      if (existingDevice) {
        throw new Error('Device with this serial number already exists');
      }

      const device = SchemaFactory.createDevice(value);
      return await this.db.create(TABLES.devices, device);
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  }

  async findDeviceBySerialNumber(serialNumber) {
    try {
      const devices = await this.db.findByIndex(TABLES.devices, 'serial_number', serialNumber.toUpperCase());
      return devices[0] || null;
    } catch (error) {
      console.error('Error finding device by serial number:', error);
      return null;
    }
  }

  async getDeviceById(deviceId) {
    try {
      return await this.db.findById(TABLES.devices, deviceId);
    } catch (error) {
      console.error('Error getting device by ID:', error);
      throw error;
    }
  }

  async getDevicesByCustomerId(customerId) {
    try {
      return await this.db.findByIndex(TABLES.devices, 'customer_id', customerId);
    } catch (error) {
      console.error('Error getting devices by customer ID:', error);
      throw error;
    }
  }

  async updateDevice(deviceId, updates) {
    try {
      return await this.db.update(TABLES.devices, deviceId, updates);
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  async activateDevice(deviceId, customerId, ownerId) {
    try {
      const updates = {
        customer_id: customerId,
        owner_id: ownerId,
        status: 'activated',
        activated_at: new Date()
      };

      return await this.db.update(TABLES.devices, deviceId, updates);
    } catch (error) {
      console.error('Error activating device:', error);
      throw error;
    }
  }

  async updateDeviceHeartbeat(deviceId, locationData = null) {
    try {
      const updates = {
        last_heartbeat: new Date()
      };

      if (locationData) {
        updates.last_location = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          timestamp: new Date()
        };
      }

      return await this.db.update(TABLES.devices, deviceId, updates);
    } catch (error) {
      console.error('Error updating device heartbeat:', error);
      throw error;
    }
  }

  // ==================== VEHICLE MANAGEMENT ====================

  async createVehicle(vehicleData) {
    try {
      const { error, value } = VehicleValidationSchema.validate(vehicleData);
      if (error) throw new Error(`Validation error: ${error.details[0].message}`);
      
      // Check if device is already assigned
      const existingVehicle = await this.findVehicleByDeviceId(value.device_id);
      if (existingVehicle) {
        throw new Error('Device is already assigned to another vehicle');
      }

      const vehicle = SchemaFactory.createVehicle(value);
      const result = await this.db.create(TABLES.vehicles, vehicle);

      // Update device assignment
      await this.updateDevice(value.device_id, {
        assigned_vehicle_id: result.id
      });

      return result;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  async findVehicleByDeviceId(deviceId) {
    try {
      const vehicles = await this.db.findByIndex(TABLES.vehicles, 'device_id', deviceId);
      return vehicles[0] || null;
    } catch (error) {
      console.error('Error finding vehicle by device ID:', error);
      return null;
    }
  }

  async getVehicleById(vehicleId) {
    try {
      return await this.db.findById(TABLES.vehicles, vehicleId);
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      throw error;
    }
  }

  async getVehiclesByCustomerId(customerId) {
    try {
      const vehicles = await this.db.findByIndex(TABLES.vehicles, 'customer_id', customerId);
      
      // Enrich with device and driver information
      const enrichedVehicles = await Promise.all(
        vehicles.map(async (vehicle) => {
          const device = await this.getDeviceById(vehicle.device_id);
          const driver = vehicle.assigned_driver_id 
            ? await this.getUserById(vehicle.assigned_driver_id) 
            : null;

          return {
            ...vehicle,
            device: device,
            driver: driver
          };
        })
      );

      return enrichedVehicles;
    } catch (error) {
      console.error('Error getting vehicles by customer ID:', error);
      throw error;
    }
  }

  async getVehiclesByDriverId(driverId) {
    try {
      return await this.db.findByIndex(TABLES.vehicles, 'assigned_driver_id', driverId);
    } catch (error) {
      console.error('Error getting vehicles by driver ID:', error);
      throw error;
    }
  }

  async assignDriverToVehicle(vehicleId, driverId, assignedBy) {
    try {
      // Validate that driver exists and belongs to same customer
      const vehicle = await this.getVehicleById(vehicleId);
      if (!vehicle) throw new Error('Vehicle not found');

      const driver = await this.getUserById(driverId);
      if (!driver) throw new Error('Driver not found');

      if (vehicle.customer_id !== driver.customer_id) {
        throw new Error('Driver and vehicle must belong to the same customer');
      }

      const updates = {
        assigned_driver_id: driverId,
        assigned_at: new Date(),
        assigned_by: assignedBy
      };

      return await this.db.update(TABLES.vehicles, vehicleId, updates);
    } catch (error) {
      console.error('Error assigning driver to vehicle:', error);
      throw error;
    }
  }

  async unassignDriverFromVehicle(vehicleId) {
    try {
      const updates = {
        assigned_driver_id: null,
        assigned_at: null,
        assigned_by: null
      };

      return await this.db.update(TABLES.vehicles, vehicleId, updates);
    } catch (error) {
      console.error('Error unassigning driver from vehicle:', error);
      throw error;
    }
  }

  async updateVehicle(vehicleId, updates) {
    try {
      return await this.db.update(TABLES.vehicles, vehicleId, updates);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  // ==================== VEHICLE EVENTS & DATA ====================

  async createVehicleEvent(eventData) {
    try {
      const event = SchemaFactory.createVehicleEvent(eventData);
      return await this.db.create(TABLES.vehicle_events, event);
    } catch (error) {
      console.error('Error creating vehicle event:', error);
      throw error;
    }
  }

  async getVehicleEvents(vehicleId, limit = 50, offset = 0) {
    try {
      const cursor = await r.table(TABLES.vehicle_events)
        .getAll(vehicleId, { index: 'vehicle_id' })
        .orderBy(r.desc('timestamp'))
        .skip(offset)
        .limit(limit)
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error getting vehicle events:', error);
      return [];
    }
  }

  async createDeviceData(deviceDataArray) {
    try {
      // Handle both single object and array
      const dataArray = Array.isArray(deviceDataArray) ? deviceDataArray : [deviceDataArray];
      
      const deviceDataDocuments = dataArray.map(data => SchemaFactory.createDeviceData(data));
      
      // Use batch insert for efficiency
      return await this.db.batchInsert(TABLES.device_data, deviceDataDocuments);
    } catch (error) {
      console.error('Error creating device data:', error);
      throw error;
    }
  }

  async getLatestDeviceData(deviceId) {
    try {
      const cursor = await r.table(TABLES.device_data)
        .getAll(deviceId, { index: 'device_id' })
        .orderBy(r.desc('timestamp'))
        .limit(1)
        .run(this.db.connection);
      
      const results = await cursor.toArray();
      return results[0] || null;
    } catch (error) {
      console.error('Error getting latest device data:', error);
      return null;
    }
  }

  async getDeviceDataInRange(deviceId, startTime, endTime, limit = 1000) {
    try {
      const cursor = await r.table(TABLES.device_data)
        .getAll(deviceId, { index: 'device_id' })
        .filter(r.row('timestamp').during(startTime, endTime))
        .orderBy('timestamp')
        .limit(limit)
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error getting device data in range:', error);
      return [];
    }
  }

  // ==================== DASHBOARD DATA ====================

  async getDashboardData(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('User not found');

      const customer = await this.getCustomerById(user.customer_id);
      const vehicles = await this.getVehiclesByCustomerId(user.customer_id);
      const devices = await this.getDevicesByCustomerId(user.customer_id);
      const users = await this.getUsersByCustomerId(user.customer_id);

      // Get subscription info
      const { default: BillingService } = await import('../business-logic/BillingService.js');
      const subscription = await BillingService.getCustomerSubscription(user.customer_id);

      // Calculate metrics
      const activeDevices = devices.filter(d => d.status === 'activated');
      const activeVehicles = vehicles.filter(v => v.status === 'active');
      const onlineDevices = activeDevices.filter(d => {
        if (!d.last_heartbeat) return false;
        const lastHeartbeat = new Date(d.last_heartbeat);
        const now = new Date();
        return (now - lastHeartbeat) < 30 * 60 * 1000; // 30 minutes
      });

      // Get recent events
      const recentEvents = [];
      for (const vehicle of vehicles.slice(0, 5)) { // Limit to first 5 vehicles
        const events = await this.getVehicleEvents(vehicle.id, 5);
        recentEvents.push(...events);
      }
      recentEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return {
        user,
        customer,
        subscription,
        metrics: {
          totalVehicles: vehicles.length,
          activeVehicles: activeVehicles.length,
          totalDevices: devices.length,
          activeDevices: activeDevices.length,
          onlineDevices: onlineDevices.length,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.is_active).length
        },
        vehicles: activeVehicles.slice(0, 10), // Top 10 for dashboard
        recentEvents: recentEvents.slice(0, 10),
        alerts: recentEvents.filter(e => e.severity === 'critical').slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // ==================== AUTH0 INTEGRATION HELPERS ====================

  async createCustomerFromAuth0Registration(auth0User, registrationData) {
    try {
      // Create customer
      const customerData = {
        customer_type: registrationData.customer_type || 'individual',
        business_name: registrationData.business_name || null,
        contact_person: auth0User.name || `${auth0User.given_name} ${auth0User.family_name}`,
        email: auth0User.email,
        address: registrationData.address,
        ...registrationData
      };

      const customer = await this.createCustomer(customerData);

      // Create primary user
      const userData = {
        customer_id: customer.id,
        email: auth0User.email,
        first_name: auth0User.given_name || auth0User.name?.split(' ')[0] || 'User',
        last_name: auth0User.family_name || auth0User.name?.split(' ')[1] || '',
        role: 'owner',
        auth0_user_id: auth0User.sub,
        email_verified: auth0User.email_verified || false,
        avatar_url: auth0User.picture,
        password_hash: 'auth0_managed'
      };

      const user = await this.createUser(userData);

      return { customer, user };
    } catch (error) {
      console.error('Error creating customer from Auth0 registration:', error);
      throw error;
    }
  }

  async linkAuth0UserToExisting(auth0User, existingUserId) {
    try {
      const updates = {
        auth0_user_id: auth0User.sub,
        email_verified: auth0User.email_verified || false,
        avatar_url: auth0User.picture || null,
        last_login: new Date()
      };

      return await this.updateUser(existingUserId, updates);
    } catch (error) {
      console.error('Error linking Auth0 user to existing:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  async checkUserPermission(userId, permission) {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      return user.permissions.includes('*') || user.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  async validateCustomerAccess(userId, customerId) {
    try {
      const user = await this.getUserById(userId);
      return user && user.customer_id === customerId;
    } catch (error) {
      console.error('Error validating customer access:', error);
      return false;
    }
  }

  async getCustomerStats(customerId) {
    try {
      const [vehicles, devices, users] = await Promise.all([
        this.getVehiclesByCustomerId(customerId),
        this.getDevicesByCustomerId(customerId),
        this.getUsersByCustomerId(customerId)
      ]);

      return {
        vehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        devices: devices.length,
        activeDevices: devices.filter(d => d.status === 'activated').length,
        users: users.length,
        activeUsers: users.filter(u => u.is_active).length
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      throw error;
    }
  }

  // ==================== CLEANUP METHODS ====================

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
}

export default new DataService();