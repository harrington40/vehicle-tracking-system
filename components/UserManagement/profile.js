import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import DocumentRepository from '../repositories/DocumentRepository.js';
import UserManagement from '../../app/user-management.js';
import BillingService from './BillingService.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import { 
  ManagerProfileSchema,
  DriverAssignmentSchema,
  TeamManagementSchema 
} from '../schemas/DocumentSchemas.js';

class ManagerProfile extends EventEmitter {
  constructor() {
    super();
    this.repository = DocumentRepository;
    this.userManagement = UserManagement;
    this.billingService = BillingService;
    
    // Manager role hierarchy
    this.roleHierarchy = {
      'owner': 5,
      'admin': 4,
      'manager': 3,
      'supervisor': 2,
      'driver': 1,
      'viewer': 0
    };

    // Manager permissions
    this.managerPermissions = {
      'manager': {
        can_manage_drivers: true,
        can_assign_vehicles: true,
        can_view_reports: true,
        can_create_geofences: true,
        can_manage_alerts: true,
        can_view_billing: false,
        max_subordinates: 50
      },
      'supervisor': {
        can_manage_drivers: true,
        can_assign_vehicles: true,
        can_view_reports: true,
        can_create_geofences: false,
        can_manage_alerts: true,
        can_view_billing: false,
        max_subordinates: 15
      }
    };
  }

  // ==================== MANAGER PROFILE MANAGEMENT ====================

  /**
   * Create manager profile with extended information
   */
  async createManagerProfile(userId, profileData, createdBy) {
    try {
      // Validate input data
      const { error, value } = ManagerProfileSchema.validate(profileData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Get user and validate they can be a manager
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!['manager', 'supervisor', 'admin', 'owner'].includes(user.role)) {
        throw new Error('User role cannot be assigned manager profile');
      }

      // Check if profile already exists
      const existingProfile = await this.getManagerProfile(userId);
      if (existingProfile) {
        throw new Error('Manager profile already exists for this user');
      }

      // Validate creator permissions
      await this.validateManagerPermissions(createdBy, user.customer_id, 'create_manager');

      // Create manager profile
      const managerProfile = {
        id: uuidv4(),
        user_id: userId,
        customer_id: user.customer_id,
        profile_data: {
          department: value.department || 'Operations',
          position: value.position || user.role,
          employee_id: value.employee_id,
          hire_date: value.hire_date || new Date(),
          location: value.location,
          phone_work: value.phone_work,
          phone_mobile: value.phone_mobile,
          emergency_contact: value.emergency_contact,
          bio: value.bio,
          skills: value.skills || [],
          certifications: value.certifications || [],
          social_links: value.social_links || {}
        },
        management_data: {
          team_name: value.team_name,
          team_description: value.team_description,
          assigned_territories: value.assigned_territories || [],
          subordinates: [],
          managed_vehicles: [],
          performance_metrics: {
            team_size: 0,
            vehicles_managed: 0,
            efficiency_score: 0,
            safety_score: 100,
            last_updated: new Date()
          }
        },
        permissions: this.managerPermissions[user.role] || this.managerPermissions['manager'],
        settings: {
          notification_preferences: {
            email_alerts: true,
            sms_alerts: false,
            dashboard_notifications: true,
            alert_types: ['speed_violation', 'geofence_breach', 'maintenance_due']
          },
          dashboard_layout: value.dashboard_layout || 'default',
          timezone: value.timezone || 'UTC',
          language: value.language || 'en'
        },
        status: 'active',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date()
      };

      const createdProfile = await this.repository.create('manager_profiles', managerProfile);

      // Update user with manager-specific permissions
      await this.updateUserManagerPermissions(userId);

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: createdBy,
        action: 'manager_profile_created',
        resource_type: 'manager_profile',
        resource_id: createdProfile.id,
        details: {
          manager_user_id: userId,
          manager_email: user.email,
          department: value.department
        }
      });

      // Create welcome notification for manager
      await this.createManagerWelcomeNotification(user, createdProfile);

      // Emit event
      this.emit('managerProfileCreated', {
        profile: createdProfile,
        user,
        createdBy
      });

