import Joi from 'joi';

// ==================== SHARED VALIDATION PATTERNS ====================

const emailSchema = Joi.string().email().lowercase().required();
const phoneSchema = Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow(null);
const uuidSchema = Joi.string().uuid().required();
const coordinateSchema = Joi.number().min(-180).max(180).required();
const timestampSchema = Joi.date().default(() => new Date());

// Address schema used across multiple documents
const addressSchema = Joi.object({
  street: Joi.string().min(1).max(200).required(),
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  zip: Joi.string().min(3).max(20).required(),
  country: Joi.string().min(2).max(100).required()
});

// Location schema for GPS coordinates
const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  altitude: Joi.number().allow(null),
  accuracy: Joi.number().min(0).default(10),
  heading: Joi.number().min(0).max(360).allow(null),
  speed: Joi.number().min(0).default(0),
  address: Joi.string().max(500).allow(null),
  satellites: Joi.number().integer().min(0).allow(null)
});

// ==================== CUSTOMER VALIDATION SCHEMA ====================

export const CustomerValidationSchema = Joi.object({
  customer_type: Joi.string().valid('individual', 'business').required(),
  business_name: Joi.when('customer_type', {
    is: 'business',
    then: Joi.string().min(1).max(200).required(),
    otherwise: Joi.string().max(200).allow(null)
  }),
  contact_person: Joi.string().min(1).max(100).required(),
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema.required(),
  billing_address: addressSchema.allow(null),
  tax_info: Joi.object({
    tax_id: Joi.string().max(50).allow(null),
    tax_exempt: Joi.boolean().default(false)
  }).default({}),
  status: Joi.string().valid('active', 'suspended', 'cancelled').default('active')
});

// Update schema for existing customers
export const CustomerUpdateSchema = Joi.object({
  business_name: Joi.string().min(1).max(200).allow(null),
  contact_person: Joi.string().min(1).max(100),
  email: Joi.string().email().lowercase(),
  phone: phoneSchema,
  address: addressSchema,
  billing_address: addressSchema.allow(null),
  tax_info: Joi.object({
    tax_id: Joi.string().max(50).allow(null),
    tax_exempt: Joi.boolean()
  }),
  status: Joi.string().valid('active', 'suspended', 'cancelled')
}).min(1); // At least one field must be present

// ==================== USER VALIDATION SCHEMA ====================

export const UserValidationSchema = Joi.object({
  customer_id: uuidSchema,
  email: emailSchema,
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  phone: phoneSchema,
  role: Joi.string().valid('owner', 'admin', 'manager', 'driver', 'viewer').required(),
  password_hash: Joi.string().min(1).required(),
  auth0_user_id: Joi.string().max(100).allow(null),
  avatar_url: Joi.string().uri().allow(null),
  email_verified: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true),
  preferences: Joi.object({
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko').default('en'),
    timezone: Joi.string().max(50).default('UTC'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(true),
      dashboard_alerts: Joi.boolean().default(true),
      maintenance_reminders: Joi.boolean().default(true),
      geofence_alerts: Joi.boolean().default(true),
      speed_alerts: Joi.boolean().default(true)
    }).default({}),
    dashboard_layout: Joi.object({
      widgets: Joi.array().items(Joi.string()).default(['fleet_overview', 'recent_events', 'vehicle_status', 'alerts']),
      theme: Joi.string().valid('light', 'dark', 'auto').default('light'),
      refresh_interval: Joi.number().integer().min(10).max(300).default(30) // 10 seconds to 5 minutes
    }).default({}),
    map_settings: Joi.object({
      default_zoom: Joi.number().integer().min(1).max(20).default(10),
      traffic_overlay: Joi.boolean().default(false),
      satellite_view: Joi.boolean().default(false),
      show_routes: Joi.boolean().default(true),
      clustering: Joi.boolean().default(true)
    }).default({})
  }).default({}),
  created_by: uuidSchema.allow(null)
});

