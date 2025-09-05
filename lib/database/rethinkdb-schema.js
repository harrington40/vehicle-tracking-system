// ==================== DATABASE NAME ====================
export const DB_NAME = 'trans_tech_vtracking';

// ==================== TABLE DEFINITIONS ====================
export const TABLES = {
  // Core business entities
  customers: 'customers',
  users: 'users',
  devices: 'devices',
  vehicles: 'vehicles',
  
  // Operational data
  device_data: 'device_data',
  vehicle_events: 'vehicle_events',
  geofences: 'geofences',
  trips: 'trips',
  
  // Business operations
  subscriptions: 'subscriptions',
  billing_records: 'billing_records',
  notifications: 'notifications',
  
  // System data
  api_keys: 'api_keys',
  audit_logs: 'audit_logs',
  system_settings: 'system_settings',
  
  // Analytics and reporting
  reports: 'reports',
  driver_scores: 'driver_scores',
  maintenance_records: 'maintenance_records',
  
  // Integration data
  webhooks: 'webhooks',
  external_integrations: 'external_integrations'
};

// ==================== INDEX DEFINITIONS ====================
export const INDEXES = {
  // Customers table indexes
  [TABLES.customers]: [
    { name: 'email', fields: 'email', options: { unique: true } },
    { name: 'status', fields: 'status' },
    { name: 'customer_type', fields: 'customer_type' },
    { name: 'created_at', fields: 'created_at' },
    { name: 'business_name', fields: 'business_name' }
  ],

  // Users table indexes
  [TABLES.users]: [
    { name: 'email', fields: 'email', options: { unique: true } },
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'auth0_user_id', fields: 'auth0_user_id' },
    { name: 'role', fields: 'role' },
    { name: 'is_active', fields: 'is_active' },
    { name: 'customer_role', fields: ['customer_id', 'role'] },
    { name: 'customer_active', fields: ['customer_id', 'is_active'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Devices table indexes
  [TABLES.devices]: [
    { name: 'serial_number', fields: 'serial_number', options: { unique: true } },
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'owner_id', fields: 'owner_id' },
    { name: 'status', fields: 'status' },
    { name: 'imei', fields: 'imei' },
    { name: 'model', fields: 'model' },
    { name: 'customer_status', fields: ['customer_id', 'status'] },
    { name: 'activated_at', fields: 'activated_at' },
    { name: 'last_heartbeat', fields: 'last_heartbeat' },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Vehicles table indexes - FIXED: Lines 86-88
  [TABLES.vehicles]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'device_id', fields: 'device_id', options: { unique: true } },
    { name: 'assigned_driver_id', fields: 'assigned_driver_id' },
    { name: 'status', fields: 'status' },
    { name: 'vehicle_type', fields: 'vehicle_type' },
    { name: 'license_plate', fields: 'vehicle_info.license_plate' }, // FIXED: Line 86
    { name: 'vin', fields: 'vehicle_info.vin' }, // FIXED: Line 87
    { name: 'make_model', fields: ['vehicle_info.make', 'vehicle_info.model'] }, // FIXED: Line 88
    { name: 'customer_status', fields: ['customer_id', 'status'] },
    { name: 'customer_type', fields: ['customer_id', 'vehicle_type'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Device data table indexes - FIXED: Remove r.row references
  [TABLES.device_data]: [
    { name: 'device_id', fields: 'device_id' },
    { name: 'timestamp', fields: 'timestamp' },
    { name: 'device_timestamp', fields: ['device_id', 'timestamp'] },
    { name: 'location', fields: 'location.coordinates', options: { geo: true } }, // FIXED
    { name: 'ignition_status', fields: 'vehicle_data.ignition_status' }, // FIXED
    { name: 'speed', fields: 'location.speed' }, // FIXED
    { name: 'battery_level', fields: 'device_status.battery_level' }, // FIXED
    { name: 'created_at', fields: 'created_at' }
  ],

  // Vehicle events table indexes - FIXED: Remove r.row references
  [TABLES.vehicle_events]: [
    { name: 'vehicle_id', fields: 'vehicle_id' },
    { name: 'device_id', fields: 'device_id' },
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'event_type', fields: 'event_type' },
    { name: 'severity', fields: 'severity' },
    { name: 'priority', fields: 'priority' },
    { name: 'timestamp', fields: 'timestamp' },
    { name: 'acknowledged', fields: 'acknowledged' },
    { name: 'resolved', fields: 'resolved' },
    { name: 'customer_type', fields: ['customer_id', 'event_type'] },
    { name: 'customer_severity', fields: ['customer_id', 'severity'] },
    { name: 'customer_timestamp', fields: ['customer_id', 'timestamp'] },
    { name: 'vehicle_timestamp', fields: ['vehicle_id', 'timestamp'] },
    { name: 'vehicle_type', fields: ['vehicle_id', 'event_type'] },
    { name: 'unacknowledged', fields: ['customer_id', 'acknowledged', 'severity'] },
    { name: 'location', fields: 'event_data.location.coordinates', options: { geo: true } } // FIXED
  ],

  // Geofences table indexes - FIXED: Remove complex r.branch function
  [TABLES.geofences]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'active', fields: 'active' },
    { name: 'type', fields: 'type' },
    { name: 'customer_active', fields: ['customer_id', 'active'] },
    { name: 'created_by', fields: 'created_by' },
    { name: 'created_at', fields: 'created_at' },
    // Simplified geometry index
    { name: 'geometry', fields: 'geometry', options: { geo: true } } // FIXED
  ],

  // Trips table indexes
  [TABLES.trips]: [
    { name: 'vehicle_id', fields: 'vehicle_id' },
    { name: 'device_id', fields: 'device_id' },
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'driver_id', fields: 'driver_id' },
    { name: 'status', fields: 'status' },
    { name: 'start_time', fields: 'start_time' },
    { name: 'end_time', fields: 'end_time' },
    { name: 'customer_status', fields: ['customer_id', 'status'] },
    { name: 'vehicle_start_time', fields: ['vehicle_id', 'start_time'] },
    { name: 'driver_start_time', fields: ['driver_id', 'start_time'] },
    { name: 'date_range', fields: ['start_time', 'end_time'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Subscriptions table indexes
  [TABLES.subscriptions]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'status', fields: 'status' },
    { name: 'plan_id', fields: 'plan_id' },
    { name: 'stripe_customer_id', fields: 'stripe_customer_id' },
    { name: 'stripe_subscription_id', fields: 'stripe_subscription_id' },
    { name: 'next_billing_date', fields: 'next_billing_date' },
    { name: 'trial_end', fields: 'trial_end' },
    { name: 'current_period_end', fields: 'current_period_end' },
    { name: 'customer_status', fields: ['customer_id', 'status'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Billing records table indexes
  [TABLES.billing_records]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'subscription_id', fields: 'subscription_id' },
    { name: 'status', fields: 'status' },
    { name: 'type', fields: 'type' },
    { name: 'stripe_invoice_id', fields: 'stripe_invoice_id' },
    { name: 'payment_date', fields: 'payment_date' },
    { name: 'due_date', fields: 'due_date' },
    { name: 'customer_status', fields: ['customer_id', 'status'] },
    { name: 'customer_type', fields: ['customer_id', 'type'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Notifications table indexes
  [TABLES.notifications]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'user_id', fields: 'user_id' },
    { name: 'vehicle_id', fields: 'vehicle_id' },
    { name: 'event_id', fields: 'event_id' },
    { name: 'type', fields: 'type' },
    { name: 'category', fields: 'category' },
    { name: 'severity', fields: 'severity' },
    { name: 'read', fields: 'read' },
    { name: 'archived', fields: 'archived' },
    { name: 'user_read', fields: ['user_id', 'read'] },
    { name: 'user_archived', fields: ['user_id', 'archived'] },
    { name: 'customer_type', fields: ['customer_id', 'type'] },
    { name: 'customer_severity', fields: ['customer_id', 'severity'] },
    { name: 'expires_at', fields: 'expires_at' },
    { name: 'created_at', fields: 'created_at' }
  ],

  // API keys table indexes
  [TABLES.api_keys]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'created_by', fields: 'created_by' },
    { name: 'key_hash', fields: 'key_hash', options: { unique: true } },
    { name: 'name', fields: 'name' },
    { name: 'active', fields: 'active' },
    { name: 'expires_at', fields: 'expires_at' },
    { name: 'last_used', fields: 'last_used' },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Audit logs table indexes
  [TABLES.audit_logs]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'user_id', fields: 'user_id' },
    { name: 'action', fields: 'action' },
    { name: 'resource_type', fields: 'resource_type' },
    { name: 'resource_id', fields: 'resource_id' },
    { name: 'ip_address', fields: 'ip_address' },
    { name: 'timestamp', fields: 'timestamp' },
    { name: 'customer_action', fields: ['customer_id', 'action'] },
    { name: 'customer_timestamp', fields: ['customer_id', 'timestamp'] },
    { name: 'user_timestamp', fields: ['user_id', 'timestamp'] },
    { name: 'resource_timestamp', fields: ['resource_type', 'resource_id', 'timestamp'] }
  ],

  // System settings table indexes
  [TABLES.system_settings]: [
    { name: 'category', fields: 'category' },
    { name: 'key', fields: 'key', options: { unique: true } },
    { name: 'environment', fields: 'environment' },
    { name: 'category_key', fields: ['category', 'key'] },
    { name: 'updated_at', fields: 'updated_at' }
  ],

  // Reports table indexes
  [TABLES.reports]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'created_by', fields: 'created_by' },
    { name: 'type', fields: 'type' },
    { name: 'status', fields: 'status' },
    { name: 'scheduled', fields: 'scheduled' },
    { name: 'customer_type', fields: ['customer_id', 'type'] },
    { name: 'customer_status', fields: ['customer_id', 'status'] },
    { name: 'next_run', fields: 'next_run' },
    { name: 'created_at', fields: 'created_at' },
    { name: 'completed_at', fields: 'completed_at' }
  ],

  // Driver scores table indexes
  [TABLES.driver_scores]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'driver_id', fields: 'driver_id' },
    { name: 'vehicle_id', fields: 'vehicle_id' },
    { name: 'period_start', fields: 'period_start' },
    { name: 'period_end', fields: 'period_end' },
    { name: 'score_type', fields: 'score_type' },
    { name: 'overall_score', fields: 'overall_score' },
    { name: 'driver_period', fields: ['driver_id', 'period_start', 'period_end'] },
    { name: 'customer_period', fields: ['customer_id', 'period_start', 'period_end'] },
    { name: 'vehicle_period', fields: ['vehicle_id', 'period_start', 'period_end'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Maintenance records table indexes
  [TABLES.maintenance_records]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'vehicle_id', fields: 'vehicle_id' },
    { name: 'performed_by', fields: 'performed_by' },
    { name: 'type', fields: 'type' },
    { name: 'status', fields: 'status' },
    { name: 'scheduled_date', fields: 'scheduled_date' },
    { name: 'completed_date', fields: 'completed_date' },
    { name: 'due_date', fields: 'due_date' },
    { name: 'vehicle_type', fields: ['vehicle_id', 'type'] },
    { name: 'vehicle_status', fields: ['vehicle_id', 'status'] },
    { name: 'customer_type', fields: ['customer_id', 'type'] },
    { name: 'overdue', fields: ['due_date', 'status'] },
    { name: 'created_at', fields: 'created_at' }
  ],

  // Webhooks table indexes
  [TABLES.webhooks]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'event_type', fields: 'event_type' },
    { name: 'active', fields: 'active' },
    { name: 'url', fields: 'url' },
    { name: 'customer_active', fields: ['customer_id', 'active'] },
    { name: 'customer_event', fields: ['customer_id', 'event_type'] },
    { name: 'last_triggered', fields: 'last_triggered' },
    { name: 'created_at', fields: 'created_at' }
  ],

  // External integrations table indexes
  [TABLES.external_integrations]: [
    { name: 'customer_id', fields: 'customer_id' },
    { name: 'type', fields: 'type' },
    { name: 'provider', fields: 'provider' },
    { name: 'active', fields: 'active' },
    { name: 'customer_type', fields: ['customer_id', 'type'] },
    { name: 'customer_provider', fields: ['customer_id', 'provider'] },
    { name: 'last_sync', fields: 'last_sync' },
    { name: 'created_at', fields: 'created_at' }
  ]
};