      return {
        profile: this.sanitizeManagerProfile(createdProfile),
        user: this.userManagement.sanitizeUser(user)
      };

    } catch (error) {
      console.error('Error creating manager profile:', error);
      throw error;
    }
  }

  /**
   * Get complete manager profile with user data
   */
  async getManagerProfile(userId, includeSubordinates = true) {
    try {
      const profiles = await this.repository.findByIndex('manager_profiles', 'user_id', userId);
      
      if (profiles.length === 0) {
        return null;
      }

      const profile = profiles[0];
      const user = await this.repository.findUserById(userId);
      const customer = await this.repository.findCustomerById(profile.customer_id);

      let subordinates = [];
      let managedVehicles = [];
      
      if (includeSubordinates) {
        // Get subordinate users
        if (profile.management_data.subordinates.length > 0) {
          subordinates = await this.getSubordinateDetails(profile.management_data.subordinates);
        }

        // Get managed vehicles
        if (profile.management_data.managed_vehicles.length > 0) {
          managedVehicles = await this.getManagedVehicleDetails(profile.management_data.managed_vehicles);
        }
      }

      // Calculate current performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(profile);

      return {
        profile: this.sanitizeManagerProfile(profile),
        user: this.userManagement.sanitizeUser(user),
        customer: this.sanitizeCustomer(customer),
        subordinates,
        managed_vehicles: managedVehicles,
        performance_metrics: performanceMetrics,
        team_statistics: await this.getTeamStatistics(profile.id)
      };

    } catch (error) {
      console.error('Error getting manager profile:', error);
      throw error;
    }
  }

  /**
   * Update manager profile
   */
  async updateManagerProfile(userId, updates, updatedBy) {
    try {
      const profile = await this.getManagerProfile(userId, false);
      if (!profile) {
        throw new Error('Manager profile not found');
      }

      // Validate permissions
      await this.validateManagerPermissions(updatedBy, profile.profile.customer_id, 'update_manager');

      // Validate updates
      const { error, value } = ManagerProfileSchema.validate(updates, { allowUnknown: true });
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Prepare update data
      const updateData = {
        ...value,
        updated_at: new Date()
      };

      // Update profile
      const updatedProfile = await this.repository.update('manager_profiles', profile.profile.id, updateData);

      // Create audit log
      await this.createAuditLog({
        customer_id: profile.profile.customer_id,
        user_id: updatedBy,
        action: 'manager_profile_updated',
        resource_type: 'manager_profile',
        resource_id: profile.profile.id,
        details: {
          updated_fields: Object.keys(updates),
          manager_user_id: userId
        }
      });

      // Emit event
      this.emit('managerProfileUpdated', {
        profile: updatedProfile,
        previousData: profile.profile,
        updatedBy
      });

      return {
        profile: this.sanitizeManagerProfile(updatedProfile)
      };

    } catch (error) {
      console.error('Error updating manager profile:', error);
      throw error;
    }
  }

  // ==================== TEAM MANAGEMENT ====================

  /**
   * Assign driver to manager
   */
  async assignDriverToManager(managerId, driverId, assignedBy, assignmentData = {}) {
    try {
      // Validate assignment data
      const { error, value } = DriverAssignmentSchema.validate({
        manager_id: managerId,
        driver_id: driverId,
        ...assignmentData
      });
      
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Get manager and driver
      const managerProfile = await this.getManagerProfile(managerId, false);
      const driverUser = await this.repository.findUserById(driverId);
      
      if (!managerProfile) {
        throw new Error('Manager profile not found');
      }
      
      if (!driverUser || driverUser.role !== 'driver') {
        throw new Error('Driver user not found or invalid role');
      }

      // Check if same customer
      if (managerProfile.profile.customer_id !== driverUser.customer_id) {
        throw new Error('Manager and driver must belong to same customer');
      }

      // Check manager's subordinate limit
      const currentSubordinates = managerProfile.profile.management_data.subordinates.length;
      const maxSubordinates = managerProfile.profile.permissions.max_subordinates;
      
      if (currentSubordinates >= maxSubordinates) {
        throw new Error(`Manager has reached maximum subordinate limit (${maxSubordinates})`);
      }

      // Check if driver is already assigned to this manager
      if (managerProfile.profile.management_data.subordinates.includes(driverId)) {
        throw new Error('Driver is already assigned to this manager');
      }

      // Create assignment record
      const assignment = {
        id: uuidv4(),
        manager_id: managerId,
        driver_id: driverId,
        customer_id: driverUser.customer_id,
        assignment_type: value.assignment_type || 'permanent',
        assigned_date: new Date(),
        assigned_by: assignedBy,
        territory: value.territory,
        shift_schedule: value.shift_schedule,
        responsibilities: value.responsibilities || [],
        performance_targets: value.performance_targets || {},
        status: 'active',
        notes: value.notes,
        created_at: new Date()
      };

      const createdAssignment = await this.repository.create('driver_assignments', assignment);

      // Update manager profile - add to subordinates
      const updatedSubordinates = [...managerProfile.profile.management_data.subordinates, driverId];
      await this.repository.update('manager_profiles', managerProfile.profile.id, {
        'management_data.subordinates': updatedSubordinates,
        'management_data.performance_metrics.team_size': updatedSubordinates.length,
        updated_at: new Date()
      });

      // Update driver user - set manager reference
      await this.repository.updateUser(driverId, {
        manager_id: managerId,
        reporting_structure: {
          direct_manager: managerId,
          assignment_id: createdAssignment.id,
          assigned_date: new Date()
        }
      });

      // Create notifications
      await this.createAssignmentNotifications(managerProfile.user, driverUser, createdAssignment);

      // Create audit log
      await this.createAuditLog({
        customer_id: driverUser.customer_id,
        user_id: assignedBy,
        action: 'driver_assigned',
        resource_type: 'driver_assignment',
        resource_id: createdAssignment.id,
        details: {
          manager_id: managerId,
          driver_id: driverId,
          assignment_type: value.assignment_type
        }
      });

      // Emit event
      this.emit('driverAssigned', {
        assignment: createdAssignment,
        manager: managerProfile.user,
        driver: driverUser,
        assignedBy
      });

      return {
        assignment: createdAssignment,
        manager: this.sanitizeManagerProfile(managerProfile.profile),
        driver: this.userManagement.sanitizeUser(driverUser)
      };

    } catch (error) {
      console.error('Error assigning driver to manager:', error);
      throw error;
    }
  }

  /**
   * Remove driver from manager
   */
  async removeDriverFromManager(managerId, driverId, removedBy, reason = 'Reassignment') {
    try {
      const managerProfile = await this.getManagerProfile(managerId, false);
      const driverUser = await this.repository.findUserById(driverId);
      
      if (!managerProfile || !driverUser) {
        throw new Error('Manager or driver not found');
      }

      // Check if driver is assigned to this manager
      if (!managerProfile.profile.management_data.subordinates.includes(driverId)) {
        throw new Error('Driver is not assigned to this manager');
      }

      // Get assignment record
      const assignments = await this.repository.findByIndex('driver_assignments', 'driver_id', driverId);
      const activeAssignment = assignments.find(a => a.manager_id === managerId && a.status === 'active');
      
      if (activeAssignment) {
        // Update assignment status
        await this.repository.update('driver_assignments', activeAssignment.id, {
          status: 'inactive',
          end_date: new Date(),
          end_reason: reason,
          removed_by: removedBy
        });
      }

      // Update manager profile - remove from subordinates
      const updatedSubordinates = managerProfile.profile.management_data.subordinates.filter(id => id !== driverId);
      await this.repository.update('manager_profiles', managerProfile.profile.id, {
        'management_data.subordinates': updatedSubordinates,
        'management_data.performance_metrics.team_size': updatedSubordinates.length,
        updated_at: new Date()
      });

      // Update driver user - remove manager reference
      await this.repository.updateUser(driverId, {
        manager_id: null,
        reporting_structure: null
      });

      // Create audit log
      await this.createAuditLog({
        customer_id: driverUser.customer_id,
        user_id: removedBy,
        action: 'driver_removed',
        resource_type: 'driver_assignment',
        resource_id: activeAssignment?.id,
        details: {
          manager_id: managerId,
          driver_id: driverId,
          reason
        }
      });

      // Emit event
      this.emit('driverRemoved', {
        manager: managerProfile.user,
        driver: driverUser,
        reason,
        removedBy
      });

      return { success: true };

    } catch (error) {
      console.error('Error removing driver from manager:', error);
      throw error;
    }
  }

  /**
   * Assign vehicle to manager
   */
  async assignVehicleToManager(managerId, vehicleId, assignedBy) {
    try {
      const managerProfile = await this.getManagerProfile(managerId, false);
      const vehicle = await this.repository.findVehicleById(vehicleId);
      
      if (!managerProfile || !vehicle) {
        throw new Error('Manager or vehicle not found');
      }

      // Check if same customer
      if (managerProfile.profile.customer_id !== vehicle.customer_id) {
        throw new Error('Manager and vehicle must belong to same customer');
      }

      // Check if vehicle is already assigned to this manager
      if (managerProfile.profile.management_data.managed_vehicles.includes(vehicleId)) {
        throw new Error('Vehicle is already assigned to this manager');
      }

      // Update manager profile
      const updatedVehicles = [...managerProfile.profile.management_data.managed_vehicles, vehicleId];
      await this.repository.update('manager_profiles', managerProfile.profile.id, {
        'management_data.managed_vehicles': updatedVehicles,
        'management_data.performance_metrics.vehicles_managed': updatedVehicles.length,
        updated_at: new Date()
      });

      // Update vehicle with manager reference
      await this.repository.updateVehicle(vehicleId, {
        manager_id: managerId,
        managed_by: managerProfile.user.email
      });

      // Create audit log
      await this.createAuditLog({
        customer_id: vehicle.customer_id,
        user_id: assignedBy,
        action: 'vehicle_assigned_to_manager',
        resource_type: 'vehicle',
        resource_id: vehicleId,
        details: {
          manager_id: managerId,
          vehicle_plate: vehicle.vehicle_info?.license_plate
        }
      });

      // Emit event
      this.emit('vehicleAssignedToManager', {
        manager: managerProfile.user,
        vehicle,
        assignedBy
      });

      return { success: true };

    } catch (error) {
      console.error('Error assigning vehicle to manager:', error);
      throw error;
    }
  }

  // ==================== REPORTING AND ANALYTICS ====================

  /**
   * Calculate manager performance metrics
   */
  async calculatePerformanceMetrics(profile) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get team size
      const teamSize = profile.management_data.subordinates.length;
      
      // Get managed vehicles count
      const vehiclesManaged = profile.management_data.managed_vehicles.length;

      // Calculate efficiency score based on team performance
      let efficiencyScore = 0;
      if (teamSize > 0) {
        // This would be calculated based on actual metrics like:
        // - On-time deliveries
        // - Fuel efficiency
        // - Route optimization
        // For now, we'll use a placeholder calculation
        efficiencyScore = Math.min(100, 70 + (teamSize * 2) + (vehiclesManaged * 1.5));
      }

      // Calculate safety score based on violations and incidents
      let safetyScore = 100;
      if (profile.management_data.subordinates.length > 0) {
        // This would subtract points for safety violations
        // For now, we'll use a placeholder
        safetyScore = Math.max(0, 100 - (teamSize * 0.5));
      }

      const metrics = {
        team_size: teamSize,
        vehicles_managed: vehiclesManaged,
        efficiency_score: Math.round(efficiencyScore),
        safety_score: Math.round(safetyScore),
        subordinates_performance: await this.getSubordinatesPerformance(profile.management_data.subordinates),
        vehicle_utilization: await this.getVehicleUtilization(profile.management_data.managed_vehicles),
        last_updated: new Date()
      };

      // Update profile with calculated metrics
      await this.repository.update('manager_profiles', profile.id, {
        'management_data.performance_metrics': metrics,
        updated_at: new Date()
      });

      return metrics;

    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return profile.management_data.performance_metrics;
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStatistics(profileId) {
    try {
      const profile = await this.repository.findById('manager_profiles', profileId);
      if (!profile) return {};

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const subordinateIds = profile.management_data.subordinates;
      const vehicleIds = profile.management_data.managed_vehicles;

      // Get statistics for different time periods
      const [dailyStats, weeklyStats, monthlyStats] = await Promise.all([
        this.getTeamStatsForPeriod(subordinateIds, vehicleIds, todayStart, now),
        this.getTeamStatsForPeriod(subordinateIds, vehicleIds, weekStart, now),
        this.getTeamStatsForPeriod(subordinateIds, vehicleIds, monthStart, now)
      ]);

      return {
        daily: dailyStats,
        weekly: weeklyStats,
        monthly: monthlyStats,
        team_overview: {
          total_drivers: subordinateIds.length,
          total_vehicles: vehicleIds.length,
          active_drivers: await this.getActiveDriveCount(subordinateIds),
          vehicles_in_use: await this.getActiveVehicleCount(vehicleIds)
        }
      };

    } catch (error) {
      console.error('Error getting team statistics:', error);
      return {};
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get subordinate user details
   */
  async getSubordinateDetails(subordinateIds) {
    try {
      const subordinates = [];
      
      for (const userId of subordinateIds) {
        const user = await this.repository.findUserById(userId);
        if (user) {
          // Get assignment details
          const assignments = await this.repository.findByIndex('driver_assignments', 'driver_id', userId);
          const activeAssignment = assignments.find(a => a.status === 'active');
          
          subordinates.push({
            user: this.userManagement.sanitizeUser(user),
            assignment: activeAssignment,
            status: user.is_active ? 'active' : 'inactive',
            last_activity: await this.getDriverLastActivity(userId)
          });
        }
      }
      
      return subordinates;
    } catch (error) {
      console.error('Error getting subordinate details:', error);
      return [];
    }
  }

  /**
   * Get managed vehicle details
   */
  async getManagedVehicleDetails(vehicleIds) {
    try {
      const vehicles = [];
      
      for (const vehicleId of vehicleIds) {
        const vehicle = await this.repository.findVehicleById(vehicleId);
        if (vehicle) {
          vehicles.push({
            ...vehicle,
            current_location: await this.getVehicleCurrentLocation(vehicleId),
            last_update: await this.getVehicleLastUpdate(vehicleId),
            status: vehicle.status
          });
        }
      }
      
      return vehicles;
    } catch (error) {
      console.error('Error getting managed vehicle details:', error);
      return [];
    }
  }

  /**
   * Validate manager permissions
   */
  async validateManagerPermissions(userId, customerId, action) {
    const user = await this.repository.findUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.customer_id !== customerId) {
      throw new Error('Access denied: Different customer');
    }

    const roleLevel = this.roleHierarchy[user.role] || 0;
    
    const requiredLevels = {
      'create_manager': 3, // manager or higher
      'update_manager': 3,
      'delete_manager': 4, // admin or higher
      'assign_driver': 2,  // supervisor or higher
      'manage_vehicles': 2
    };

    if (roleLevel < (requiredLevels[action] || 0)) {
      throw new Error('Insufficient permissions for this action');
    }

    return true;
  }

  /**
   * Update user with manager-specific permissions
   */
  async updateUserManagerPermissions(userId) {
    try {
      const user = await this.repository.findUserById(userId);
      const permissions = this.managerPermissions[user.role] || {};

      await this.repository.updateUser(userId, {
        permissions: {
          ...user.permissions,
          ...permissions,
          is_manager: true
        },
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating user manager permissions:', error);
    }
  }

  /**
   * Create manager welcome notification
   */
  async createManagerWelcomeNotification(user, profile) {
    try {
      const notification = {
        id: uuidv4(),
        customer_id: user.customer_id,
        user_id: user.id,
        type: 'manager_welcome',
        category: 'system_update',
        title: 'Manager Profile Created',
        message: `Welcome to your management dashboard! Your manager profile has been created. You can now manage your team, assign drivers, and monitor vehicle performance.`,
        severity: 'info',
        read: false,
        archived: false,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await this.repository.createNotification(notification);
    } catch (error) {
      console.error('Error creating manager welcome notification:', error);
    }
  }

  /**
   * Create assignment notifications
   */
  async createAssignmentNotifications(manager, driver, assignment) {
    try {
      // Notification for manager
      const managerNotification = {
        id: uuidv4(),
        customer_id: manager.customer_id,
        user_id: manager.id,
        type: 'driver_assigned',
        category: 'team_management',
        title: 'Driver Assigned to Your Team',
        message: `${driver.first_name} ${driver.last_name} has been assigned to your team.`,
        severity: 'info',
        read: false,
        archived: false,
        created_at: new Date()
      };

      // Notification for driver
      const driverNotification = {
        id: uuidv4(),
        customer_id: driver.customer_id,
        user_id: driver.id,
        type: 'assigned_to_manager',
        category: 'team_management',
        title: 'Assigned to Manager',
        message: `You have been assigned to ${manager.first_name} ${manager.last_name}'s team.`,
        severity: 'info',
        read: false,
        archived: false,
        created_at: new Date()
      };

      await Promise.all([
        this.repository.createNotification(managerNotification),
        this.repository.createNotification(driverNotification)
      ]);
    } catch (error) {
      console.error('Error creating assignment notifications:', error);
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(logData) {
    try {
      const auditLog = {
        id: uuidv4(),
        timestamp: new Date(),
        ...logData
      };

      await this.repository.create(TABLES.audit_logs, auditLog);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  // ==================== PLACEHOLDER METHODS ====================
  
  // These methods would connect to your actual data sources
  async getSubordinatesPerformance(subordinateIds) {
    // Calculate performance metrics for subordinates
    return subordinateIds.map(id => ({
      user_id: id,
      efficiency_score: Math.floor(Math.random() * 100),
      safety_score: Math.floor(Math.random() * 100),
      completion_rate: Math.floor(Math.random() * 100)
    }));
  }

  async getVehicleUtilization(vehicleIds) {
    // Calculate vehicle utilization metrics
    return vehicleIds.map(id => ({
      vehicle_id: id,
      utilization_rate: Math.floor(Math.random() * 100),
      fuel_efficiency: Math.floor(Math.random() * 100),
      maintenance_score: Math.floor(Math.random() * 100)
    }));
  }

  async getTeamStatsForPeriod(subordinateIds, vehicleIds, startDate, endDate) {
    // This would query actual data for the time period
    return {
      total_trips: Math.floor(Math.random() * 100),
      total_distance: Math.floor(Math.random() * 10000),
      fuel_consumed: Math.floor(Math.random() * 1000),
      incidents: Math.floor(Math.random() * 10),
      efficiency_rating: Math.floor(Math.random() * 100)
    };
  }

  async getActiveDriveCount(subordinateIds) {
    // Count currently active drivers
    return Math.floor(subordinateIds.length * 0.8);
  }

  async getActiveVehicleCount(vehicleIds) {
    // Count currently active vehicles
    return Math.floor(vehicleIds.length * 0.9);
  }

  async getDriverLastActivity(userId) {
    // Get driver's last activity timestamp
    return new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
  }

  async getVehicleCurrentLocation(vehicleId) {
    // Get vehicle's current location
    return {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      address: "Sample Address",
      timestamp: new Date()
    };
  }

  async getVehicleLastUpdate(vehicleId) {
    // Get vehicle's last data update
    return new Date(Date.now() - Math.random() * 60 * 60 * 1000);
  }

  // ==================== SANITIZATION METHODS ====================

  /**
   * Sanitize manager profile data
   */
  sanitizeManagerProfile(profile) {
    if (!profile) return null;

    // Remove any sensitive data if needed
    return profile;
  }

  /**
   * Sanitize customer data
   */
  sanitizeCustomer(customer) {
    if (!customer) return null;
    return customer;
  }

  // ==================== GETTER METHODS ====================

  /**
   * Get managers by customer
   */
  async getManagersByCustomer(customerId, options = {}) {
    try {
      const {
        role,
        status = 'active',
        includeSubordinates = false,
        page = 1,
        limit = 50
      } = options;

      let queryOptions = {
        orderBy: 'created_at',
        desc: true,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const profiles = await this.repository.findByIndex('manager_profiles', 'customer_id', customerId);

      // Filter by status
      let filteredProfiles = profiles.filter(p => p.status === status);

      // Get user data for each profile
      const managersWithDetails = await Promise.all(
        filteredProfiles.map(async (profile) => {
          const user = await this.repository.findUserById(profile.user_id);
          
          if (role && user.role !== role) {
            return null;
          }

          let subordinates = [];
          if (includeSubordinates) {
            subordinates = await this.getSubordinateDetails(profile.management_data.subordinates);
          }

          return {
            profile: this.sanitizeManagerProfile(profile),
            user: this.userManagement.sanitizeUser(user),
            subordinates,
            team_size: profile.management_data.subordinates.length,
            vehicles_managed: profile.management_data.managed_vehicles.length
          };
        })
      );

      return {
        managers: managersWithDetails.filter(m => m !== null),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: managersWithDetails.filter(m => m !== null).length
        }
      };

    } catch (error) {
      console.error('Error getting managers by customer:', error);
      throw error;
    }
  }

  /**
   * Search managers
   */
  async searchManagers(customerId, searchTerm, options = {}) {
    try {
      const managers = await this.getManagersByCustomer(customerId, {
        ...options,
        includeSubordinates: false
      });

      const searchResults = managers.managers.filter(manager => {
        const user = manager.user;
        const profile = manager.profile;
        const searchLower = searchTerm.toLowerCase();

        return (
          user.first_name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          profile.profile_data.department?.toLowerCase().includes(searchLower) ||
          profile.profile_data.position?.toLowerCase().includes(searchLower) ||
          profile.management_data.team_name?.toLowerCase().includes(searchLower)
        );
      });

      return {
        managers: searchResults,
        total: searchResults.length,
        searchTerm
      };

    } catch (error) {
      console.error('Error searching managers:', error);
      throw error;
    }
  }
}

export default new ManagerProfile();

// Also export the class for testing
export { ManagerProfile };