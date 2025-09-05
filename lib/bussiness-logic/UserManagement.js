import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import DocumentRepository from '../repositories/DocumentRepository.js';
import { 
  UserValidationSchema, 
  UserUpdateSchema,
  CustomerValidationSchema 
} from '../schemas/DocumentSchemas.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import { EventEmitter } from 'events';

class UserManagement extends EventEmitter {
  constructor() {
    super();
    this.repository = DocumentRepository;
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    
    // Password requirements
    this.passwordRequirements = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLength: 128
    };

    // Account lockout settings
    this.lockoutSettings = {
      maxAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      resetTime: 60 * 60 * 1000 // 1 hour
    };
  }

  // ==================== USER AUTHENTICATION ====================

  /**
   * Register a new user
   */
  async registerUser(userData, options = {}) {
    try {
      // Validate input data
      const { error, value } = UserValidationSchema.validate(userData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      const validatedData = value;

      // Check if email already exists
      const existingUser = await this.repository.findUserByEmail(validatedData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate customer exists and is active
      const customer = await this.repository.findCustomerById(validatedData.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      if (customer.status !== 'active') {
        throw new Error('Customer account is not active');
      }

      // Validate password strength
      this.validatePasswordStrength(userData.password);

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Prepare user data
      const newUser = {
        ...validatedData,
        password_hash: passwordHash,
        id: uuidv4(),
        email_verified: options.skipEmailVerification || false,
        is_active: true,
        login_count: 0,
        failed_login_attempts: 0,
        account_locked_until: null,
        email_verification_token: options.skipEmailVerification ? null : this.generateToken(),
        email_verification_expires: options.skipEmailVerification ? null : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        created_at: new Date(),
        updated_at: new Date()
      };

      // Remove password from validated data
      delete newUser.password;

      // Create user
      const createdUser = await this.repository.createUser(newUser);

      // Create audit log
      await this.createAuditLog({
        customer_id: validatedData.customer_id,
        user_id: createdUser.id,
        action: 'user_registered',
        resource_type: 'user',
        resource_id: createdUser.id,
        details: {
          email: createdUser.email,
          role: createdUser.role,
          registration_method: options.registrationMethod || 'manual'
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });

      // Emit event
      this.emit('userRegistered', {
        user: this.sanitizeUser(createdUser),
        customer,
        needsEmailVerification: !options.skipEmailVerification
      });

      // Send welcome email if not skipped
      if (!options.skipEmail) {
        await this.sendWelcomeEmail(createdUser, customer);
      }

      return {
        user: this.sanitizeUser(createdUser),
        needsEmailVerification: !options.skipEmailVerification,
        verificationToken: createdUser.email_verification_token
      };

    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async loginUser(email, password, options = {}) {
    try {
      // Find user by email
      const user = await this.repository.findUserByEmail(email.toLowerCase());
      if (!user) {
        await this.logFailedLoginAttempt(email, 'user_not_found', options);
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      if (user.account_locked_until && new Date() < user.account_locked_until) {
        await this.logFailedLoginAttempt(email, 'account_locked', options);
        throw new Error(`Account is locked until ${user.account_locked_until.toISOString()}`);
      }

      // Check if user is active
      if (!user.is_active) {
        await this.logFailedLoginAttempt(email, 'account_inactive', options);
        throw new Error('Account is inactive');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        await this.handleFailedLogin(user, options);
        throw new Error('Invalid email or password');
      }

      // Check if email is verified (if required)
      if (!user.email_verified && !options.skipEmailVerification) {
        throw new Error('Please verify your email address before logging in');
      }

      // Get customer information
      const customer = await this.repository.findCustomerById(user.customer_id);
      if (!customer) {
        throw new Error('Customer account not found');
      }

      if (customer.status !== 'active') {
        throw new Error('Customer account is not active');
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(user.id);

      // Update last login
      await this.repository.updateUserLastLogin(user.id);

      // Generate JWT token
      const token = this.generateJWTToken(user, customer);

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: user.id,
        action: 'user_login',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          login_method: options.loginMethod || 'password',
          ip_address: options.ipAddress,
          user_agent: options.userAgent
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });

      // Emit event
      this.emit('userLoggedIn', {
        user: this.sanitizeUser(user),
        customer,
        loginMethod: options.loginMethod || 'password'
      });

      return {
        user: this.sanitizeUser(user),
        customer: this.sanitizeCustomer(customer),
        token,
        expiresIn: this.jwtExpiresIn
      };

    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Login user with Auth0 token
   */
  async loginWithAuth0(auth0UserData, options = {}) {
    try {
      // Find user by Auth0 ID
      let user = await this.repository.findUserByAuth0Id(auth0UserData.sub);
      
      if (!user) {
        // Try to find by email
        user = await this.repository.findUserByEmail(auth0UserData.email);
        
        if (user) {
          // Link Auth0 account to existing user
          await this.repository.updateUser(user.id, {
            auth0_user_id: auth0UserData.sub,
            email_verified: auth0UserData.email_verified || user.email_verified
          });
        } else {
          throw new Error('User not found. Please contact administrator to create your account.');
        }
      }

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is inactive');
      }

      // Get customer information
      const customer = await this.repository.findCustomerById(user.customer_id);
      if (!customer || customer.status !== 'active') {
        throw new Error('Customer account is not active');
      }

      // Update last login
      await this.repository.updateUserLastLogin(user.id);

      // Update Auth0 profile data if provided
      if (auth0UserData.picture && auth0UserData.picture !== user.avatar_url) {
        await this.repository.updateUser(user.id, {
          avatar_url: auth0UserData.picture
        });
        user.avatar_url = auth0UserData.picture;
      }

      // Generate JWT token
      const token = this.generateJWTToken(user, customer);

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: user.id,
        action: 'user_login',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          login_method: 'auth0',
          auth0_user_id: auth0UserData.sub,
          ip_address: options.ipAddress,
          user_agent: options.userAgent
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });

      // Emit event
      this.emit('userLoggedIn', {
        user: this.sanitizeUser(user),
        customer,
        loginMethod: 'auth0'
      });

      return {
        user: this.sanitizeUser(user),
        customer: this.sanitizeCustomer(customer),
        token,
        expiresIn: this.jwtExpiresIn
      };

    } catch (error) {
      console.error('Error logging in with Auth0:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token and get user
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Get fresh user data
      const user = await this.repository.findUserById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('Invalid or inactive user');
      }

      // Get customer data
      const customer = await this.repository.findCustomerById(user.customer_id);
      if (!customer || customer.status !== 'active') {
        throw new Error('Customer account not active');
      }

      return {
        user: this.sanitizeUser(user),
        customer: this.sanitizeCustomer(customer),
        tokenData: decoded
      };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, { ignoreExpiration: true });
      
      // Check if token is not too old (allow refresh within 30 days)
      const tokenAge = Date.now() - decoded.iat * 1000;
      if (tokenAge > 30 * 24 * 60 * 60 * 1000) {
        throw new Error('Token is too old to refresh');
      }

      // Get fresh user data
      const user = await this.repository.findUserById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('Invalid or inactive user');
      }

      const customer = await this.repository.findCustomerById(user.customer_id);
      if (!customer || customer.status !== 'active') {
        throw new Error('Customer account not active');
      }

      // Generate new token
      const newToken = this.generateJWTToken(user, customer);

      return {
        user: this.sanitizeUser(user),
        customer: this.sanitizeCustomer(customer),
        token: newToken,
        expiresIn: this.jwtExpiresIn
      };

    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logoutUser(userId, options = {}) {
    try {
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: user.id,
        action: 'user_logout',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          logout_method: options.logoutMethod || 'manual',
          ip_address: options.ipAddress,
          user_agent: options.userAgent
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });

      // Emit event
      this.emit('userLoggedOut', {
        user: this.sanitizeUser(user),
        logoutMethod: options.logoutMethod || 'manual'
      });

      return { success: true };

    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get user by ID with customer information
   */
  async getUserById(userId, requestingUserId = null) {
    try {
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check permissions
      if (requestingUserId && requestingUserId !== userId) {
        const requestingUser = await this.repository.findUserById(requestingUserId);
        if (!requestingUser) {
          throw new Error('Requesting user not found');
        }

        // Check if requesting user can view this user
        if (requestingUser.customer_id !== user.customer_id) {
          throw new Error('Access denied: Users from different customers');
        }

        // Check role-based permissions
        if (!this.canViewUser(requestingUser.role, user.role)) {
          throw new Error('Access denied: Insufficient permissions');
        }
      }

      // Get customer information
      const customer = await this.repository.findCustomerById(user.customer_id);

      return {
        user: this.sanitizeUser(user),
        customer: customer ? this.sanitizeCustomer(customer) : null
      };

    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId, updates, requestingUserId) {
    try {
      // Validate updates
      const { error, value } = UserUpdateSchema.validate(updates);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      const validatedUpdates = value;

      // Get existing user
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get requesting user for permission checks
      const requestingUser = await this.repository.findUserById(requestingUserId);
      if (!requestingUser) {
        throw new Error('Requesting user not found');
      }

      // Check permissions
      if (requestingUser.customer_id !== user.customer_id) {
        throw new Error('Access denied: Users from different customers');
      }

      if (userId !== requestingUserId && !this.canManageUser(requestingUser.role, user.role)) {
        throw new Error('Access denied: Insufficient permissions');
      }

      // Validate role changes
      if (validatedUpdates.role && validatedUpdates.role !== user.role) {
        if (!this.canAssignRole(requestingUser.role, validatedUpdates.role)) {
          throw new Error('Access denied: Cannot assign this role');
        }
      }

      // Check email uniqueness if email is being updated
      if (validatedUpdates.email && validatedUpdates.email !== user.email) {
        const existingUser = await this.repository.findUserByEmail(validatedUpdates.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already in use by another user');
        }
        
        // Reset email verification if email changed
        validatedUpdates.email_verified = false;
        validatedUpdates.email_verification_token = this.generateToken();
        validatedUpdates.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // Update user
      const updatedUser = await this.repository.updateUser(userId, validatedUpdates);

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: requestingUserId,
        action: 'user_updated',
        resource_type: 'user',
        resource_id: userId,
        details: {
          updated_fields: Object.keys(validatedUpdates),
          target_user: user.email,
          role_changed: validatedUpdates.role && validatedUpdates.role !== user.role
        }
      });

      // Emit event
      this.emit('userUpdated', {
        user: this.sanitizeUser(updatedUser),
        previousData: this.sanitizeUser(user),
        updatedBy: this.sanitizeUser(requestingUser),
        updatedFields: Object.keys(validatedUpdates)
      });

      // Send email verification if email changed
      if (validatedUpdates.email && validatedUpdates.email !== user.email) {
        await this.sendEmailVerification(updatedUser);
      }

      return {
        user: this.sanitizeUser(updatedUser)
      };

    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId, requestingUserId, reason = 'Manual deactivation') {
    try {
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const requestingUser = await this.repository.findUserById(requestingUserId);
      if (!requestingUser) {
        throw new Error('Requesting user not found');
      }

      // Check permissions
      if (requestingUser.customer_id !== user.customer_id) {
        throw new Error('Access denied: Users from different customers');
      }

      if (!this.canManageUser(requestingUser.role, user.role)) {
        throw new Error('Access denied: Insufficient permissions');
      }

      // Prevent self-deactivation
      if (userId === requestingUserId) {
        throw new Error('Cannot deactivate your own account');
      }

      // Deactivate user
      const deactivatedUser = await this.repository.deactivateUser(userId);

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: requestingUserId,
        action: 'user_deactivated',
        resource_type: 'user',
        resource_id: userId,
        details: {
          reason,
          target_user: user.email,
          target_role: user.role
        }
      });

      // Emit event
      this.emit('userDeactivated', {
        user: this.sanitizeUser(deactivatedUser),
        deactivatedBy: this.sanitizeUser(requestingUser),
        reason
      });

      return {
        user: this.sanitizeUser(deactivatedUser)
      };

    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId, requestingUserId, reason = 'Manual activation') {
    try {
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const requestingUser = await this.repository.findUserById(requestingUserId);
      if (!requestingUser) {
        throw new Error('Requesting user not found');
      }

      // Check permissions
      if (requestingUser.customer_id !== user.customer_id) {
        throw new Error('Access denied: Users from different customers');
      }

      if (!this.canManageUser(requestingUser.role, user.role)) {
        throw new Error('Access denied: Insufficient permissions');
      }

      // Activate user
      const activatedUser = await this.repository.activateUser(userId);

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: requestingUserId,
        action: 'user_activated',
        resource_type: 'user',
        resource_id: userId,
        details: {
          reason,
          target_user: user.email,
          target_role: user.role
        }
      });

      // Emit event
      this.emit('userActivated', {
        user: this.sanitizeUser(activatedUser),
        activatedBy: this.sanitizeUser(requestingUser),
        reason
      });

      return {
        user: this.sanitizeUser(activatedUser)
      };

    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword, requestingUserId = null) {
    try {
      const user = await this.repository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If requesting user is different, check admin permissions
      if (requestingUserId && requestingUserId !== userId) {
        const requestingUser = await this.repository.findUserById(requestingUserId);
        if (!requestingUser) {
          throw new Error('Requesting user not found');
        }

        if (requestingUser.customer_id !== user.customer_id) {
          throw new Error('Access denied: Users from different customers');
        }

        if (!this.canManageUser(requestingUser.role, user.role)) {
          throw new Error('Access denied: Insufficient permissions');
        }
      } else {
        // Self password change - verify current password
        if (!currentPassword) {
          throw new Error('Current password is required');
        }

        const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
          throw new Error('Current password is incorrect');
        }
      }

      // Validate new password strength
      this.validatePasswordStrength(newPassword);

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await this.repository.updateUser(userId, {
        password_hash: newPasswordHash,
        password_changed_at: new Date(),
        failed_login_attempts: 0,
        account_locked_until: null
      });

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: requestingUserId || userId,
        action: 'password_changed',
        resource_type: 'user',
        resource_id: userId,
        details: {
          target_user: user.email,
          changed_by_admin: requestingUserId && requestingUserId !== userId
        }
      });

      // Emit event
      this.emit('passwordChanged', {
        user: this.sanitizeUser(user),
        changedByAdmin: requestingUserId && requestingUserId !== userId
      });

      return { success: true };

    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Reset password (forgot password flow)
   */
  async requestPasswordReset(email, options = {}) {
    try {
      const user = await this.repository.findUserByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if email exists or not
        return { success: true, message: 'If the email exists, a reset link has been sent' };
      }

      if (!user.is_active) {
        throw new Error('Account is inactive');
      }

      // Generate reset token
      const resetToken = this.generateToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await this.repository.updateUser(user.id, {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: user.id,
        action: 'password_reset_requested',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          ip_address: options.ipAddress,
          user_agent: options.userAgent
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });

      // Send reset email
      if (!options.skipEmail) {
        await this.sendPasswordResetEmail(user, resetToken);
      }

      // Emit event
      this.emit('passwordResetRequested', {
        user: this.sanitizeUser(user),
        resetToken
      });

      return { 
        success: true, 
        message: 'Password reset link has been sent to your email',
        resetToken: options.returnToken ? resetToken : undefined
      };

    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword, options = {}) {
    try {
      // Find user by reset token
      const users = await this.repository.findByIndex(TABLES.users, 'password_reset_token', token);
      const user = users[0];

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if token is expired
      if (!user.password_reset_expires || new Date() > user.password_reset_expires) {
        throw new Error('Reset token has expired');
      }

      // Validate new password strength
      this.validatePasswordStrength(newPassword);

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update user
      await this.repository.updateUser(user.id, {
        password_hash: newPasswordHash,
        password_reset_token: null,
        password_reset_expires: null,
        password_changed_at: new Date(),
        failed_login_attempts: 0,
        account_locked_until: null
      });

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: user.id,
        action: 'password_reset_completed',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          ip_address: options.ipAddress,
          user_agent: options.userAgent
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });

      // Emit event
      this.emit('passwordReset', {
        user: this.sanitizeUser(user)
      });

      return { success: true, message: 'Password has been reset successfully' };

    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Send email verification
   */
  async sendEmailVerification(user) {
    try {
      if (user.email_verified) {
        return { success: true, message: 'Email is already verified' };
      }

      // Generate new verification token if needed
      let verificationToken = user.email_verification_token;
      if (!verificationToken || (user.email_verification_expires && new Date() > user.email_verification_expires)) {
        verificationToken = this.generateToken();
        await this.repository.updateUser(user.id, {
          email_verification_token: verificationToken,
          email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      }

      // Send verification email (implement based on your email service)
      await this.sendVerificationEmail(user, verificationToken);

      return { success: true, message: 'Verification email sent' };

    } catch (error) {
      console.error('Error sending email verification:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    try {
      // Find user by verification token
      const users = await this.repository.findByIndex(TABLES.users, 'email_verification_token', token);
      const user = users[0];

      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Check if token is expired
      if (user.email_verification_expires && new Date() > user.email_verification_expires) {
        throw new Error('Verification token has expired');
      }

      // Update user as verified
      const verifiedUser = await this.repository.updateUser(user.id, {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
        email_verified_at: new Date()
      });

      // Create audit log
      await this.createAuditLog({
        customer_id: user.customer_id,
        user_id: user.id,
        action: 'email_verified',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          email: user.email
        }
      });

      // Emit event
      this.emit('emailVerified', {
        user: this.sanitizeUser(verifiedUser)
      });

      return { 
        success: true, 
        message: 'Email verified successfully',
        user: this.sanitizeUser(verifiedUser)
      };

    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  // ==================== USER LISTING AND SEARCH ====================

  /**
   * Get users for a customer with filtering and pagination
   */
  async getUsersByCustomer(customerId, options = {}) {
    try {
      const {
        role,
        status = 'active',
        search,
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        orderDir = 'desc'
      } = options;

      let queryOptions = {
        orderBy,
        desc: orderDir === 'desc',
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      let users;

      if (role) {
        users = await this.repository.findUsersByRole(customerId, role, {
          ...queryOptions,
          activeOnly: status === 'active'
        });
      } else {
        users = await this.repository.findUsersByCustomer(customerId, queryOptions);
      }

      // Filter by search term if provided
      if (search) {
        const searchTerm = search.toLowerCase();
        users = users.filter(user => 
          user.first_name.toLowerCase().includes(searchTerm) ||
          user.last_name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by status
      if (status === 'active') {
        users = users.filter(user => user.is_active);
      } else if (status === 'inactive') {
        users = users.filter(user => !user.is_active);
      }

      return {
        users: users.map(user => this.sanitizeUser(user)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      };

    } catch (error) {
      console.error('Error getting users by customer:', error);
      throw error;
    }
  }

  // ==================== PERMISSION HELPERS ====================

  /**
   * Check if user can view another user
   */
  canViewUser(requesterRole, targetRole) {
    const roleHierarchy = {
      'owner': 5,
      'admin': 4,
      'manager': 3,
      'driver': 2,
      'viewer': 1
    };

    return roleHierarchy[requesterRole] >= roleHierarchy[targetRole];
  }

  /**
   * Check if user can manage another user
   */
  canManageUser(requesterRole, targetRole) {
    const roleHierarchy = {
      'owner': 5,
      'admin': 4,
      'manager': 3,
      'driver': 2,
      'viewer': 1
    };

    return roleHierarchy[requesterRole] > roleHierarchy[targetRole];
  }

  /**
   * Check if user can assign a specific role
   */
  canAssignRole(requesterRole, targetRole) {
    const assignableRoles = {
      'owner': ['owner', 'admin', 'manager', 'driver', 'viewer'],
      'admin': ['admin', 'manager', 'driver', 'viewer'],
      'manager': ['driver', 'viewer'],
      'driver': [],
      'viewer': []
    };

    return assignableRoles[requesterRole]?.includes(targetRole) || false;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate JWT token
   */
  generateJWTToken(user, customer) {
    const payload = {
      userId: user.id,
      customerId: user.customer_id,
      email: user.email,
      role: user.role,
      customerType: customer.customer_type,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'trans-tech-vtracking',
      audience: 'trans-tech-users'
    });
  }

  /**
   * Generate secure random token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const requirements = this.passwordRequirements;
    const errors = [];

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }

    if (password.length > requirements.maxLength) {
      errors.push(`Password must be no more than ${requirements.maxLength} characters long`);
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      throw new Error(`Password validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Handle failed login attempt
   */
  async handleFailedLogin(user, options = {}) {
    try {
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const updates = {
        failed_login_attempts: failedAttempts,
        last_failed_login: new Date()
      };

      // Lock account if max attempts reached
      if (failedAttempts >= this.lockoutSettings.maxAttempts) {
        updates.account_locked_until = new Date(Date.now() + this.lockoutSettings.lockoutDuration);
      }

      await this.repository.updateUser(user.id, updates);

      // Log failed attempt
      await this.logFailedLoginAttempt(user.email, 'invalid_password', options);

    } catch (error) {
      console.error('Error handling failed login:', error);
    }
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedLoginAttempts(userId) {
    try {
      await this.repository.updateUser(userId, {
        failed_login_attempts: 0,
        account_locked_until: null
      });
    } catch (error) {
      console.error('Error resetting failed login attempts:', error);
    }
  }

  /**
   * Log failed login attempt
   */
  async logFailedLoginAttempt(email, reason, options = {}) {
    try {
      await this.createAuditLog({
        customer_id: null,
        user_id: null,
        action: 'failed_login_attempt',
        resource_type: 'user',
        resource_id: null,
        details: {
          email,
          reason,
          ip_address: options.ipAddress,
          user_agent: options.userAgent
        },
        ip_address: options.ipAddress,
        user_agent: options.userAgent
      });
    } catch (error) {
      console.error('Error logging failed login attempt:', error);
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
   * Sanitize user data (remove sensitive fields)
   */
  sanitizeUser(user) {
    if (!user) return null;

    const sanitized = { ...user };
    delete sanitized.password_hash;
    delete sanitized.password_reset_token;
    delete sanitized.password_reset_expires;
    delete sanitized.email_verification_token;
    delete sanitized.email_verification_expires;
    delete sanitized.failed_login_attempts;
    delete sanitized.account_locked_until;

    return sanitized;
  }

  /**
   * Sanitize customer data
   */
  sanitizeCustomer(customer) {
    if (!customer) return null;

    // Return customer data (no sensitive fields to remove currently)
    return customer;
  }

  // ==================== EMAIL SERVICES (PLACEHOLDER) ====================
  
  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user, customer) {
    try {
      // Implement based on your email service (SendGrid, SES, etc.)
      console.log(`Sending welcome email to ${user.email}`);
      
      // Emit event for external email service to handle
      this.emit('sendEmail', {
        type: 'welcome',
        to: user.email,
        data: { user: this.sanitizeUser(user), customer }
      });

    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(user, verificationToken) {
    try {
      console.log(`Sending verification email to ${user.email}`);
      
      this.emit('sendEmail', {
        type: 'emailVerification',
        to: user.email,
        data: { 
          user: this.sanitizeUser(user), 
          verificationToken,
          verificationUrl: `${process.env.APP_URL}/verify-email?token=${verificationToken}`
        }
      });

    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    try {
      console.log(`Sending password reset email to ${user.email}`);
      
      this.emit('sendEmail', {
        type: 'passwordReset',
        to: user.email,
        data: { 
          user: this.sanitizeUser(user), 
          resetToken,
          resetUrl: `${process.env.APP_URL}/reset-password?token=${resetToken}`
        }
      });

    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }
}

export default new UserManagement();

// Also export the class for testing
export { UserManagement };