// User update schema (excluding sensitive fields)
export const UserUpdateSchema = Joi.object({
  first_name: Joi.string().min(1).max(100),
  last_name: Joi.string().min(1).max(100),
  phone: phoneSchema,
  role: Joi.string().valid('owner', 'admin', 'manager', 'driver', 'viewer'),
  avatar_url: Joi.string().uri().allow(null),
  is_active: Joi.boolean(),
  preferences: Joi.object({
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'),
    timezone: Joi.string().max(50),
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean(),
      dashboard_alerts: Joi.boolean(),
      maintenance_reminders: Joi.boolean(),
      geofence_alerts: Joi.boolean(),
      speed_alerts: Joi.boolean()
    }),
    dashboard_layout: Joi.object({
      widgets: Joi.array().items(Joi.string()),
      theme: Joi.string().valid('light', 'dark', 'auto'),
      refresh_interval: Joi.number().integer().min(10).max(300)
    }),
    map_settings: Joi.object({
      default_zoom: Joi.number().integer().min(1).max(20),
      traffic_overlay: Joi.boolean(),
      satellite_view: Joi.boolean(),
      show_routes: Joi.boolean(),
      clustering: Joi.boolean()
    })
  })
}).min(1);

// ==================== DEVICE VALIDATION SCHEMA ====================

export const DeviceValidationSchema = Joi.object({
  serial_number: Joi.string().alphanum().min(8).max(50).required(),
  model: Joi.string().min(1).max(100).required(),
  manufacturer: Joi.string().min(1).max(100).default('Trans Technologies'),
  firmware_version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(), // e.g., "1.2.3"
  hardware_version: Joi.string().pattern(/^\d+\.\d+$/).default('1.0'), // e.g., "1.0"
  imei: Joi.string().pattern(/^\d{15}$/).allow(null), // 15 digit IMEI
  iccid: Joi.string().pattern(/^\d{18,22}$/).allow(null), // SIM card ID
  customer_id: uuidSchema.allow(null),
  owner_id: uuidSchema.allow(null),
  status: Joi.string().valid('sold', 'registered', 'activated', 'suspended', 'deactivated').default('sold'),
  configuration: Joi.object({
    reporting_interval: Joi.number().integer().min(10).max(3600).default(60), // 10 seconds to 1 hour
    geofence_enabled: Joi.boolean().default(false),
    speed_limit: Joi.number().integer().min(10).max(200).default(80), // km/h
    idle_timeout: Joi.number().integer().min(60).max(7200).default(300), // 1 minute to 2 hours
    harsh_driving_enabled: Joi.boolean().default(true),
    panic_button_enabled: Joi.boolean().default(true),
    immobilizer_enabled: Joi.boolean().default(false),
    anti_theft_mode: Joi.boolean().default(false),
    power_save_mode: Joi.boolean().default(false),
    scheduled_reports: Joi.array().items(Joi.object({
      type: Joi.string().valid('daily', 'weekly', 'monthly').required(),
      time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), // HH:MM format
      recipients: Joi.array().items(Joi.string().email()).required()
    })).default([])
  }).default({}),
  connectivity: Joi.object({
    cellular_provider: Joi.string().max(100).default('Unknown'),
    sim_card_id: Joi.string().max(50).allow(null),
    data_plan: Joi.string().valid('basic', 'standard', 'premium', 'unlimited').default('basic'),
    apn_settings: Joi.object({
      apn: Joi.string().required(),
      username: Joi.string().allow(''),
      password: Joi.string().allow('')
    }).allow(null)
  }).default({}),
  warranty: Joi.object({
    start_date: timestampSchema,
    end_date: Joi.date().greater(Joi.ref('start_date')).default(() => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    coverage_type: Joi.string().valid('basic', 'extended', 'premium').default('basic')
  }).default({}),
  installation_info: Joi.object({
    installer_name: Joi.string().max(100).allow(null),
    installation_date: Joi.date().allow(null),
    installation_location: Joi.string().valid('obd', 'hardwired', 'magnetic', 'other').allow(null),
    installation_notes: Joi.string().max(500).allow(null)
  }).default({})
});

