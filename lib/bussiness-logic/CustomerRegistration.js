import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import DocumentRepository from '../repositories/DocumentRepository.js';
import UserManagement from './UserManagement.js';
import { 
  CustomerValidationSchema,
  UserValidationSchema
} from '../schemas/DocumentSchemas.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import { EventEmitter } from 'events';
import Stripe from 'stripe';

class CustomerRegistration extends EventEmitter {
  constructor() {
    super();
    this.repository = DocumentRepository;
    this.userManagement = UserManagement;
    
    // Initialize Stripe if configured
    this.stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    
    // Registration settings
    this.settings = {
      trialPeriodDays: parseInt(process.env.TRIAL_PERIOD_DAYS) || 14,
      maxUsersPerCustomer: parseInt(process.env.MAX_USERS_PER_CUSTOMER) || 100,
      maxVehiclesPerCustomer: parseInt(process.env.MAX_VEHICLES_PER_CUSTOMER) || 1000,
      requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== 'false',
      autoApproveRegistrations: process.env.AUTO_APPROVE_REGISTRATIONS === 'true',
      defaultPlan: process.env.DEFAULT_PLAN || 'starter'
    };

    // Setup event listeners
    this.setupEventListeners();
  }

  // ==================== CUSTOMER REGISTRATION ====================

  /**
   * Complete customer registration with owner user
   */
  async registerCustomer(registrationData, options = {}) {
    try {
      console.log('🔄 Starting customer registration process...');

      // Validate input data
      await this.validateRegistrationData(registrationData);

      // Check for duplicate registrations
      await this.checkDuplicateRegistration(registrationData);

      // Create customer record
      const customer = await this.createCustomer(registrationData.customer, options);

      // Create owner user account
      const ownerUser = await this.createOwnerUser(customer, registrationData.owner, options);

      // Setup subscription (trial or paid)
      const subscription = await this.setupSubscription(customer, registrationData.subscription, options);

      // Create initial API key
      const apiKey = await this.createInitialApiKey(customer, ownerUser);

      // Setup default system settings
      await this.setupDefaultSettings(customer);

      // Create welcome notification
      await this.createWelcomeNotification(customer, ownerUser);

      // Log registration
      await this.logRegistration(customer, ownerUser, options);

      const result = {
        customer: this.sanitizeCustomer(customer),
        owner: this.userManagement.sanitizeUser(ownerUser),
        subscription,
        apiKey: this.sanitizeApiKey(apiKey),
        needsEmailVerification: !options.skipEmailVerification && this.settings.requireEmailVerification,
        needsApproval: !this.settings.autoApproveRegistrations
      };

      // Emit registration event
      this.emit('customerRegistered', result);

      // Send welcome emails
      if (!options.skipEmails) {
        await this.sendWelcomeEmails(customer, ownerUser, subscription);
      }

      console.log('✅ Customer registration completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Customer registration failed:', error);
      
      // Emit error event
      this.emit('registrationError', {
        error: error.message,
        data: registrationData,
        timestamp: new Date()
      });

      throw error;
    }
  }

  /**
   * Register customer from invite
   */
  async registerFromInvite(inviteToken, registrationData, options = {}) {
    try {
      // Validate invite token
      const invite = await this.validateInviteToken(inviteToken);

      // Merge invite data with registration data
      const mergedData = {
        customer: {
          ...registrationData.customer,
          business_name: invite.business_name || registrationData.customer.business_name,
          customer_type: invite.customer_type || registrationData.customer.customer_type,
          invited_by: invite.invited_by
        },
        owner: {
          ...registrationData.owner,
          email: invite.email,
          role: 'owner'
        },
        subscription: {
          plan_id: invite.plan_id || this.settings.defaultPlan,
          ...registrationData.subscription
        }
      };

      // Register customer
      const result = await this.registerCustomer(mergedData, {
        ...options,
        inviteToken,
        skipEmailVerification: true // Email already validated through invite
      });

      // Mark invite as used
      await this.markInviteUsed(inviteToken, result.customer.id);

      return result;

    } catch (error) {
      console.error('Error registering from invite:', error);
      throw error;
    }
  }