// ==================== SCHEMA VALIDATION ====================
export const SCHEMA_VERSION = '1.0.0';

// Table configuration with additional metadata
export const TABLE_CONFIG = {
  [TABLES.customers]: {
    description: 'Customer account information',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.users]: {
    description: 'User accounts and authentication data',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.devices]: {
    description: 'GPS tracking devices',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.vehicles]: {
    description: 'Vehicle information and assignments',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.device_data]: {
    description: 'Raw GPS and sensor data from devices',
    shards: 2,
    replicas: 1,
    primaryKey: 'id',
    durability: 'soft', // High volume data, soft durability for performance
    writeAcks: 'single',
    ttl: 7776000 // 90 days in seconds
  },

  [TABLES.vehicle_events]: {
    description: 'Processed vehicle events and alerts',
    shards: 2,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.geofences]: {
    description: 'Geographic boundaries and zones',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.trips]: {
    description: 'Vehicle trip records and analytics',
    shards: 2,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.subscriptions]: {
    description: 'Customer subscription and billing data',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.billing_records]: {
    description: 'Billing transactions and payment history',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.notifications]: {
    description: 'User notifications and alerts',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'soft',
    writeAcks: 'single',
    ttl: 2592000 // 30 days in seconds
  },

  [TABLES.api_keys]: {
    description: 'API authentication keys',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.audit_logs]: {
    description: 'System audit trail and user actions',
    shards: 2,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority',
    ttl: 31536000 // 1 year in seconds
  },

  [TABLES.system_settings]: {
    description: 'System configuration and settings',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.reports]: {
    description: 'Generated reports and scheduled reports',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.driver_scores]: {
    description: 'Driver behavior scores and analytics',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.maintenance_records]: {
    description: 'Vehicle maintenance history and schedules',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.webhooks]: {
    description: 'Webhook configurations for external integrations',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  },

  [TABLES.external_integrations]: {
    description: 'Third-party service integrations',
    shards: 1,
    replicas: 1,
    primaryKey: 'id',
    durability: 'hard',
    writeAcks: 'majority'
  }
};

