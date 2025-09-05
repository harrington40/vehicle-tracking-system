import { useAuth0 } from '@auth0/react-native';
import RethinkDBService from '../database/RethinkDBService.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import r from 'rethinkdb';

export class AuthService {
  constructor() {
    this.db = RethinkDBService;
  }

  async getUserFromAuth0(auth0User) {
    try {
      // Find user by Auth0 ID or email
      let user = await this.findUserByAuth0Id(auth0User.sub);
      
      if (!user) {
        // Try to find by email
        const users = await this.db.findByIndex(TABLES.users, 'email', auth0User.email);
        user = users[0];
        
        if (user) {
          // Link Auth0 ID to existing user
          await this.db.update(TABLES.users, user.id, {
            auth0_user_id: auth0User.sub,
            email_verified: auth0User.email_verified
          });
        }
      }

      return user;
    } catch (error) {
      console.error('Error getting user from Auth0:', error);
      throw error;
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

  async getCurrentUserWithSubscription(auth0User) {
    try {
      const user = await this.getUserFromAuth0(auth0User);
      if (!user) return null;

      const customer = await this.db.findById(TABLES.customers, user.customer_id);
      
      // Import BillingService here to avoid circular dependency
      const { default: BillingService } = await import('../business-logic/BillingService.js');
      const subscription = await BillingService.getCustomerSubscription(user.customer_id);

      return {
        user,
        customer,
        subscription,
        permissions: user.permissions || []
      };
    } catch (error) {
      console.error('Error getting current user with subscription:', error);
      throw error;
    }
  }

  async createUserFromAuth0(auth0User, customerId, role = 'owner') {
    try {
      const userData = {
        customer_id: customerId,
        email: auth0User.email,
        first_name: auth0User.given_name || auth0User.name?.split(' ')[0] || 'User',
        last_name: auth0User.family_name || auth0User.name?.split(' ')[1] || '',
        role: role,
        auth0_user_id: auth0User.sub,
        email_verified: auth0User.email_verified || false,
        avatar_url: auth0User.picture,
        password_hash: 'auth0_managed', // Since Auth0 manages passwords
        is_active: true
      };

      const { DataService } = await import('./DataService.js');
      const dataService = new DataService();
      
      return await dataService.createUser(userData);
    } catch (error) {
      console.error('Error creating user from Auth0:', error);
      throw error;
    }
  }

  async linkAuth0ToExistingUser(userId, auth0User) {
    try {
      const updates = {
        auth0_user_id: auth0User.sub,
        email_verified: auth0User.email_verified || false,
        avatar_url: auth0User.picture || null
      };

      return await this.db.update(TABLES.users, userId, updates);
    } catch (error) {
      console.error('Error linking Auth0 to existing user:', error);
      throw error;
    }
  }
}

export default new AuthService();