  /**
   * Complete registration approval process
   */
  async approveRegistration(customerId, approverId, options = {}) {
    try {
      // Get customer
      const customer = await this.repository.findCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      if (customer.status === 'active') {
        return { customer, message: 'Customer is already active' };
      }

      if (customer.status !== 'pending_approval') {
        throw new Error(`Cannot approve customer with status: ${customer.status}`);
      }

      // Update customer status
      const approvedCustomer = await this.repository.updateCustomer(customerId, {
        status: 'active',
        approved_at: new Date(),
        approved_by: approverId,
        approval_notes: options.notes
      });

      // Activate subscription if exists
      const subscription = await this.repository.findActiveSubscription(customerId);
      if (subscription && subscription.status === 'pending_approval') {
        await this.repository.updateSubscription(subscription.id, {
          status: 'trial',
          trial_start: new Date(),
          trial_end: new Date(Date.now() + this.settings.trialPeriodDays * 24 * 60 * 60 * 1000),
          activated_at: new Date()
        });
      }

      // Get owner user and activate
      const ownerUsers = await this.repository.findUsersByRole(customerId, 'owner', { activeOnly: false });
      if (ownerUsers.length > 0) {
        await this.userManagement.activateUser(ownerUsers[0].id, approverId, 'Registration approved');
      }

      // Create audit log
      await this.createAuditLog({
        customer_id: customerId,
        user_id: approverId,
        action: 'customer_approved',
        resource_type: 'customer',
        resource_id: customerId,
        details: {
          approval_notes: options.notes,
          previous_status: customer.status
        }
      });

      // Send approval notification
      if (!options.skipEmails && ownerUsers.length > 0) {
        await this.sendApprovalEmail(approvedCustomer, ownerUsers[0]);
      }

      // Emit event
      this.emit('customerApproved', {
        customer: approvedCustomer,
        approver: approverId,
        notes: options.notes
      });

      return { 
        customer: this.sanitizeCustomer(approvedCustomer),
        message: 'Customer registration approved successfully'
      };

    } catch (error) {
      console.error('Error approving registration:', error);
      throw error;
    }
  }

  /**
   * Reject customer registration
   */
  async rejectRegistration(customerId, rejectorId, reason, options = {}) {
    try {
      const customer = await this.repository.findCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      if (customer.status !== 'pending_approval') {
        throw new Error(`Cannot reject customer with status: ${customer.status}`);
      }

      // Update customer status
      const rejectedCustomer = await this.repository.updateCustomer(customerId, {
        status: 'rejected',
        rejected_at: new Date(),
        rejected_by: rejectorId,
        rejection_reason: reason,
        rejection_notes: options.notes
      });

      // Deactivate subscription if exists
      const subscription = await this.repository.findActiveSubscription(customerId);
      if (subscription) {
        await this.repository.updateSubscription(subscription.id, {
          status: 'cancelled',
          cancelled_at: new Date(),
          cancellation_reason: 'Registration rejected'
        });
      }

      // Deactivate users
      const users = await this.repository.findUsersByCustomer(customerId);
      for (const user of users) {
        await this.userManagement.deactivateUser(user.id, rejectorId, 'Registration rejected');
      }

      // Create audit log
      await this.createAuditLog({
        customer_id: customerId,
        user_id: rejectorId,
        action: 'customer_rejected',
        resource_type: 'customer',
        resource_id: customerId,
        details: {
          rejection_reason: reason,
          rejection_notes: options.notes,
          previous_status: customer.status
        }
      });

      // Send rejection notification
      if (!options.skipEmails && users.length > 0) {
        const ownerUser = users.find(u => u.role === 'owner') || users[0];
        await this.sendRejectionEmail(rejectedCustomer, ownerUser, reason);
      }

      // Emit event
      this.emit('customerRejected', {
        customer: rejectedCustomer,
        rejector: rejectorId,
        reason,
        notes: options.notes
      });

      return { 
        customer: this.sanitizeCustomer(rejectedCustomer),
        message: 'Customer registration rejected'
      };

    } catch (error) {
      console.error('Error rejecting registration:', error);
      throw error;
    }
  }

  // ==================== INVITE MANAGEMENT ====================