// ==================== QUERY HELPERS ====================
// FIXED: Converted all RethinkDB queries to simple filter objects
export const QUERIES = {
  // Customer queries
  findActiveCustomers: () => ({ filter: { status: 'active' } }),
  findCustomerByEmail: (email) => ({ filter: { email } }),

  // User queries
  findUsersByCustomer: (customerId) => ({ filter: { customer_id: customerId } }),
  findActiveUsersByCustomer: (customerId) => ({ 
    filter: { customer_id: customerId, is_active: true } 
  }),

  // Vehicle queries
  findVehiclesByCustomer: (customerId) => ({ filter: { customer_id: customerId } }),
  findActiveVehicles: (customerId) => ({ 
    filter: { customer_id: customerId, status: 'active' } 
  }),

  // Device queries
  findDevicesByCustomer: (customerId) => ({ filter: { customer_id: customerId } }),
  findActiveDevices: (customerId) => ({ 
    filter: { customer_id: customerId, status: 'activated' } 
  }),

  // Event queries
  findRecentEvents: (customerId, hours = 24) => ({ 
    filter: { customer_id: customerId },
    timeRange: { hours }
  }),

  findUnacknowledgedAlerts: (customerId) => ({
    filter: { 
      customer_id: customerId, 
      acknowledged: false, 
      severity: ['critical', 'warning'] 
    }
  }),

  // Geofence queries
  findActiveGeofences: (customerId) => ({
    filter: { customer_id: customerId, active: true }
  }),

  // Notification queries
  findUnreadNotifications: (userId) => ({
    filter: { user_id: userId, read: false }
  }),

  // Device data queries
  findLatestDeviceData: (deviceId, limit = 100) => ({
    filter: { device_id: deviceId },
    orderBy: 'timestamp',
    order: 'desc',
    limit
  }),

  // Trip queries
  findTripsByVehicle: (vehicleId, startDate, endDate) => ({
    filter: { 
      vehicle_id: vehicleId,
      start_time: { gte: startDate, lte: endDate }
    }
  }),

  // Subscription queries
  findActiveSubscription: (customerId) => ({
    filter: { customer_id: customerId, status: 'active' }
  }),

  // Maintenance queries
  findOverdueMaintenance: () => ({
    filter: { 
      status: 'scheduled',
      due_date: { lt: new Date().toISOString() }
    }
  })
};

