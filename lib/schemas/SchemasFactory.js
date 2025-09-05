import { v4 as uuidv4 } from 'uuid';

export class SchemaFactory {
  
  // ==================== CUSTOMER SCHEMA ====================
  
  static createCustomer(data) {
    return {
      id: uuidv4(),
      customer_type: data.customer_type, // 'individual' | 'business'
      business_name: data.business_name || null,
      contact_person: data.contact_person,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        country: data.address.country
      },
      billing_address: data.billing_address || data.address,
      tax_info: {
        tax_id: data.tax_info?.tax_id || null,
        tax_exempt: data.tax_info?.tax_exempt || false
      },
      stripe_customer_id: null, // Will be set when Stripe customer is created
      subscription_id: null, // Will be set when subscription is created
      created_at: new Date(),
      updated_at: new Date(),
      status: 'active'
    };
  }

  // ==================== USER SCHEMA ====================
  
  static createUser(data) {
    return {
      id: uuidv4(),
      customer_id: data.customer_id,
      email: data.email.toLowerCase(),
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
      role: data.role, // 'owner', 'admin', 'manager', 'driver', 'viewer'
      permissions: this.getDefaultPermissions(data.role),
      is_active: true,
      email_verified: data.email_verified || false,
      password_hash: data.password_hash,
      auth0_user_id: data.auth0_user_id || null,
      avatar_url: data.avatar_url || null,
      last_login: null,
      login_count: 0,
      preferences: {
        language: data.preferences?.language || 'en',
        timezone: data.preferences?.timezone || 'UTC',
        notifications: {
          email: data.preferences?.notifications?.email ?? true,
          sms: data.preferences?.notifications?.sms ?? false,
          push: data.preferences?.notifications?.push ?? true,
          dashboard_alerts: data.preferences?.notifications?.dashboard_alerts ?? true,
          maintenance_reminders: data.preferences?.notifications?.maintenance_reminders ?? true,
          geofence_alerts: data.preferences?.notifications?.geofence_alerts ?? true,
          speed_alerts: data.preferences?.notifications?.speed_alerts ?? true
        },
        dashboard_layout: data.preferences?.dashboard_layout || {
          widgets: ['fleet_overview', 'recent_events', 'vehicle_status', 'alerts'],
          theme: 'light',
          refresh_interval: 30 // seconds
        },
        map_settings: {
          default_zoom: 10,
          traffic_overlay: false,
          satellite_view: false,
          show_routes: true,
          clustering: true
        }
      },
      created_by: data.created_by || null,
      created_at: new Date(),
      updated_at: new Date(),
      deactivated_at: null
    };
  }

  // ==================== DEVICE SCHEMA ====================
  
  static createDevice(data) {
    return {
      id: uuidv4(),
      serial_number: data.serial_number.toUpperCase(),
      model: data.model,
      manufacturer: data.manufacturer || 'Trans Technologies',
      firmware_version: data.firmware_version,
      hardware_version: data.hardware_version || '1.0',
      imei: data.imei || null,
      iccid: data.iccid || null, // SIM card identifier
      customer_id: data.customer_id || null,
      owner_id: data.owner_id || null,
      assigned_vehicle_id: null,
      status: 'sold', // 'sold', 'registered', 'activated', 'suspended', 'deactivated'
      configuration: {
        reporting_interval: data.configuration?.reporting_interval || 60, // seconds
        geofence_enabled: data.configuration?.geofence_enabled || false,
        speed_limit: data.configuration?.speed_limit || 80, // km/h
        idle_timeout: data.configuration?.idle_timeout || 300, // seconds (5 minutes)
        harsh_driving_enabled: data.configuration?.harsh_driving_enabled || true,
        panic_button_enabled: data.configuration?.panic_button_enabled || true,
        immobilizer_enabled: data.configuration?.immobilizer_enabled || false,
        anti_theft_mode: data.configuration?.anti_theft_mode || false,
        power_save_mode: data.configuration?.power_save_mode || false,
        scheduled_reports: data.configuration?.scheduled_reports || []
      },
      connectivity: {
        cellular_provider: data.connectivity?.cellular_provider || 'Unknown',
        sim_card_id: data.connectivity?.sim_card_id || null,
        data_plan: data.connectivity?.data_plan || 'basic',
        apn_settings: data.connectivity?.apn_settings || null
      },
      warranty: {
        start_date: data.warranty?.start_date || new Date(),
        end_date: data.warranty?.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        coverage_type: data.warranty?.coverage_type || 'basic'
      },
      installation_info: {
        installer_name: data.installation_info?.installer_name || null,
        installation_date: data.installation_info?.installation_date || null,
        installation_location: data.installation_info?.installation_location || null,
        installation_notes: data.installation_info?.installation_notes || null
      },
      activated_at: null,
      last_heartbeat: null,
      last_location: null,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // ==================== VEHICLE SCHEMA ====================
  
  static createVehicle(data) {
    return {
      id: uuidv4(),
      customer_id: data.customer_id,
      device_id: data.device_id,
      assigned_driver_id: data.assigned_driver_id || null,
      vehicle_info: {
        make: data.vehicle_info.make,
        model: data.vehicle_info.model,
        year: data.vehicle_info.year,
        color: data.vehicle_info.color,
        license_plate: data.vehicle_info.license_plate.toUpperCase(),
        vin: data.vehicle_info.vin?.toUpperCase() || null,
        registration_number: data.vehicle_info.registration_number || null,
        engine_number: data.vehicle_info.engine_number || null,
        fuel_type: data.vehicle_info.fuel_type || 'gasoline', // 'gasoline', 'diesel', 'electric', 'hybrid'
        transmission: data.vehicle_info.transmission || 'automatic' // 'manual', 'automatic'
      },
      vehicle_type: data.vehicle_type, // 'car', 'truck', 'van', 'motorcycle', 'other'
      status: 'active', // 'active', 'inactive', 'maintenance', 'decommissioned'
      odometer: {
        current_reading: data.odometer?.current_reading || 0,
        last_updated: new Date(),
        unit: data.odometer?.unit || 'kilometers' // 'miles', 'kilometers'
      },
      fuel_info: {
        tank_capacity: data.fuel_info?.tank_capacity || null, // liters
        current_level: data.fuel_info?.current_level || null, // percentage
        fuel_efficiency: data.fuel_info?.fuel_efficiency || null, // km/l or mpg
        last_refuel_date: data.fuel_info?.last_refuel_date || null,
        last_refuel_amount: data.fuel_info?.last_refuel_amount || null
      },
      maintenance: {
        last_service_date: data.maintenance?.last_service_date || null,
        next_service_due: data.maintenance?.next_service_due || null,
        service_interval_miles: data.maintenance?.service_interval_miles || 5000,
        service_interval_months: data.maintenance?.service_interval_months || 6,
        preferred_service_center: data.maintenance?.preferred_service_center || null,
        maintenance_schedule: data.maintenance?.maintenance_schedule || [],
        service_history: []
      },
      insurance: {
        provider: data.insurance?.provider || null,
        policy_number: data.insurance?.policy_number || null,
        expiry_date: data.insurance?.expiry_date || null,
        coverage_type: data.insurance?.coverage_type || null,
        premium_amount: data.insurance?.premium_amount || null,
        deductible: data.insurance?.deductible || null
      },
      registration: {
        registration_number: data.registration?.registration_number || null,
        registration_date: data.registration?.registration_date || null,
        expiry_date: data.registration?.expiry_date || null,
        issuing_authority: data.registration?.issuing_authority || null
      },
      geofences: data.geofences || [],
      alerts_config: {
        speed_limit: data.alerts_config?.speed_limit || 80, // km/h
        idle_timeout: data.alerts_config?.idle_timeout || 300, // seconds
        geofence_alerts: data.alerts_config?.geofence_alerts ?? true,
        maintenance_alerts: data.alerts_config?.maintenance_alerts ?? true,
        fuel_alerts: data.alerts_config?.fuel_alerts ?? true,
        harsh_driving_alerts: data.alerts_config?.harsh_driving_alerts ?? true,
        panic_alerts: data.alerts_config?.panic_alerts ?? true,
        tamper_alerts: data.alerts_config?.tamper_alerts ?? true,
        low_battery_alerts: data.alerts_config?.low_battery_alerts ?? true
      },
      driver_behavior_config: {
        harsh_acceleration_threshold: 2.5, // m/s²
        harsh_braking_threshold: -2.5, // m/s²
        sharp_turn_threshold: 30, // degrees per second
        enable_scoring: true,
        scoring_period: 'weekly' // 'daily', 'weekly', 'monthly'
      },
      cost_tracking: {
        purchase_price: data.cost_tracking?.purchase_price || null,
        purchase_date: data.cost_tracking?.purchase_date || null,
        depreciation_rate: data.cost_tracking?.depreciation_rate || 0.15, // 15% per year
        operating_cost_per_km: data.cost_tracking?.operating_cost_per_km || null
      },
      assigned_at: data.assigned_driver_id ? new Date() : null,
      assigned_by: data.created_by || null,
      created_by: data.created_by,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // ==================== VEHICLE EVENT SCHEMA ====================
  
  static createVehicleEvent(data) {
    return {
      id: uuidv4(),
      vehicle_id: data.vehicle_id,
      device_id: data.device_id,
      customer_id: data.customer_id,
      event_type: data.event_type, // 'start', 'stop', 'speed_alert', 'geofence_enter', etc.
      event_data: {
        location: {
          latitude: data.event_data.location.latitude,
          longitude: data.event_data.location.longitude,
          address: data.event_data.location.address || null,
          accuracy: data.event_data.location.accuracy || 10,
          heading: data.event_data.location.heading || null,
          altitude: data.event_data.location.altitude || null
        },
        speed: data.event_data.speed || null,
        heading: data.event_data.heading || null,
        odometer: data.event_data.odometer || null,
        fuel_level: data.event_data.fuel_level || null,
        engine_hours: data.event_data.engine_hours || null,
        driver_id: data.event_data.driver_id || null,
        additional_data: {
          ...data.event_data.additional_data,
          ...this.getEventTypeSpecificData(data.event_type, data.event_data)
        }
      },
      severity: data.severity || this.determineSeverity(data.event_type),
      priority: data.priority || this.determinePriority(data.event_type),
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null,
      resolved: false,
      resolved_by: null,
      resolved_at: null,
      notification_sent: false,
      notification_channels: [],
      timestamp: data.timestamp || new Date(),
      created_at: new Date()
    };
  }

  // ==================== DEVICE DATA SCHEMA ====================
  
  static createDeviceData(data) {
    return {
      id: uuidv4(),
      device_id: data.device_id,
      timestamp: data.timestamp || new Date(),
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        altitude: data.location.altitude || null,
        accuracy: data.location.accuracy || 10,
        heading: data.location.heading || null,
        speed: data.location.speed || 0,
        satellites: data.location.satellites || null
      },
      vehicle_data: {
        odometer: data.vehicle_data?.odometer || null,
        fuel_level: data.vehicle_data?.fuel_level || null,
        fuel_consumption: data.vehicle_data?.fuel_consumption || null,
        engine_rpm: data.vehicle_data?.engine_rpm || null,
        engine_temperature: data.vehicle_data?.engine_temperature || null,
        engine_load: data.vehicle_data?.engine_load || null,
        battery_voltage: data.vehicle_data?.battery_voltage || null,
        alternator_voltage: data.vehicle_data?.alternator_voltage || null,
        ignition_status: data.vehicle_data?.ignition_status || false,
        door_status: data.vehicle_data?.door_status || null,
        window_status: data.vehicle_data?.window_status || null,
        engine_hours: data.vehicle_data?.engine_hours || null,
        idle_time: data.vehicle_data?.idle_time || null,
        acceleration: {
          x: data.vehicle_data?.acceleration?.x || null,
          y: data.vehicle_data?.acceleration?.y || null,
          z: data.vehicle_data?.acceleration?.z || null
        },
        gyroscope: {
          x: data.vehicle_data?.gyroscope?.x || null,
          y: data.vehicle_data?.gyroscope?.y || null,
          z: data.vehicle_data?.gyroscope?.z || null
        }
      },
      device_status: {
        battery_level: data.device_status?.battery_level || 100,
        charging_status: data.device_status?.charging_status || false,
        signal_strength: data.device_status?.signal_strength || 0,
        network_type: data.device_status?.network_type || null, // '2G', '3G', '4G', '5G'
        gps_satellites: data.device_status?.gps_satellites || 0,
        gps_fix_type: data.device_status?.gps_fix_type || null, // 'no_fix', '2d', '3d'
        internal_temperature: data.device_status?.internal_temperature || null,
        external_temperature: data.device_status?.external_temperature || null,
        humidity: data.device_status?.humidity || null,
        tamper_status: data.device_status?.tamper_status || false,
        panic_button_pressed: data.device_status?.panic_button_pressed || false
      },
      diagnostic_data: {
        error_codes: data.diagnostic_data?.error_codes || [],
        warning_codes: data.diagnostic_data?.warning_codes || [],
        system_status: data.diagnostic_data?.system_status || 'normal'
      },
      raw_data: data.raw_data || null, // Store original raw data for debugging
      created_at: new Date()
    };
  }

  // ==================== SUBSCRIPTION SCHEMA ====================
  
  static createSubscription(data) {
    return {
      id: uuidv4(),
      customer_id: data.customer_id,
      plan_id: data.plan_id,
      plan_details: data.plan_details,
      status: data.status || 'trial', // 'trial', 'active', 'past_due', 'cancelled', 'suspended'
      stripe_customer_id: data.stripe_customer_id,
      stripe_subscription_id: data.stripe_subscription_id || null,
      trial_start: data.trial_start || new Date(),
      trial_end: data.trial_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      current_period_start: data.current_period_start || new Date(),
      current_period_end: data.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      next_billing_date: data.next_billing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auto_renewal: data.auto_renewal ?? true,
      payment_method: data.payment_method || null,
      billing_cycle: data.billing_cycle || 'monthly', // 'monthly', 'yearly'
      discount_applied: data.discount_applied || null,
      tax_rate: data.tax_rate || 0,
      usage_metrics: {
        devices_used: 0,
        users_created: 1,
        api_calls_month: 0,
        data_usage_gb: 0,
        sms_sent: 0,
        email_notifications_sent: 0,
        reports_generated: 0,
        ...data.usage_metrics
      },
      billing_history: [],
      payment_failure_count: 0,
      last_payment_failure: null,
      last_failure_reason: null,
      suspended_at: null,
      suspension_reason: null,
      cancelled_at: null,
      cancellation_reason: null,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // ==================== BILLING RECORD SCHEMA ====================
  
  static createBillingRecord(data) {
    return {
      id: uuidv4(),
      customer_id: data.customer_id,
      subscription_id: data.subscription_id,
      invoice_id: data.invoice_id || null,
      stripe_invoice_id: data.stripe_invoice_id || null,
      type: data.type, // 'subscription', 'usage', 'one_time', 'refund', 'credit'
      description: data.description,
      amount: data.amount,
      currency: data.currency || 'usd',
      tax_amount: data.tax_amount || 0,
      total_amount: data.total_amount || data.amount,
      status: data.status, // 'pending', 'paid', 'failed', 'refunded'
      payment_method: data.payment_method || null,
      billing_period_start: data.billing_period_start || null,
      billing_period_end: data.billing_period_end || null,
      usage_details: data.usage_details || null,
      stripe_payment_intent_id: data.stripe_payment_intent_id || null,
      payment_date: data.payment_date || null,
      due_date: data.due_date || null,
      created_at: new Date()
    };
  }

  // ==================== NOTIFICATION SCHEMA ====================
  
  static createNotification(data) {
    return {
      id: uuidv4(),
      customer_id: data.customer_id,
      user_id: data.user_id || null,
      vehicle_id: data.vehicle_id || null,
      event_id: data.event_id || null,
      type: data.type, // 'alert', 'maintenance', 'billing', 'system', 'marketing'
      category: data.category, // 'speed', 'geofence', 'maintenance', 'payment', etc.
      title: data.title,
      message: data.message,
      severity: data.severity || 'info', // 'info', 'warning', 'critical'
      channels: data.channels || ['dashboard'], // 'email', 'sms', 'push', 'dashboard'
      delivery_status: {
        email: data.channels?.includes('email') ? 'pending' : null,
        sms: data.channels?.includes('sms') ? 'pending' : null,
        push: data.channels?.includes('push') ? 'pending' : null,
        dashboard: data.channels?.includes('dashboard') ? 'delivered' : null
      },
      metadata: data.metadata || {},
      read: false,
      read_at: null,
      archived: false,
      archived_at: null,
      expires_at: data.expires_at || null,
      created_at: new Date()
    };
  }

  // ==================== GEOFENCE SCHEMA ====================
  
  static createGeofence(data) {
    return {
      id: uuidv4(),
      customer_id: data.customer_id,
      name: data.name,
      description: data.description || '',
      type: data.type, // 'circle', 'polygon'
      coordinates: data.coordinates, // For polygon: array of {lat, lng}
      center: data.center || null, // For circle: {lat, lng}
      radius: data.radius || null, // For circle: radius in meters
      color: data.color || '#3B82F6',
      border_color: data.border_color || '#1E40AF',
      opacity: data.opacity || 0.3,
      active: data.active ?? true,
      alert_on_enter: data.alert_on_enter ?? true,
      alert_on_exit: data.alert_on_exit ?? true,
      assigned_vehicles: data.assigned_vehicles || [], // Array of vehicle IDs
      schedule: data.schedule || null, // When geofence is active
      metadata: data.metadata || {},
      created_by: data.created_by,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // ==================== HELPER METHODS ====================
  
  static getDefaultPermissions(role) {
    const permissions = {
      owner: ['*'], // All permissions
      admin: [
        'manage_users', 'manage_vehicles', 'manage_devices', 
        'view_reports', 'manage_billing', 'view_all_data',
        'manage_geofences', 'manage_alerts', 'export_data',
        'manage_integrations', 'view_analytics'
      ],
      manager: [
        'view_vehicles', 'manage_drivers', 'view_reports', 
        'acknowledge_alerts', 'view_fleet_data', 'manage_geofences',
        'view_analytics', 'export_data'
      ],
      driver: [
        'view_assigned_vehicle', 'update_status', 'view_routes',
        'view_trip_history', 'update_driver_info'
      ],
      viewer: [
        'view_vehicles', 'view_reports', 'view_basic_data'
      ]
    };
    return permissions[role] || [];
  }

  static determineSeverity(eventType) {
    const severityMap = {
      // Info level events
      'start': 'info',
      'stop': 'info',
      'geofence_enter': 'info',
      'maintenance_completed': 'info',
      'trip_completed': 'info',
      
      // Warning level events
      'speed_alert': 'warning',
      'geofence_exit': 'warning',
      'idle_timeout': 'warning',
      'harsh_acceleration': 'warning',
      'harsh_braking': 'warning',
      'sharp_turn': 'warning',
      'maintenance_due': 'warning',
      'fuel_low': 'warning',
      'battery_low': 'warning',
      
      // Critical level events
      'panic_button': 'critical',
      'accident_detected': 'critical',
      'tamper_alert': 'critical',
      'device_offline': 'critical',
      'unauthorized_usage': 'critical',
      'towing_detected': 'critical'
    };
    return severityMap[eventType] || 'info';
  }

  static determinePriority(eventType) {
    const priorityMap = {
      'panic_button': 'high',
      'accident_detected': 'high',
      'tamper_alert': 'high',
      'towing_detected': 'high',
      'speed_alert': 'medium',
      'geofence_exit': 'medium',
      'harsh_driving': 'medium',
      'maintenance_due': 'medium',
      'start': 'low',
      'stop': 'low',
      'geofence_enter': 'low'
    };
    return priorityMap[eventType] || 'low';
  }

  static getEventTypeSpecificData(eventType, eventData) {
    const specificData = {};
    
    switch (eventType) {
      case 'speed_alert':
        specificData.speed_limit = eventData.speed_limit;
        specificData.actual_speed = eventData.speed;
        specificData.overspeed_amount = eventData.speed - eventData.speed_limit;
        break;
        
      case 'geofence_enter':
      case 'geofence_exit':
        specificData.geofence_id = eventData.geofence_id;
        specificData.geofence_name = eventData.geofence_name;
        break;
        
      case 'harsh_acceleration':
      case 'harsh_braking':
        specificData.acceleration = eventData.acceleration;
        specificData.g_force = Math.abs(eventData.acceleration / 9.81);
        break;
        
      case 'sharp_turn':
        specificData.turn_rate = eventData.turn_rate;
        specificData.heading_change = eventData.heading_change;
        break;
        
      case 'idle_timeout':
        specificData.idle_duration = eventData.idle_duration;
        break;
        
      case 'maintenance_due':
        specificData.service_type = eventData.service_type;
        specificData.due_date = eventData.due_date;
        specificData.overdue_days = eventData.overdue_days;
        break;
        
      case 'fuel_low':
        specificData.fuel_level = eventData.fuel_level;
        specificData.estimated_range = eventData.estimated_range;
        break;
        
      case 'panic_button':
        specificData.button_held_duration = eventData.button_held_duration;
        break;
        
      case 'tamper_alert':
        specificData.tamper_type = eventData.tamper_type;
        break;
    }
    
    return specificData;
  }

  // ==================== VALIDATION HELPERS ====================
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhoneNumber(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }

  static validateVIN(vin) {
    if (!vin) return true; // VIN is optional
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  }

  static validateLicensePlate(licensePlate) {
    // Basic validation - can be customized per region
    return licensePlate && licensePlate.length >= 2 && licensePlate.length <= 15;
  }

  static validateCoordinates(latitude, longitude) {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  // ==================== DATA SANITIZATION ====================
  
  static sanitizeUserInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/[<>]/g, ''); // Remove HTML brackets
  }

  static sanitizePhoneNumber(phone) {
    if (!phone) return null;
    return phone.replace(/[^\d\+\-\(\)\s]/g, '');
  }

  static formatLicensePlate(licensePlate) {
    return licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  static formatVIN(vin) {
    if (!vin) return null;
    return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  }

  // ==================== CONSTANTS ====================
  
  static VEHICLE_STATUSES = ['active', 'inactive', 'maintenance', 'decommissioned'];
  static DEVICE_STATUSES = ['sold', 'registered', 'activated', 'suspended', 'deactivated'];
  static USER_ROLES = ['owner', 'admin', 'manager', 'driver', 'viewer'];
  static EVENT_TYPES = [
    'start', 'stop', 'speed_alert', 'geofence_enter', 'geofence_exit',
    'harsh_acceleration', 'harsh_braking', 'sharp_turn', 'idle_timeout',
    'maintenance_due', 'fuel_low', 'battery_low', 'panic_button',
    'tamper_alert', 'accident_detected', 'towing_detected'
  ];
  static SEVERITY_LEVELS = ['info', 'warning', 'critical'];
  static PRIORITY_LEVELS = ['low', 'medium', 'high'];
}

export default SchemaFactory;