  /**
   * Create customer invite
   */
  async createInvite(inviteData, createdBy) {
    try {
      // Validate invite data
      const { error, value } = this.validateInviteData(inviteData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Check if email is already registered
      const existingUser = await this.repository.findUserByEmail(value.email);
      if (existingUser) {
        throw new Error('Email is already registered');
      }

      // Create invite
      const invite = {
        id: uuidv4(),
        email: value.email.toLowerCase(),
        business_name: value.business_name,
        customer_type: value.customer_type || 'business',
        plan_id: value.plan_id || this.settings.defaultPlan,
        invited_by: createdBy,
        invite_token: this.generateInviteToken(),
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        created_at: new Date(),
        metadata: value.metadata || {}
      };

      const createdInvite = await this.repository.create('customer_invites', invite);

      // Send invite email
      if (!inviteData.skipEmail) {
        await this.sendInviteEmail(createdInvite);
      }

      // Emit event
      this.emit('inviteCreated', {
        invite: createdInvite,
        createdBy
      });

      return {
        invite: this.sanitizeInvite(createdInvite),
        inviteUrl: `${process.env.APP_URL}/register?invite=${invite.invite_token}`
      };

    } catch (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
  }

  /**
   * Validate invite token
   */
  async validateInviteToken(token) {
    try {
      const invites = await this.repository.findByIndex('customer_invites', 'invite_token', token);
      const invite = invites[0];

      if (!invite) {
        throw new Error('Invalid invite token');
      }

      if (invite.status !== 'pending') {
        throw new Error('Invite has already been used or expired');
      }

      if (new Date() > invite.expires_at) {
        throw new Error('Invite has expired');
      }

      return invite;

    } catch (error) {
      console.error('Error validating invite token:', error);
      throw error;
    }
  }

  // ==================== VALIDATION HELPERS ====================

  /**
   * Validate complete registration data
   */
  async validateRegistrationData(data) {
    // Validate customer data
    const customerValidation = CustomerValidationSchema.validate(data.customer);
    if (customerValidation.error) {
      throw new Error(`Customer validation error: ${customerValidation.error.details[0].message}`);
    }

    // Validate owner user data
    const ownerValidation = UserValidationSchema.validate({
      ...data.owner,
      role: 'owner'
    });
    if (ownerValidation.error) {
      throw new Error(`Owner validation error: ${ownerValidation.error.details[0].message}`);
    }

    // Validate subscription data if provided
    if (data.subscription && data.subscription.plan_id) {
      await this.validateSubscriptionPlan(data.subscription.plan_id);
    }

    return true;
  }

  /**
   * Check for duplicate registrations
   */
  async checkDuplicateRegistration(data) {
    // Check business name uniqueness
    if (data.customer.business_name) {
      const existingCustomers = await this.repository.findByIndex(
        TABLES.customers,
        'business_name',
        data.customer.business_name
      );
      
      if (existingCustomers.length > 0) {
        throw new Error('A customer with this business name already exists');
      }
    }

    // Check owner email uniqueness
    const existingUser = await this.repository.findUserByEmail(data.owner.email);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    return true;
  }

  /**
   * Validate subscription plan
   */
  async validateSubscriptionPlan(planId) {
    // This would typically check against your pricing plans
    const validPlans = ['starter', 'professional', 'enterprise'];
    
    if (!validPlans.includes(planId)) {
      throw new Error(`Invalid subscription plan: ${planId}`);
    }

    return true;
  }

  // ==================== CREATION HELPERS ====================

  /**
   * Create customer record
   */
  async createCustomer(customerData, options = {}) {
    try {
      const customer = {
        ...customerData,
        id: uuidv4(),
        status: this.settings.autoApproveRegistrations ? 'active' : 'pending_approval',
        customer_type: customerData.customer_type || 'business',
        subscription_status: 'trial',
        billing_email: customerData.billing_email || customerData.contact_email,
        created_at: new Date(),
        updated_at: new Date(),
        settings: {
          timezone: customerData.timezone || 'UTC',
          date_format: 'YYYY-MM-DD',
          time_format: '24h',
          distance_unit: 'km',
          temperature_unit: 'celsius',
          ...customerData.settings
        },
        limits: {
          max_users: this.settings.maxUsersPerCustomer,
          max_vehicles: this.settings.maxVehiclesPerCustomer,
          max_devices: this.settings.maxVehiclesPerCustomer
        },
        registration_source: options.source || 'web',
        registration_ip: options.ipAddress,
        registration_user_agent: options.userAgent
      };

      // Create Stripe customer if Stripe is configured
      if (this.stripe && !options.skipStripe) {
        try {
          const stripeCustomer = await this.stripe.customers.create({
            email: customer.billing_email,
            name: customer.business_name,
            metadata: {
              customer_id: customer.id,
              customer_type: customer.customer_type
            }
          });

          customer.stripe_customer_id = stripeCustomer.id;
        } catch (stripeError) {
          console.warn('Failed to create Stripe customer:', stripeError.message);
        }
      }

      return await this.repository.createCustomer(customer);

    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Create owner user account
   */
  async createOwnerUser(customer, ownerData, options = {}) {
    try {
      const userData = {
        ...ownerData,
        customer_id: customer.id,
        role: 'owner',
        is_active: customer.status === 'active',
        permissions: {
          can_manage_users: true,
          can_manage_vehicles: true,
          can_manage_devices: true,
          can_view_reports: true,
          can_manage_billing: true,
          can_manage_settings: true
        }
      };

      return await this.userManagement.registerUser(userData, {
        skipEmailVerification: options.skipEmailVerification || !this.settings.requireEmailVerification,
        skipEmail: options.skipEmails,
        registrationMethod: 'customer_registration',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent
      });

    } catch (error) {
      console.error('Error creating owner user:', error);
      throw error;
    }
  }

  /**
   * Setup customer subscription
   */
  async setupSubscription(customer, subscriptionData = {}, options = {}) {
    try {
      const planId = subscriptionData.plan_id || this.settings.defaultPlan;
      const trialDays = subscriptionData.trial_days || this.settings.trialPeriodDays;

      const subscription = {
        id: uuidv4(),
        customer_id: customer.id,
        plan_id: planId,
        status: customer.status === 'active' ? 'trial' : 'pending_approval',
        billing_cycle: subscriptionData.billing_cycle || 'monthly',
        trial_start: customer.status === 'active' ? new Date() : null,
        trial_end: customer.status === 'active' 
          ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
          : null,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: subscriptionData.metadata || {}
      };

      // Create Stripe subscription if configured and customer is active
      if (this.stripe && customer.stripe_customer_id && customer.status === 'active' && !options.skipStripe) {
        try {
          // This would create a Stripe subscription with trial
          // Implementation depends on your Stripe setup
          console.log('Stripe subscription creation would happen here');
        } catch (stripeError) {
          console.warn('Failed to create Stripe subscription:', stripeError.message);
        }
      }

      return await this.repository.createSubscription(subscription);

    } catch (error) {
      console.error('Error setting up subscription:', error);
      throw error;
    }
  }

  /**
   * Create initial API key
   */
  async createInitialApiKey(customer, user) {
    try {
      const apiKeyData = {
        customer_id: customer.id,
        created_by: user.id,
        name: 'Initial API Key',
        description: 'Automatically generated API key for customer registration',
        permissions: ['read:vehicles', 'read:devices', 'read:events'],
        active: true,
        expires_at: null // No expiration for initial key
      };

      // Generate API key
      const keyValue = this.generateApiKey();
      const keyHash = this.hashApiKey(keyValue);

      const apiKey = {
        ...apiKeyData,
        id: uuidv4(),
        key_hash: keyHash,
        key_prefix: keyValue.substring(0, 8) + '...',
        created_at: new Date(),
        updated_at: new Date()
      };

      const createdApiKey = await this.repository.create(TABLES.api_keys, apiKey);

      // Return with the actual key value (only time it's exposed)
      return {
        ...createdApiKey,
        key_value: keyValue
      };

    } catch (error) {
      console.error('Error creating initial API key:', error);
      throw error;
    }
  }

  /**
   * Setup default settings for customer
   */
  async setupDefaultSettings(customer) {
    try {
      const defaultSettings = [
        {
          id: uuidv4(),
          customer_id: customer.id,
          category: 'notifications',
          key: 'email_alerts',
          value: true,
          description: 'Send email alerts for vehicle events'
        },
        {
          id: uuidv4(),
          customer_id: customer.id,
          category: 'tracking',
          key: 'update_interval',
          value: 60,
          description: 'GPS update interval in seconds'
        },
        {
          id: uuidv4(),
          customer_id: customer.id,
          category: 'alerts',
          key: 'speed_threshold',
          value: 80,
          description: 'Speed alert threshold in km/h'
        },
        {
          id: uuidv4(),
          customer_id: customer.id,
          category: 'alerts',
          key: 'idle_threshold',
          value: 300,
          description: 'Idle alert threshold in seconds'
        }
      ];

      // Create all default settings
      await this.repository.batchInsert('customer_settings', defaultSettings);

      return defaultSettings;

    } catch (error) {
      console.error('Error setting up default settings:', error);
      throw error;
    }
  }

  /**
   * Create welcome notification
   */
  async createWelcomeNotification(customer, user) {
    try {
      const notification = {
        id: uuidv4(),
        customer_id: customer.id,
        user_id: user.id,
        type: 'welcome',
        category: 'system_update',
        title: 'Welcome to Trans-Tech Vehicle Tracking!',
        message: `Welcome ${user.first_name}! Your account has been created successfully. ${
          customer.status === 'pending_approval' 
            ? 'Your account is pending approval and will be activated soon.'
            : 'Start by adding your first vehicle to begin tracking.'
        }`,
        severity: 'info',
        read: false,
        archived: false,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      return await this.repository.createNotification(notification);

    } catch (error) {
      console.error('Error creating welcome notification:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate invite token
   */
  generateInviteToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate API key
   */
  generateApiKey() {
    const prefix = 'ttk_'; // trans-tech key
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  /**
   * Hash API key for storage
   */
  hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Mark invite as used
   */
  async markInviteUsed(inviteToken, customerId) {
    try {
      const invites = await this.repository.findByIndex('customer_invites', 'invite_token', inviteToken);
      
      if (invites.length > 0) {
        await this.repository.update('customer_invites', invites[0].id, {
          status: 'used',
          used_at: new Date(),
          used_by_customer: customerId
        });
      }
    } catch (error) {
      console.error('Error marking invite as used:', error);
    }
  }

  /**
   * Log registration event
   */
  async logRegistration(customer, user, options = {}) {
    try {
      await this.createAuditLog({
        customer_id: customer.id,
        user_id: user.id,
        action: 'customer_registered',
        resource_type: 'customer',
        resource_id: customer.id,
        details: {
          business_name: customer.business_name,
          customer_type: customer.customer_type,
          owner_email: user.email,
          registration_source: options.source || 'web',
          invite_token: options.inviteToken || null,
          auto_approved: this.settings.autoApproveRegistrations
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });
    } catch (error) {
      console.error('Error logging registration:', error);
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

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen to user management events
    this.userManagement.on('userRegistered', (data) => {
      this.emit('ownerUserCreated', data);
    });

    // Listen to subscription events
    this.on('subscriptionCreated', (data) => {
      console.log('Subscription created for customer:', data.customer_id);
    });
  }

  // ==================== SANITIZATION METHODS ====================

  /**
   * Sanitize customer data
   */
  sanitizeCustomer(customer) {
    if (!customer) return null;

    const sanitized = { ...customer };
    // Remove sensitive fields if any
    return sanitized;
  }

  /**
   * Sanitize API key data
   */
  sanitizeApiKey(apiKey) {
    if (!apiKey) return null;

    const sanitized = { ...apiKey };
    delete sanitized.key_hash;
    // Keep key_value only on initial creation
    return sanitized;
  }

  /**
   * Sanitize invite data
   */
  sanitizeInvite(invite) {
    if (!invite) return null;

    const sanitized = { ...invite };
    delete sanitized.invite_token; // Don't expose token in responses
    return sanitized;
  }

  // ==================== EMAIL SERVICES (PLACEHOLDER) ====================

  /**
   * Send welcome emails
   */
  async sendWelcomeEmails(customer, user, subscription) {
    try {
      this.emit('sendEmail', {
        type: 'customerWelcome',
        to: user.email,
        data: {
          customer: this.sanitizeCustomer(customer),
          user: this.userManagement.sanitizeUser(user),
          subscription,
          needsApproval: customer.status === 'pending_approval',
          trialDays: this.settings.trialPeriodDays,
          loginUrl: `${process.env.APP_URL}/login`
        }
      });
    } catch (error) {
      console.error('Error sending welcome emails:', error);
    }
  }

  /**
   * Send invite email
   */
  async sendInviteEmail(invite) {
    try {
      this.emit('sendEmail', {
        type: 'customerInvite',
        to: invite.email,
        data: {
          invite,
          inviteUrl: `${process.env.APP_URL}/register?invite=${invite.invite_token}`,
          expiresAt: invite.expires_at
        }
      });
    } catch (error) {
      console.error('Error sending invite email:', error);
    }
  }

  /**
   * Send approval email
   */
  async sendApprovalEmail(customer, user) {
    try {
      this.emit('sendEmail', {
        type: 'registrationApproved',
        to: user.email,
        data: {
          customer: this.sanitizeCustomer(customer),
          user: this.userManagement.sanitizeUser(user),
          loginUrl: `${process.env.APP_URL}/login`
        }
      });
    } catch (error) {
      console.error('Error sending approval email:', error);
    }
  }

  /**
   * Send rejection email
   */
  async sendRejectionEmail(customer, user, reason) {
    try {
      this.emit('sendEmail', {
        type: 'registrationRejected',
        to: user.email,
        data: {
          customer: this.sanitizeCustomer(customer),
          user: this.userManagement.sanitizeUser(user),
          reason
        }
      });
    } catch (error) {
      console.error('Error sending rejection email:', error);
    }
  }

  // ==================== VALIDATION SCHEMAS ====================

  /**
   * Validate invite data
   */
  validateInviteData(data) {
    // Simple validation - you might want to use Joi here
    const errors = [];

    if (!data.email || !data.email.includes('@')) {
      errors.push('Valid email is required');
    }

    if (!data.business_name || data.business_name.trim().length < 2) {
      errors.push('Business name is required (minimum 2 characters)');
    }

    if (data.customer_type && !['individual', 'business', 'enterprise'].includes(data.customer_type)) {
      errors.push('Invalid customer type');
    }

    return {
      error: errors.length > 0 ? { details: errors.map(msg => ({ message: msg })) } : null,
      value: data
    };
  }

  // ==================== GETTER METHODS ====================

  /**
   * Get registration statistics
   */
  async getRegistrationStats(timeRange = '30d') {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '24h': startDate.setHours(startDate.getHours() - 24); break;
        case '7d': startDate.setDate(startDate.getDate() - 7); break;
        case '30d': startDate.setDate(startDate.getDate() - 30); break;
        case '90d': startDate.setDate(startDate.getDate() - 90); break;
        default: startDate.setDate(startDate.getDate() - 30);
      }

      const [totalRegistrations, activeCustomers, pendingApprovals, rejectedRegistrations] = await Promise.all([
        this.repository.count(TABLES.customers, r => r.row('created_at').during(startDate, endDate)),
        this.repository.count(TABLES.customers, r => 
          r.row('created_at').during(startDate, endDate)
          .and(r.row('status').eq('active'))
        ),
        this.repository.count(TABLES.customers, { status: 'pending_approval' }),
        this.repository.count(TABLES.customers, r => 
          r.row('created_at').during(startDate, endDate)
          .and(r.row('status').eq('rejected'))
        )
      ]);

      return {
        timeRange,
        totalRegistrations,
        activeCustomers,
        pendingApprovals,
        rejectedRegistrations,
        approvalRate: totalRegistrations > 0 ? ((activeCustomers / totalRegistrations) * 100).toFixed(2) : 0
      };

    } catch (error) {
      console.error('Error getting registration stats:', error);
      throw error;
    }
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(options = {}) {
    try {
      return await this.repository.findCustomersByStatus('pending_approval', {
        orderBy: 'created_at',
        desc: true,
        limit: options.limit || 50,
        offset: options.offset || 0
      });
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  }
}

export default new CustomerRegistration();

// Also export the class for testing
export { CustomerRegistration };