// Device update schema
export const DeviceUpdateSchema = Joi.object({
  model: Joi.string().min(1).max(100),
  manufacturer: Joi.string().min(1).max(100),
  firmware_version: Joi.string().pattern(/^\d+\.\d+\.\d+$/),
  hardware_version: Joi.string().pattern(/^\d+\.\d+$/),
  customer_id: uuidSchema.allow(null),
  owner_id: uuidSchema.allow(null),
  status: Joi.string().valid('sold', 'registered', 'activated', 'suspended', 'deactivated'),
  configuration: Joi.object({
    reporting_interval: Joi.number().integer().min(10).max(3600),
    geofence_enabled: Joi.boolean(),
    speed_limit: Joi.number().integer().min(10).max(200),
    idle_timeout: Joi.number().integer().min(60).max(7200),
    harsh_driving_enabled: Joi.boolean(),
    panic_button_enabled: Joi.boolean(),
    immobilizer_enabled: Joi.boolean(),
    anti_theft_mode: Joi.boolean(),
    power_save_mode: Joi.boolean(),
    scheduled_reports: Joi.array().items(Joi.object({
      type: Joi.string().valid('daily', 'weekly', 'monthly').required(),
      time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      recipients: Joi.array().items(Joi.string().email()).required()
    }))
  }),
  connectivity: Joi.object({
    cellular_provider: Joi.string().max(100),
    sim_card_id: Joi.string().max(50).allow(null),
    data_plan: Joi.string().valid('basic', 'standard', 'premium', 'unlimited'),
    apn_settings: Joi.object({
      apn: Joi.string().required(),
      username: Joi.string().allow(''),
      password: Joi.string().allow('')
    }).allow(null)
  })
}).min(1);

// ==================== VEHICLE VALIDATION SCHEMA ====================

export const VehicleValidationSchema = Joi.object({
  customer_id: uuidSchema,
  device_id: uuidSchema,
  assigned_driver_id: uuidSchema.allow(null),
  vehicle_info: Joi.object({
    make: Joi.string().min(1).max(50).required(),
    model: Joi.string().min(1).max(50).required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 2).required(),
    color: Joi.string().min(1).max(30).required(),
    license_plate: Joi.string().min(2).max(15).required(),
    vin: Joi.string().pattern(/^[A-HJ-NPR-Z0-9]{17}$/).allow(null), // Standard VIN format
    registration_number: Joi.string().max(50).allow(null),
    engine_number: Joi.string().max(50).allow(null),
    fuel_type: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid', 'cng', 'lpg').default('gasoline'),
    transmission: Joi.string().valid('manual', 'automatic', 'cvt').default('automatic')
  }).required(),
  vehicle_type: Joi.string().valid('car', 'truck', 'van', 'motorcycle', 'bus', 'trailer', 'heavy_equipment', 'other').required(),
  status: Joi.string().valid('active', 'inactive', 'maintenance', 'decommissioned').default('active'),
  odometer: Joi.object({
    current_reading: Joi.number().min(0).default(0),
    unit: Joi.string().valid('miles', 'kilometers').default('kilometers')
  }).default({}),
  fuel_info: Joi.object({
    tank_capacity: Joi.number().min(1).max(1000).allow(null), // liters
    fuel_efficiency: Joi.number().min(1).max(50).allow(null), // km/l or mpg
    fuel_cost_per_unit: Joi.number().min(0).allow(null)
  }).default({}),
  maintenance: Joi.object({
    last_service_date: Joi.date().allow(null),
    next_service_due: Joi.date().allow(null),
    service_interval_miles: Joi.number().integer().min(100).max(50000).default(5000),
    service_interval_months: Joi.number().integer().min(1).max(24).default(6),
    preferred_service_center: Joi.string().max(200).allow(null),
    maintenance_schedule: Joi.array().items(Joi.object({
      type: Joi.string().valid('oil_change', 'brake_inspection', 'tire_rotation', 'general_inspection', 'other').required(),
      interval_miles: Joi.number().integer().min(100).required(),
      interval_months: Joi.number().integer().min(1).required(),
      last_completed: Joi.date().allow(null),
      next_due: Joi.date().allow(null)
    })).default([])
  }).default({}),
  insurance: Joi.object({
    provider: Joi.string().max(100).allow(null),
    policy_number: Joi.string().max(100).allow(null),
    expiry_date: Joi.date().allow(null),
    coverage_type: Joi.string().valid('liability', 'comprehensive', 'collision', 'full').allow(null),
    premium_amount: Joi.number().min(0).allow(null),
    deductible: Joi.number().min(0).allow(null)
  }).default({}),
  registration: Joi.object({
    registration_number: Joi.string().max(50).allow(null),
    registration_date: Joi.date().allow(null),
    expiry_date: Joi.date().allow(null),
    issuing_authority: Joi.string().max(200).allow(null)
  }).default({}),
  alerts_config: Joi.object({
    speed_limit: Joi.number().integer().min(10).max(200).default(80), // km/h
    idle_timeout: Joi.number().integer().min(60).max(7200).default(300), // seconds
    geofence_alerts: Joi.boolean().default(true),
    maintenance_alerts: Joi.boolean().default(true),
    fuel_alerts: Joi.boolean().default(true),
    harsh_driving_alerts: Joi.boolean().default(true),
    panic_alerts: Joi.boolean().default(true),
    tamper_alerts: Joi.boolean().default(true),
    low_battery_alerts: Joi.boolean().default(true)
  }).default({}),
  driver_behavior_config: Joi.object({
    harsh_acceleration_threshold: Joi.number().min(0.5).max(10).default(2.5), // m/s²
    harsh_braking_threshold: Joi.number().min(-10).max(-0.5).default(-2.5), // m/s²
    sharp_turn_threshold: Joi.number().min(5).max(90).default(30), // degrees per second
    enable_scoring: Joi.boolean().default(true),
    scoring_period: Joi.string().valid('daily', 'weekly', 'monthly').default('weekly')
  }).default({}),
  cost_tracking: Joi.object({
    purchase_price: Joi.number().min(0).allow(null),
    purchase_date: Joi.date().allow(null),
    depreciation_rate: Joi.number().min(0).max(1).default(0.15), // 15% per year
    operating_cost_per_km: Joi.number().min(0).allow(null)
  }).default({}),
  created_by: uuidSchema
});