// ==================== MIGRATION HELPERS ====================
// FIXED: Removed RethinkDB-specific migration functions
export const MIGRATIONS = {
  // Simplified migration helpers for client-side
  addIndex: async (connection, tableName, indexName, indexFunction, options = {}) => {
    console.log(`Mock: Adding index ${tableName}.${indexName}`);
    return Promise.resolve();
  },

  dropIndex: async (connection, tableName, indexName) => {
    console.log(`Mock: Dropping index ${tableName}.${indexName}`);
    return Promise.resolve();
  },

  addField: async (connection, tableName, fieldName, defaultValue) => {
    console.log(`Mock: Adding field ${tableName}.${fieldName}`);
    return Promise.resolve({ replaced: 0 });
  },

  removeField: async (connection, tableName, fieldName) => {
    console.log(`Mock: Removing field ${tableName}.${fieldName}`);
    return Promise.resolve({ replaced: 0 });
  },

  renameField: async (connection, tableName, oldFieldName, newFieldName) => {
    console.log(`Mock: Renaming field ${tableName}.${oldFieldName} -> ${newFieldName}`);
    return Promise.resolve({ replaced: 0 });
  }
};

// ==================== VALIDATION HELPERS ====================
// FIXED: Removed RethinkDB-specific validation functions
export const VALIDATION = {
  validateTables: async (connection) => {
    console.log('✅ Schema validation (client-side mock)');
    return true;
  },

  validateIndexes: async (connection) => {
    console.log('✅ Index validation (client-side mock)');
    return true;
  },

  getSchemaHealth: async (connection) => {
    return {
      version: SCHEMA_VERSION,
      timestamp: new Date(),
      tables: {},
      indexes: {},
      overall: 'healthy (mock)'
    };
  }
};

