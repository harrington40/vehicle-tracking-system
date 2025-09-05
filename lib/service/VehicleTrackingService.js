import RethinkDBService from '../database/RethinkDBService.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import DataService from './DataService.js';
import { SchemaFactory } from '../schemas/SchemaFactory.js';
import r from 'rethinkdb';
import { v4 as uuidv4 } from 'uuid';

export class VehicleTrackingService {
  constructor() {
    this.db = RethinkDBService;
    this.dataService = DataService;
    this.activeSubscriptions = new Map(); // Track active real-time subscriptions
    this.geofences = new Map(); // Cache geofences for quick lookup
  }

  // ==================== REAL-TIME TRACKING ====================

  /**
   * Get live vehicle locations with enriched data
   */
  async getLiveVehicleData(customerId, vehicleIds = null) {
    try {
      const vehicles = vehicleIds 
        ? await Promise.all(vehicleIds.map(id => this.dataService.getVehicleById(id)))
        : await this.dataService.getVehiclesByCustomerId(customerId);

      const enrichedVehicles = await Promise.all(
        vehicles.filter(v => v).map(async (vehicle) => {
          const [latestData, recentEvents, deviceStatus] = await Promise.all([
            this.dataService.getLatestDeviceData(vehicle.device_id),
            this.dataService.getVehicleEvents(vehicle.id, 5),
            this.getDeviceStatus(vehicle.device_id)
          ]);

          return {
            ...vehicle,
            current_location: latestData?.location || null,
            current_speed: latestData?.location?.speed || 0,
            current_heading: latestData?.location?.heading || 0,
            last_update: latestData?.timestamp || null,
            device_status: deviceStatus,
            vehicle_status: this.determineVehicleStatus(latestData, recentEvents),
            recent_events: recentEvents.slice(0, 3),
            alerts: recentEvents.filter(e => e.severity === 'warning' || e.severity === 'critical'),
            trip_info: await this.getCurrentTripInfo(vehicle.id)
          };
        })
      );

      return enrichedVehicles;
    } catch (error) {
      console.error('Error getting live vehicle data:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time vehicle updates
   */
  async subscribeToVehicleUpdates(customerId, callback, options = {}) {
    try {
      const subscriptionId = uuidv4();
      
      // Get customer's vehicles
      const vehicles = await this.dataService.getVehiclesByCustomerId(customerId);
      const deviceIds = vehicles.map(v => v.device_id);

      if (deviceIds.length === 0) {
        console.warn('No devices found for customer:', customerId);
        return null;
      }

      // Subscribe to device data changes
      const cursor = await r.table(TABLES.device_data)
        .getAll(r.args(deviceIds), { index: 'device_id' })
        .changes({ 
          includeInitial: options.includeInitial || false,
          includeStates: true,
          includeOffsets: true
        })
        .run(this.db.connection);

      // Store subscription for cleanup
      this.activeSubscriptions.set(subscriptionId, cursor);

      cursor.each(async (err, change) => {
        if (err) {
          console.error('Real-time subscription error:', err);
          callback({ type: 'error', error: err });
          return;
        }

        if (change.new_val) {
          try {
            // Process the new data and enrich it
            const deviceData = change.new_val;
            const vehicle = vehicles.find(v => v.device_id === deviceData.device_id);
            
            if (vehicle) {
              // Check for events (speed alerts, geofence violations, etc.)
              await this.processDeviceDataForEvents(vehicle, deviceData);
              
              // Prepare enriched update
              const enrichedUpdate = {
                type: 'location_update',
                vehicle_id: vehicle.id,
                device_id: deviceData.device_id,
                timestamp: deviceData.timestamp,
                location: deviceData.location,
                vehicle_data: deviceData.vehicle_data,
                device_status: deviceData.device_status,
                vehicle_status: this.determineVehicleStatusFromData(deviceData),
                alerts: await this.checkForAlerts(vehicle, deviceData)
              };

              callback(enrichedUpdate);
            }
          } catch (error) {
            console.error('Error processing real-time update:', error);
            callback({ type: 'error', error: error.message });
          }
        }
      });

      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to vehicle updates:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribeFromVehicleUpdates(subscriptionId) {
    try {
      const cursor = this.activeSubscriptions.get(subscriptionId);
      if (cursor) {
        await cursor.close();
        this.activeSubscriptions.delete(subscriptionId);
        console.log(`Unsubscribed from vehicle updates: ${subscriptionId}`);
      }
    } catch (error) {
      console.error('Error unsubscribing from vehicle updates:', error);
    }
  }

  // ==================== DEVICE DATA PROCESSING ====================

  /**
   * Process incoming device data and store it
   */
  async processIncomingDeviceData(deviceId, rawData) {
    try {
      // Validate device exists and is active
      const device = await this.dataService.getDeviceById(deviceId);
      if (!device || device.status !== 'activated') {
        throw new Error(`Device ${deviceId} not found or not activated`);
      }

      // Parse and validate the raw data
      const processedData = this.parseDeviceData(rawData);
      
      // Create device data record
      const deviceData = {
        device_id: deviceId,
        timestamp: processedData.timestamp || new Date(),
        location: processedData.location,
        vehicle_data: processedData.vehicle_data || {},
        device_status: processedData.device_status || {}
      };

      // Store in database
      await this.dataService.createDeviceData(deviceData);

      // Update device heartbeat and last location
      await this.dataService.updateDeviceHeartbeat(deviceId, processedData.location);

      // Process for events if vehicle is assigned
      if (device.assigned_vehicle_id) {
        const vehicle = await this.dataService.getVehicleById(device.assigned_vehicle_id);
        if (vehicle) {
          await this.processDeviceDataForEvents(vehicle, deviceData);
        }
      }

      return deviceData;
    } catch (error) {
      console.error('Error processing incoming device data:', error);
      throw error;
    }
  }

  /**
   * Parse raw device data into structured format
   */
  parseDeviceData(rawData) {
    try {
      // Handle different data formats (JSON, CSV, binary, etc.)
      let data = rawData;
      
      if (typeof rawData === 'string') {
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          // Try parsing as CSV or other formats
          data = this.parseCSVDeviceData(rawData);
        }
      }

      // Standardize the data structure
      return {
        timestamp: new Date(data.timestamp || data.ts || Date.now()),
        location: {
          latitude: parseFloat(data.latitude || data.lat),
          longitude: parseFloat(data.longitude || data.lng || data.lon),
          altitude: data.altitude ? parseFloat(data.altitude) : null,
          accuracy: data.accuracy ? parseFloat(data.accuracy) : 10,
          heading: data.heading ? parseFloat(data.heading) : null,
          speed: data.speed ? parseFloat(data.speed) : 0
        },
        vehicle_data: {
          odometer: data.odometer ? parseFloat(data.odometer) : null,
          fuel_level: data.fuel_level ? parseFloat(data.fuel_level) : null,
          engine_rpm: data.engine_rpm ? parseInt(data.engine_rpm) : null,
          engine_temperature: data.engine_temp ? parseFloat(data.engine_temp) : null,
          battery_voltage: data.battery_voltage ? parseFloat(data.battery_voltage) : null,
          ignition_status: Boolean(data.ignition || data.ignition_status),
          door_status: data.door_status || null,
          engine_hours: data.engine_hours ? parseFloat(data.engine_hours) : null
        },
        device_status: {
          battery_level: data.device_battery ? parseInt(data.device_battery) : 100,
          signal_strength: data.signal_strength ? parseInt(data.signal_strength) : 0,
          gps_satellites: data.gps_satellites ? parseInt(data.gps_satellites) : 0,
          temperature: data.device_temp ? parseFloat(data.device_temp) : null
        }
      };
    } catch (error) {
      console.error('Error parsing device data:', error);
      throw new Error('Invalid device data format');
    }
  }

  /**
   * Parse CSV format device data
   */
  parseCSVDeviceData(csvData) {
    const fields = csvData.split(',');
    // Implement CSV parsing based on your device's format
    // This is a generic example
    return {
      timestamp: fields[0],
      latitude: fields[1],
      longitude: fields[2],
      speed: fields[3],
      heading: fields[4],
      ignition: fields[5] === '1'
    };
  }

  // ==================== EVENT PROCESSING ====================

  /**
   * Process device data for events and alerts
   */
  async processDeviceDataForEvents(vehicle, deviceData) {
    try {
      const events = [];
      const location = deviceData.location;
      const vehicleData = deviceData.vehicle_data;
      const timestamp = deviceData.timestamp;

      // Speed alert
      if (location.speed > vehicle.alerts_config.speed_limit) {
        events.push(await this.createVehicleEvent(vehicle, 'speed_alert', {
          location,
          speed: location.speed,
          speed_limit: vehicle.alerts_config.speed_limit,
          severity: location.speed > vehicle.alerts_config.speed_limit * 1.2 ? 'critical' : 'warning'
        }));
      }

      // Ignition events
      const lastData = await this.dataService.getLatestDeviceData(vehicle.device_id);
      if (lastData && lastData.vehicle_data.ignition_status !== vehicleData.ignition_status) {
        const eventType = vehicleData.ignition_status ? 'start' : 'stop';
        events.push(await this.createVehicleEvent(vehicle, eventType, {
          location,
          ignition_status: vehicleData.ignition_status
        }));
      }

      // Geofence events
      await this.checkGeofenceEvents(vehicle, location, timestamp);

      // Idle timeout
      if (vehicleData.ignition_status && location.speed < 1) {
        await this.checkIdleTimeout(vehicle, timestamp);
      }

      // Harsh driving detection
      if (lastData) {
        const harshEvents = this.detectHarshDriving(lastData, deviceData);
        for (const harshEvent of harshEvents) {
          events.push(await this.createVehicleEvent(vehicle, 'harsh_driving', harshEvent));
        }
      }

      return events;
    } catch (error) {
      console.error('Error processing device data for events:', error);
      return [];
    }
  }

  /**
   * Create a vehicle event
   */
  async createVehicleEvent(vehicle, eventType, eventData) {
    try {
      const event = {
        vehicle_id: vehicle.id,
        device_id: vehicle.device_id,
        customer_id: vehicle.customer_id,
        event_type: eventType,
        event_data: {
          location: eventData.location,
          ...eventData
        },
        timestamp: eventData.timestamp || new Date()
      };

      return await this.dataService.createVehicleEvent(event);
    } catch (error) {
      console.error('Error creating vehicle event:', error);
      throw error;
    }
  }

  // ==================== GEOFENCING ====================

  /**
   * Check for geofence entry/exit events
   */
  async checkGeofenceEvents(vehicle, location, timestamp) {
    try {
      if (!vehicle.geofences || vehicle.geofences.length === 0) {
        return [];
      }

      const events = [];
      
      for (const geofence of vehicle.geofences) {
        const isInside = this.isPointInGeofence(location, geofence);
        const wasInside = await this.wasVehicleInGeofence(vehicle.id, geofence.id);

        if (isInside && !wasInside) {
          // Entered geofence
          events.push(await this.createVehicleEvent(vehicle, 'geofence_enter', {
            location,
            geofence_id: geofence.id,
            geofence_name: geofence.name,
            timestamp
          }));
        } else if (!isInside && wasInside) {
          // Exited geofence
          events.push(await this.createVehicleEvent(vehicle, 'geofence_exit', {
            location,
            geofence_id: geofence.id,
            geofence_name: geofence.name,
            timestamp
          }));
        }

        // Update geofence status cache
        await this.updateGeofenceStatus(vehicle.id, geofence.id, isInside);
      }

      return events;
    } catch (error) {
      console.error('Error checking geofence events:', error);
      return [];
    }
  }

  /**
   * Check if point is inside geofence
   */
  isPointInGeofence(location, geofence) {
    if (geofence.type === 'circle') {
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        geofence.center.latitude, geofence.center.longitude
      );
      return distance <= geofence.radius;
    } else if (geofence.type === 'polygon') {
      return this.isPointInPolygon(location, geofence.coordinates);
    }
    return false;
  }

  /**
   * Calculate distance between two points in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if point is inside polygon using ray casting algorithm
   */
  isPointInPolygon(location, polygon) {
    const x = location.longitude;
    const y = location.latitude;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude;
      const yi = polygon[i].latitude;
      const xj = polygon[j].longitude;
      const yj = polygon[j].latitude;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  // ==================== HARSH DRIVING DETECTION ====================

  /**
   * Detect harsh driving events
   */
  detectHarshDriving(previousData, currentData) {
    const events = [];
    const timeDiff = (new Date(currentData.timestamp) - new Date(previousData.timestamp)) / 1000; // seconds

    if (timeDiff > 60) return events; // Skip if time gap is too large

    const speedDiff = currentData.location.speed - previousData.location.speed;
    const acceleration = speedDiff / timeDiff; // m/s²

    // Harsh acceleration (> 2.5 m/s²)
    if (acceleration > 2.5) {
      events.push({
        location: currentData.location,
        type: 'harsh_acceleration',
        acceleration: acceleration,
        severity: acceleration > 4 ? 'critical' : 'warning'
      });
    }

    // Harsh braking (< -2.5 m/s²)
    if (acceleration < -2.5) {
      events.push({
        location: currentData.location,
        type: 'harsh_braking',
        deceleration: Math.abs(acceleration),
        severity: acceleration < -4 ? 'critical' : 'warning'
      });
    }

    // Sharp turns (heading change > 30 degrees in short time)
    if (previousData.location.heading && currentData.location.heading) {
      let headingDiff = Math.abs(currentData.location.heading - previousData.location.heading);
      if (headingDiff > 180) headingDiff = 360 - headingDiff;
      
      const turnRate = headingDiff / timeDiff; // degrees per second
      
      if (turnRate > 30 && currentData.location.speed > 10) { // Only at speed
        events.push({
          location: currentData.location,
          type: 'sharp_turn',
          turn_rate: turnRate,
          severity: turnRate > 60 ? 'critical' : 'warning'
        });
      }
    }

    return events;
  }

  // ==================== TRIP MANAGEMENT ====================

  /**
   * Get current trip information
   */
  async getCurrentTripInfo(vehicleId) {
    try {
      // Get recent ignition events
      const cursor = await r.table(TABLES.vehicle_events)
        .getAll(vehicleId, { index: 'vehicle_id' })
        .filter(r.row('event_type').match('start|stop'))
        .orderBy(r.desc('timestamp'))
        .limit(2)
        .run(this.db.connection);
      
      const events = await cursor.toArray();
      
      if (events.length === 0) return null;
      
      const latestEvent = events[0];
      
      if (latestEvent.event_type === 'start') {
        // Vehicle is on a trip
        const tripStartTime = new Date(latestEvent.timestamp);
        const now = new Date();
        const duration = Math.floor((now - tripStartTime) / 1000); // seconds

        // Get trip data since start
        const tripData = await this.dataService.getDeviceDataInRange(
          latestEvent.device_id,
          tripStartTime,
          now
        );

        const tripDistance = this.calculateTripDistance(tripData);
        const maxSpeed = Math.max(...tripData.map(d => d.location.speed || 0));

        return {
          status: 'active',
          start_time: tripStartTime,
          duration: duration,
          distance: tripDistance,
          max_speed: maxSpeed,
          start_location: latestEvent.event_data.location,
          data_points: tripData.length
        };
      } else {
        // Vehicle is stopped
        return {
          status: 'stopped',
          last_trip_end: new Date(latestEvent.timestamp),
          stop_location: latestEvent.event_data.location
        };
      }
    } catch (error) {
      console.error('Error getting current trip info:', error);
      return null;
    }
  }

  /**
   * Calculate trip distance from data points
   */
  calculateTripDistance(tripData) {
    let totalDistance = 0;
    
    for (let i = 1; i < tripData.length; i++) {
      const prev = tripData[i - 1];
      const curr = tripData[i];
      
      const distance = this.calculateDistance(
        prev.location.latitude,
        prev.location.longitude,
        curr.location.latitude,
        curr.location.longitude
      );
      
      totalDistance += distance;
    }
    
    return Math.round(totalDistance); // meters
  }

  // ==================== STATUS DETERMINATION ====================

  /**
   * Determine vehicle status from latest data and events
   */
  determineVehicleStatus(latestData, recentEvents) {
    if (!latestData) return 'offline';
    
    const now = new Date();
    const lastUpdate = new Date(latestData.timestamp);
    const minutesSinceUpdate = (now - lastUpdate) / (1000 * 60);
    
    if (minutesSinceUpdate > 30) return 'offline';
    
    const ignitionOn = latestData.vehicle_data?.ignition_status;
    const speed = latestData.location?.speed || 0;
    
    if (!ignitionOn) return 'stopped';
    if (speed > 5) return 'moving';
    
    // Check for idle timeout
    const idleTime = this.calculateIdleTime(recentEvents);
    if (idleTime > 300) return 'idle'; // 5 minutes
    
    return 'stopped';
  }

  /**
   * Determine vehicle status from single data point
   */
  determineVehicleStatusFromData(deviceData) {
    const ignitionOn = deviceData.vehicle_data?.ignition_status;
    const speed = deviceData.location?.speed || 0;
    
    if (!ignitionOn) return 'stopped';
    if (speed > 5) return 'moving';
    return 'idle';
  }

  /**
   * Calculate idle time from recent events
   */
  calculateIdleTime(recentEvents) {
    const stopEvent = recentEvents.find(e => 
      e.event_type === 'stop' || 
      (e.event_type === 'start' && e.event_data.speed < 5)
    );
    
    if (!stopEvent) return 0;
    
    return Math.floor((new Date() - new Date(stopEvent.timestamp)) / 1000);
  }

  // ==================== DEVICE STATUS ====================

  /**
   * Get comprehensive device status
   */
  async getDeviceStatus(deviceId) {
    try {
      const [device, latestData] = await Promise.all([
        this.dataService.getDeviceById(deviceId),
        this.dataService.getLatestDeviceData(deviceId)
      ]);

      if (!device) return null;

      const now = new Date();
      const lastHeartbeat = device.last_heartbeat ? new Date(device.last_heartbeat) : null;
      const lastDataUpdate = latestData ? new Date(latestData.timestamp) : null;

      return {
        device_id: deviceId,
        status: device.status,
        online: lastHeartbeat && (now - lastHeartbeat) < 5 * 60 * 1000, // 5 minutes
        last_heartbeat: lastHeartbeat,
        last_data_update: lastDataUpdate,
        battery_level: latestData?.device_status?.battery_level || null,
        signal_strength: latestData?.device_status?.signal_strength || null,
        gps_satellites: latestData?.device_status?.gps_satellites || null,
        firmware_version: device.firmware_version,
        configuration: device.configuration
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      return null;
    }
  }

  // ==================== ALERTS ====================

  /**
   * Check for alerts based on current data
   */
  async checkForAlerts(vehicle, deviceData) {
    const alerts = [];

    // Low battery alert
    if (deviceData.device_status?.battery_level < 20) {
      alerts.push({
        type: 'low_battery',
        severity: deviceData.device_status.battery_level < 10 ? 'critical' : 'warning',
        message: `Device battery low: ${deviceData.device_status.battery_level}%`
      });
    }

    // Poor GPS signal
    if (deviceData.device_status?.gps_satellites < 4) {
      alerts.push({
        type: 'poor_gps',
        severity: 'warning',
        message: `Poor GPS signal: ${deviceData.device_status.gps_satellites} satellites`
      });
    }

    // Maintenance alerts
    if (vehicle.maintenance?.next_service_due) {
      const serviceDue = new Date(vehicle.maintenance.next_service_due);
      const now = new Date();
      const daysUntilService = Math.ceil((serviceDue - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilService <= 7 && daysUntilService >= 0) {
        alerts.push({
          type: 'maintenance_due',
          severity: daysUntilService <= 3 ? 'warning' : 'info',
          message: `Service due in ${daysUntilService} days`
        });
      }
    }

    return alerts;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check idle timeout
   */
  async checkIdleTimeout(vehicle, timestamp) {
    try {
      const cursor = await r.table(TABLES.vehicle_events)
        .getAll(vehicle.id, { index: 'vehicle_id' })
        .filter({ event_type: 'idle_start' })
        .orderBy(r.desc('timestamp'))
        .limit(1)
        .run(this.db.connection);
      
      const events = await cursor.toArray();
      const lastIdleStart = events[0];
      
      if (!lastIdleStart) {
        // Start idle timer
        await this.createVehicleEvent(vehicle, 'idle_start', {
          location: { /* current location */ },
          timestamp: timestamp
        });
      } else {
        const idleTime = (new Date(timestamp) - new Date(lastIdleStart.timestamp)) / 1000;
        
        if (idleTime >= vehicle.alerts_config.idle_timeout) {
          await this.createVehicleEvent(vehicle, 'idle_timeout', {
            location: { /* current location */ },
            idle_duration: idleTime,
            timestamp: timestamp
          });
        }
      }
    } catch (error) {
      console.error('Error checking idle timeout:', error);
    }
  }

  /**
   * Cache management for geofence status
   */
  async wasVehicleInGeofence(vehicleId, geofenceId) {
    // Implementation depends on your caching strategy
    // This could be Redis, in-memory cache, or database query
    const cacheKey = `${vehicleId}_${geofenceId}`;
    return this.geofences.get(cacheKey) || false;
  }

  async updateGeofenceStatus(vehicleId, geofenceId, isInside) {
    const cacheKey = `${vehicleId}_${geofenceId}`;
    this.geofences.set(cacheKey, isInside);
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup method to close all active subscriptions
   */
  async cleanup() {
    console.log(`Cleaning up ${this.activeSubscriptions.size} active subscriptions`);
    
    for (const [subscriptionId, cursor] of this.activeSubscriptions) {
      try {
        await cursor.close();
      } catch (error) {
        console.error(`Error closing subscription ${subscriptionId}:`, error);
      }
    }
    
    this.activeSubscriptions.clear();
    this.geofences.clear();
  }
}

export default new VehicleTrackingService();