// Vehicle update schema
export const VehicleUpdateSchema = Joi.object({
  assigned_driver_id: uuidSchema.allow(null),
  vehicle_info: Joi.object({
    make: Joi.string().min(1).max(50),
    model: Joi.string().min(1).max(50),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 2),
    color: Joi.string().min(1).max(30),
    license_plate: Joi.string().min(2).max(15),
    vin: Joi.string().pattern(/^[A-HJ-NPR-Z0-9]{17}$/).allow(null),
    registration_number: Joi.string().max(50).allow(null),
    engine_number: Joi.string().max(50).allow(null),
    fuel_type: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'),
    transmission: Joi.string().valid('manual', 'automatic', 'cvt')
  }),
  status: Joi.string().valid('active', 'inactive', 'maintenance', 'decommissioned'),
  alerts_config: Joi.object({
    speed_limit: Joi.number().integer().min(10).max(200),
    idle_timeout: Joi.number().integer().min(60).max(7200),
    geofence_alerts: Joi.boolean(),
    maintenance_alerts: Joi.boolean(),
    fuel_alerts: Joi.boolean(),
    harsh_driving_alerts: Joi.boolean(),
    panic_alerts: Joi.boolean(),
    tamper_alerts: Joi.boolean(),
    low_battery_alerts: Joi.boolean()
  }),
  driver_behavior_config: Joi.object({
    harsh_acceleration_threshold: Joi.number().min(0.5).max(10),
    harsh_braking_threshold: Joi.number().min(-10).max(-0.5),
    sharp_turn_threshold: Joi.number().min(5).max(90),
    enable_scoring: Joi.boolean(),
    scoring_period: Joi.string().valid('daily', 'weekly', 'monthly')
  }),
  maintenance: Joi.object({
    last_service_date: Joi.date().allow(null),
    next_service_due: Joi.date().allow(null),
    service_interval_miles: Joi.number().integer().min(100).max(50000),
    service_interval_months: Joi.number().integer().min(1).max(24),
    preferred_service_center: Joi.string().max(200).allow(null)
  }),
  insurance: Joi.object({
    provider: Joi.string().max(100).allow(null),
    policy_number: Joi.string().max(100).allow(null),
    expiry_date: Joi.date().allow(null),
    coverage_type: Joi.string().valid('liability', 'comprehensive', 'collision', 'full').allow(null),
    premium_amount: Joi.number().min(0).allow(null),
    deductible: Joi.number().min(0).allow(null)
  })
}).min(1);

// ==================== VEHICLE EVENT VALIDATION SCHEMA ====================