// ==================== CONSTANTS ====================
// Event types for vehicle_events table
export const EVENT_TYPES = {
  VEHICLE_START: 'start',
  VEHICLE_STOP: 'stop',
  SPEED_ALERT: 'speed_alert',
  GEOFENCE_ENTER: 'geofence_enter',
  GEOFENCE_EXIT: 'geofence_exit',
  HARSH_ACCELERATION: 'harsh_acceleration',
  HARSH_BRAKING: 'harsh_braking',
  SHARP_TURN: 'sharp_turn',
  IDLE_TIMEOUT: 'idle_timeout',
  MAINTENANCE_DUE: 'maintenance_due',
  FUEL_LOW: 'fuel_low',
  BATTERY_LOW: 'battery_low',
  PANIC_BUTTON: 'panic_button',
  TAMPER_ALERT: 'tamper_alert',
  ACCIDENT_DETECTED: 'accident_detected',
  TOWING_DETECTED: 'towing_detected',
  UNAUTHORIZED_USAGE: 'unauthorized_usage',
  DEVICE_OFFLINE: 'device_offline',
  DEVICE_ONLINE: 'device_online',
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed'
};

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  SPEED: 'speed',
  GEOFENCE: 'geofence',
  HARSH_DRIVING: 'harsh_driving',
  MAINTENANCE: 'maintenance',
  FUEL: 'fuel',
  BATTERY: 'battery',
  PANIC: 'panic',
  TAMPER: 'tamper',
  ACCIDENT: 'accident',
  PAYMENT: 'payment',
  SUBSCRIPTION: 'subscription',
  DEVICE: 'device',
  SYSTEM_UPDATE: 'system_update',
  PROMOTIONAL: 'promotional'
};

// User roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  DRIVER: 'driver',
  VIEWER: 'viewer'
};

// Vehicle statuses
export const VEHICLE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  DECOMMISSIONED: 'decommissioned'
};

// Device statuses
export const DEVICE_STATUSES = {
  SOLD: 'sold',
  REGISTERED: 'registered',
  ACTIVATED: 'activated',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated'
};

// Subscription statuses
export const SUBSCRIPTION_STATUSES = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
  INCOMPLETE: 'incomplete'
};

export default {
  DB_NAME,
  TABLES,
  INDEXES,
  TABLE_CONFIG,
  QUERIES,
  MIGRATIONS,
  VALIDATION,
  SCHEMA_VERSION,
  EVENT_TYPES,
  NOTIFICATION_CATEGORIES,
  USER_ROLES,
  VEHICLE_STATUSES,
  DEVICE_STATUSES,
  SUBSCRIPTION_STATUSES
};