export const VehicleEventValidationSchema = Joi.object({
  vehicle_id: uuidSchema,
  device_id: uuidSchema,
  customer_id: uuidSchema,
  event_type: Joi.string().valid(
    'start', 'stop', 'speed_alert', 'geofence_enter', 'geofence_exit',
    'harsh_acceleration', 'harsh_braking', 'sharp_turn', 'idle_timeout',
    'maintenance_due', 'fuel_low', 'battery_low', 'panic_button',
    'tamper_alert', 'accident_detected', 'towing_detected', 'unauthorized_usage',
    'device_offline', 'device_online', 'trip_started', 'trip_completed'
  ).required(),
  event_data: Joi.object({
    location: locationSchema.required(),
    speed: Joi.number().min(0).allow(null),
    heading: Joi.number().min(0).max(360).allow(null),
    odometer: Joi.number().min(0).allow(null),
    fuel_level: Joi.number().min(0).max(100).allow(null),
    engine_hours: Joi.number().min(0).allow(null),
    driver_id: uuidSchema.allow(null),
    additional_data: Joi.object().unknown(true).default({})
  }).required(),
  severity: Joi.string().valid('info', 'warning', 'critical').default('info'),
  priority: Joi.string().valid('low', 'medium', 'high').default('low'),
  timestamp: timestampSchema
});

// ==================== DEVICE DATA VALIDATION SCHEMA ====================

export const DeviceDataValidationSchema = Joi.object({
  device_id: uuidSchema,
  timestamp: timestampSchema,
  location: locationSchema.required(),
  vehicle_data: Joi.object({
    odometer: Joi.number().min(0).allow(null),
    fuel_level: Joi.number().min(0).max(100).allow(null),
    fuel_consumption: Joi.number().min(0).allow(null), // liters per 100km
    engine_rpm: Joi.number().integer().min(0).max(10000).allow(null),
    engine_temperature: Joi.number().min(-50).max(150).allow(null), // Celsius
    engine_load: Joi.number().min(0).max(100).allow(null), // percentage
    battery_voltage: Joi.number().min(6).max(24).allow(null), // volts
    alternator_voltage: Joi.number().min(6).max(24).allow(null), // volts
    ignition_status: Joi.boolean().default(false),
    door_status: Joi.object({
      driver: Joi.boolean().allow(null),
      passenger: Joi.boolean().allow(null),
      rear_left: Joi.boolean().allow(null),
      rear_right: Joi.boolean().allow(null),
      trunk: Joi.boolean().allow(null)
    }).allow(null),
    window_status: Joi.object({
      driver: Joi.boolean().allow(null),
      passenger: Joi.boolean().allow(null),
      rear_left: Joi.boolean().allow(null),
      rear_right: Joi.boolean().allow(null)
    }).allow(null),
    engine_hours: Joi.number().min(0).allow(null),
    idle_time: Joi.number().integer().min(0).allow(null), // seconds
    acceleration: Joi.object({
      x: Joi.number().min(-20).max(20).allow(null), // g-force
      y: Joi.number().min(-20).max(20).allow(null),
      z: Joi.number().min(-20).max(20).allow(null)
    }).allow(null),
    gyroscope: Joi.object({
      x: Joi.number().min(-2000).max(2000).allow(null), // degrees per second
      y: Joi.number().min(-2000).max(2000).allow(null),
      z: Joi.number().min(-2000).max(2000).allow(null)
    }).allow(null)
  }).default({}),
  device_status: Joi.object({
    battery_level: Joi.number().integer().min(0).max(100).default(100),
    charging_status: Joi.boolean().default(false),
    signal_strength: Joi.number().integer().min(-120).max(-30).default(0), // dBm
    network_type: Joi.string().valid('2G', '3G', '4G', '5G', 'WiFi').allow(null),
    gps_satellites: Joi.number().integer().min(0).max(20).default(0),
    gps_fix_type: Joi.string().valid('no_fix', '2d', '3d').allow(null),
    internal_temperature: Joi.number().min(-50).max(100).allow(null), // Celsius
    external_temperature: Joi.number().min(-50).max(100).allow(null), // Celsius
    humidity: Joi.number().min(0).max(100).allow(null), // percentage
    tamper_status: Joi.boolean().default(false),
    panic_button_pressed: Joi.boolean().default(false)
  }).default({}),
  diagnostic_data: Joi.object({
    error_codes: Joi.array().items(Joi.string().max(10)).default([]),
    warning_codes: Joi.array().items(Joi.string().max(10)).default([]),
    system_status: Joi.string().valid('normal', 'warning', 'error', 'critical').default('normal')
  }).default({}),
  raw_data: Joi.string().max(5000).allow(null) // Store original raw data for debugging
});

// ==================== GEOFENCE VALIDATION SCHEMA ====================

export const GeofenceValidationSchema = Joi.object({
  customer_id: uuidSchema,
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).default(''),
  type: Joi.string().valid('circle', 'polygon').required(),
  coordinates: Joi.when('type', {
    is: 'polygon',
    then: Joi.array().items(Joi.object({
      latitude: coordinateSchema,
      longitude: coordinateSchema
    })).min(3).required(), // Minimum 3 points for polygon
    otherwise: Joi.forbidden()
  }),
  center: Joi.when('type', {
    is: 'circle',
    then: Joi.object({
      latitude: coordinateSchema,
      longitude: coordinateSchema
    }).required(),
    otherwise: Joi.forbidden()
  }),
  radius: Joi.when('type', {
    is: 'circle',
    then: Joi.number().min(10).max(100000).required(), // 10 meters to 100km
    otherwise: Joi.forbidden()
  }),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6'), // Hex color
  border_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#1E40AF'),
  opacity: Joi.number().min(0).max(1).default(0.3),
  active: Joi.boolean().default(true),
  alert_on_enter: Joi.boolean().default(true),
  alert_on_exit: Joi.boolean().default(true),
  assigned_vehicles: Joi.array().items(uuidSchema).default([]),
  schedule: Joi.object({
    days: Joi.array().items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')).default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('00:00'), // HH:MM
    end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('23:59')
  }).allow(null),
  metadata: Joi.object().unknown(true).default({}),
  created_by: uuidSchema
});

// ==================== NOTIFICATION VALIDATION SCHEMA ====================

export const NotificationValidationSchema = Joi.object({
  customer_id: uuidSchema,
  user_id: uuidSchema.allow(null),
  vehicle_id: uuidSchema.allow(null),
  event_id: uuidSchema.allow(null),
  type: Joi.string().valid('alert', 'maintenance', 'billing', 'system', 'marketing').required(),
  category: Joi.string().valid(
    'speed', 'geofence', 'harsh_driving', 'maintenance', 'fuel', 'battery',
    'panic', 'tamper', 'accident', 'payment', 'subscription', 'device',
    'system_update', 'promotional'
  ).required(),
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(1000).required(),
  severity: Joi.string().valid('info', 'warning', 'critical').default('info'),
  channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'dashboard')).min(1).default(['dashboard']),
  metadata: Joi.object().unknown(true).default({}),
  expires_at: Joi.date().allow(null)
});

// ==================== SUBSCRIPTION VALIDATION SCHEMA ====================

export const SubscriptionValidationSchema = Joi.object({
  customer_id: uuidSchema,
  plan_id: Joi.string().valid(
    'individual_basic', 'individual_premium', 
    'business_starter', 'business_professional', 'business_enterprise'
  ).required(),
  status: Joi.string().valid('trial', 'active', 'past_due', 'cancelled', 'suspended', 'incomplete').default('trial'),
  stripe_customer_id: Joi.string().required(),
  stripe_subscription_id: Joi.string().allow(null),
  trial_start: timestampSchema,
  trial_end: Joi.date().greater(Joi.ref('trial_start')),
  current_period_start: timestampSchema,
  current_period_end: Joi.date().greater(Joi.ref('current_period_start')),
  next_billing_date: Joi.date(),
  auto_renewal: Joi.boolean().default(true),
  billing_cycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
  discount_applied: Joi.object({
    code: Joi.string().required(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    value: Joi.number().min(0).required(),
    expires_at: Joi.date().allow(null)
  }).allow(null),
  tax_rate: Joi.number().min(0).max(1).default(0) // 0 to 100%
});

// ==================== BILLING RECORD VALIDATION SCHEMA ====================

export const BillingRecordValidationSchema = Joi.object({
  customer_id: uuidSchema,
  subscription_id: uuidSchema,
  invoice_id: Joi.string().max(100).allow(null),
  stripe_invoice_id: Joi.string().max(100).allow(null),
  type: Joi.string().valid('subscription', 'usage', 'one_time', 'refund', 'credit', 'tax').required(),
  description: Joi.string().min(1).max(500).required(),
  amount: Joi.number().min(0).required(),
  currency: Joi.string().valid('usd', 'eur', 'gbp', 'cad', 'aud').default('usd'),
  tax_amount: Joi.number().min(0).default(0),
  total_amount: Joi.number().min(0).required(),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded', 'disputed').required(),
  payment_method: Joi.object({
    type: Joi.string().valid('card', 'bank_transfer', 'paypal', 'other').required(),
    last_four: Joi.string().length(4).allow(null),
    brand: Joi.string().allow(null)
  }).allow(null),
  billing_period_start: Joi.date().allow(null),
  billing_period_end: Joi.date().allow(null),
  usage_details: Joi.object({
    devices: Joi.number().integer().min(0).allow(null),
    users: Joi.number().integer().min(0).allow(null),
    api_calls: Joi.number().integer().min(0).allow(null),
    data_usage_gb: Joi.number().min(0).allow(null),
    sms_sent: Joi.number().integer().min(0).allow(null)
  }).allow(null),
  stripe_payment_intent_id: Joi.string().allow(null),
  payment_date: Joi.date().allow(null),
  due_date: Joi.date().allow(null)
});

// ==================== QUERY VALIDATION SCHEMAS ====================

// Common query parameters
export const PaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(50),
  offset: Joi.number().integer().min(0).default(0)
});

export const DateRangeSchema = Joi.object({
  start_date: Joi.date(),
  end_date: Joi.date().greater(Joi.ref('start_date'))
});

export const VehicleQuerySchema = Joi.object({
  customer_id: uuidSchema,
  status: Joi.string().valid('active', 'inactive', 'maintenance', 'decommissioned'),
  vehicle_type: Joi.string().valid('car', 'truck', 'van', 'motorcycle', 'bus', 'trailer', 'heavy_equipment', 'other'),
  assigned_driver_id: uuidSchema.allow(null),
  search: Joi.string().max(100), // Search by make, model, license plate
  ...PaginationSchema.describe().keys
});

export const DeviceDataQuerySchema = Joi.object({
  device_id: uuidSchema,
  vehicle_id: uuidSchema.allow(null),
  ...DateRangeSchema.describe().keys,
  ...PaginationSchema.describe().keys
});

export const EventQuerySchema = Joi.object({
  customer_id: uuidSchema.allow(null),
  vehicle_id: uuidSchema.allow(null),
  device_id: uuidSchema.allow(null),
  event_type: Joi.string().valid(
    'start', 'stop', 'speed_alert', 'geofence_enter', 'geofence_exit',
    'harsh_acceleration', 'harsh_braking', 'sharp_turn', 'idle_timeout',
    'maintenance_due', 'fuel_low', 'battery_low', 'panic_button',
    'tamper_alert', 'accident_detected', 'towing_detected'
  ),
  severity: Joi.string().valid('info', 'warning', 'critical'),
  acknowledged: Joi.boolean(),
  ...DateRangeSchema.describe().keys,
  ...PaginationSchema.describe().keys
});

// ==================== EXPORT ALL SCHEMAS ====================

export default {
  // Document schemas
  CustomerValidationSchema,
  CustomerUpdateSchema,
  UserValidationSchema,
  UserUpdateSchema,
  DeviceValidationSchema,
  DeviceUpdateSchema,
  VehicleValidationSchema,
  VehicleUpdateSchema,
  VehicleEventValidationSchema,
  DeviceDataValidationSchema,
  GeofenceValidationSchema,
  NotificationValidationSchema,
  SubscriptionValidationSchema,
  BillingRecordValidationSchema,
  
  // Query schemas
  PaginationSchema,
  DateRangeSchema,
  VehicleQuerySchema,
  DeviceDataQuerySchema,
  EventQuerySchema,
  
  // Shared schemas
  addressSchema,
  locationSchema,
  emailSchema,
  phoneSchema,
  uuidSchema,
  coordinateSchema,
  timestampSchema
};