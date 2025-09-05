import RethinkDBService from '../database/RethinkDBService.js';
import { TABLES } from '../database/rethinkdb-schema.js';
import { SchemaFactory } from '../schemas/SchemaFactory.js';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import cron from 'node-cron';

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
  individual_basic: {
    id: 'individual_basic',
    name: 'Individual Basic',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    devices: 1,
    users: 1,
    features: ['real_time_tracking', 'basic_reports', 'mobile_app'],
    stripe_price_id: 'price_individual_basic'
  },
  individual_premium: {
    id: 'individual_premium',
    name: 'Individual Premium',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    devices: 3,
    users: 2,
    features: ['real_time_tracking', 'advanced_reports', 'geofencing', 'alerts', 'mobile_app', 'api_access'],
    stripe_price_id: 'price_individual_premium'
  },
  business_starter: {
    id: 'business_starter',
    name: 'Business Starter',
    price: 49.99,
    currency: 'usd',
    interval: 'month',
    devices: 5,
    users: 5,
    features: ['real_time_tracking', 'fleet_management', 'advanced_reports', 'api_access', 'geofencing', 'alerts'],
    stripe_price_id: 'price_business_starter'
  },
  business_professional: {
    id: 'business_professional',
    name: 'Business Professional',
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    devices: 15,
    users: 10,
    features: ['all_features', 'priority_support', 'custom_integrations', 'white_label', 'advanced_analytics'],
    stripe_price_id: 'price_business_professional'
  },
  business_enterprise: {
    id: 'business_enterprise',
    name: 'Business Enterprise',
    price: 199.99,
    currency: 'usd',
    interval: 'month',
    devices: -1, // unlimited
    users: -1, // unlimited
    features: ['all_features', '24_7_support', 'custom_development', 'dedicated_account_manager'],
    stripe_price_id: 'price_business_enterprise'
  }
};

export const BILLING_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
  INCOMPLETE: 'incomplete'
};

export class BillingService {
  constructor() {
    this.db = RethinkDBService;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.initializeBillingCron();
  }

  /**
   * Create initial subscription after device purchase
   */
  async createInitialSubscription(customerId, planId = null) {
    try {
      const customer = await this.db.findById(TABLES.customers, customerId);
      if (!customer) throw new Error('Customer not found');

      // Determine default plan based on customer type
      const defaultPlan = planId || this.getDefaultPlan(customer.customer_type);
      const plan = SUBSCRIPTION_PLANS[defaultPlan];

      if (!plan) throw new Error('Invalid subscription plan');

      // Create Stripe customer if doesn't exist
      let stripeCustomer = customer.stripe_customer_id 
        ? await this.stripe.customers.retrieve(customer.stripe_customer_id)
        : await this.createStripeCustomer(customer);

      // Create subscription document
      const subscription = {
        id: uuidv4(),
        customer_id: customerId,
        plan_id: defaultPlan,
        plan_details: plan,
        status: BILLING_STATUS.TRIAL,
        stripe_customer_id: stripeCustomer.id,
        stripe_subscription_id: null,
        trial_start: new Date(),
        trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        auto_renewal: true,
        payment_method: null,
        usage_metrics: {
          devices_used: 0,
          users_created: 1, // Primary user
          api_calls_month: 0,
          data_usage_gb: 0
        },
        billing_history: [],
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await this.db.create(TABLES.subscriptions, subscription);

      // Update customer with stripe customer ID
      await this.db.update(TABLES.customers, customerId, {
        stripe_customer_id: stripeCustomer.id,
        subscription_id: result.id
      });

      // Schedule trial expiry notifications
      await this.scheduleTrialExpiryNotifications(result);

      return result;
    } catch (error) {
      console.error('Error creating initial subscription:', error);
      throw error;
    }
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrialToPaid(subscriptionId, paymentMethodId) {
    try {
      const subscription = await this.db.findById(TABLES.subscriptions, subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      const customer = await this.db.findById(TABLES.customers, subscription.customer_id);
      const plan = SUBSCRIPTION_PLANS[subscription.plan_id];

      // Attach payment method to Stripe customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: subscription.stripe_customer_id
      });

      // Set as default payment method
      await this.stripe.customers.update(subscription.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Create Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: subscription.stripe_customer_id,
        items: [{ price: plan.stripe_price_id }],
        trial_end: Math.floor(subscription.trial_end.getTime() / 1000),
        metadata: {
          customer_id: subscription.customer_id,
          subscription_id: subscriptionId
        }
      });

      // Update subscription
      const updates = {
        status: BILLING_STATUS.ACTIVE,
        stripe_subscription_id: stripeSubscription.id,
        payment_method: await this.getPaymentMethodDetails(paymentMethodId),
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
        next_billing_date: new Date(stripeSubscription.current_period_end * 1000)
      };

      const updatedSubscription = await this.db.update(TABLES.subscriptions, subscriptionId, updates);

      // Send confirmation email
      await this.sendSubscriptionConfirmationEmail(customer, updatedSubscription);

      return updatedSubscription;
    } catch (error) {
      console.error('Error converting trial to paid:', error);
      throw error;
    }
  }

  /**
   * Handle subscription upgrades/downgrades
   */
  async changeSubscriptionPlan(subscriptionId, newPlanId, userId) {
    try {
      const subscription = await this.db.findById(TABLES.subscriptions, subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      const currentPlan = SUBSCRIPTION_PLANS[subscription.plan_id];
      const newPlan = SUBSCRIPTION_PLANS[newPlanId];

      if (!newPlan) throw new Error('Invalid new plan');

      // Check if user has permission to change plan
      const user = await this.db.findById(TABLES.users, userId);
      if (!['owner', 'admin'].includes(user.role)) {
        throw new Error('Insufficient permissions to change subscription');
      }

      // Calculate pro-rated charges
      const prorationDetails = await this.calculateProRatedCharges(subscription, newPlan);

      if (subscription.stripe_subscription_id) {
        // Update Stripe subscription
        await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
          items: [{
            id: subscription.stripe_subscription_id,
            price: newPlan.stripe_price_id
          }],
          proration_behavior: 'always_invoice'
        });
      }

      // Update subscription document
      const updates = {
        plan_id: newPlanId,
        plan_details: newPlan,
        updated_at: new Date()
      };

      const updatedSubscription = await this.db.update(TABLES.subscriptions, subscriptionId, updates);

      // Record billing event
      await this.recordBillingEvent(subscriptionId, 'plan_change', {
        from_plan: currentPlan.id,
        to_plan: newPlan.id,
        proration_amount: prorationDetails.prorationAmount,
        changed_by: userId
      });

      // Check usage limits
      await this.validateUsageLimits(updatedSubscription);

      return updatedSubscription;
    } catch (error) {
      console.error('Error changing subscription plan:', error);
      throw error;
    }
  }

  /**
   * Handle payment failures
   */
  async handlePaymentFailure(subscriptionId, attemptNumber = 1, failureReason) {
    try {
      const subscription = await this.db.findById(TABLES.subscriptions, subscriptionId);
      if (!subscription) return;

      const customer = await this.db.findById(TABLES.customers, subscription.customer_id);

      // Update subscription status
      await this.db.update(TABLES.subscriptions, subscriptionId, {
        status: BILLING_STATUS.PAST_DUE,
        payment_failure_count: (subscription.payment_failure_count || 0) + 1,
        last_payment_failure: new Date(),
        last_failure_reason: failureReason
      });

      // Record billing event
      await this.recordBillingEvent(subscriptionId, 'payment_failure', {
        attempt_number: attemptNumber,
        failure_reason: failureReason,
        retry_scheduled: attemptNumber < 3
      });

      if (attemptNumber <= 3) {
        // Schedule retry
        const retryDate = new Date(Date.now() + (attemptNumber * 24 * 60 * 60 * 1000)); // Retry in 1, 2, 3 days
        await this.schedulePaymentRetry(subscriptionId, retryDate);
        
        // Send payment failure notification
        await this.sendPaymentFailureNotification(customer, subscription, attemptNumber);
      } else {
        // Suspend subscription after 3 failed attempts
        await this.suspendSubscription(subscriptionId, 'payment_failure');
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  /**
   * Suspend subscription
   */
  async suspendSubscription(subscriptionId, reason = 'manual') {
    try {
      const subscription = await this.db.findById(TABLES.subscriptions, subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      // Cancel Stripe subscription
      if (subscription.stripe_subscription_id) {
        await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: false,
          pause_collection: { behavior: 'void' }
        });
      }

      // Update subscription
      const updates = {
        status: BILLING_STATUS.SUSPENDED,
        suspended_at: new Date(),
        suspension_reason: reason
      };

      const updatedSubscription = await this.db.update(TABLES.subscriptions, subscriptionId, updates);

      // Disable customer devices
      await this.disableCustomerDevices(subscription.customer_id);

      // Record billing event
      await this.recordBillingEvent(subscriptionId, 'suspension', { reason });

      // Send suspension notification
      const customer = await this.db.findById(TABLES.customers, subscription.customer_id);
      await this.sendSuspensionNotification(customer, updatedSubscription);

      return updatedSubscription;
    } catch (error) {
      console.error('Error suspending subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate suspended subscription
   */
  async reactivateSubscription(subscriptionId, paymentMethodId = null) {
    try {
      const subscription = await this.db.findById(TABLES.subscriptions, subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      if (subscription.status !== BILLING_STATUS.SUSPENDED) {
        throw new Error('Subscription is not suspended');
      }

      // Update payment method if provided
      if (paymentMethodId) {
        await this.updatePaymentMethod(subscriptionId, paymentMethodId);
      }

      // Reactivate Stripe subscription
      if (subscription.stripe_subscription_id) {
        await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
          pause_collection: null
        });
      }

      // Update subscription
      const updates = {
        status: BILLING_STATUS.ACTIVE,
        suspended_at: null,
        suspension_reason: null,
        reactivated_at: new Date()
      };

      const updatedSubscription = await this.db.update(TABLES.subscriptions, subscriptionId, updates);

      // Re-enable customer devices
      await this.enableCustomerDevices(subscription.customer_id);

      // Record billing event
      await this.recordBillingEvent(subscriptionId, 'reactivation', {});

      return updatedSubscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Calculate pro-rated charges
   */
  async calculateProRatedCharges(subscription, newPlan) {
    const currentPlan = SUBSCRIPTION_PLANS[subscription.plan_id];
    const daysInMonth = 30;
    const currentDate = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    
    const daysRemaining = Math.ceil((periodEnd - currentDate) / (1000 * 60 * 60 * 24));
    const dailyRateCurrent = currentPlan.price / daysInMonth;
    const dailyRateNew = newPlan.price / daysInMonth;
    
    const refundAmount = dailyRateCurrent * daysRemaining;
    const newChargeAmount = dailyRateNew * daysRemaining;
    const prorationAmount = newChargeAmount - refundAmount;

    return {
      refundAmount: Math.round(refundAmount * 100) / 100,
      newChargeAmount: Math.round(newChargeAmount * 100) / 100,
      prorationAmount: Math.round(prorationAmount * 100) / 100,
      daysRemaining
    };
  }

  /**
   * Validate usage against subscription limits
   */
  async validateUsageLimits(subscription) {
    const plan = SUBSCRIPTION_PLANS[subscription.plan_id];
    const customerId = subscription.customer_id;

    // Check device limits
    const devices = await this.db.findByIndex(TABLES.devices, 'customer_id', customerId);
    const activeDevices = devices.filter(d => d.status === 'activated').length;
    
    if (plan.devices !== -1 && activeDevices > plan.devices) {
      // Suspend excess devices
      const excessDevices = devices
        .filter(d => d.status === 'activated')
        .sort((a, b) => new Date(b.activated_at) - new Date(a.activated_at))
        .slice(plan.devices);
      
      for (const device of excessDevices) {
        await this.db.update(TABLES.devices, device.id, { status: 'suspended' });
      }
    }

    // Check user limits
    const users = await this.db.findByIndex(TABLES.users, 'customer_id', customerId);
    const activeUsers = users.filter(u => u.is_active).length;
    
    if (plan.users !== -1 && activeUsers > plan.users) {
      // Deactivate excess users (except owner)
      const excessUsers = users
        .filter(u => u.is_active && u.role !== 'owner')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(plan.users - 1); // -1 for owner
      
      for (const user of excessUsers) {
        await this.db.update(TABLES.users, user.id, { is_active: false });
      }
    }
  }

  /**
   * Get subscription by customer ID
   */
  async getCustomerSubscription(customerId) {
    try {
      const subscriptions = await this.db.findByIndex(TABLES.subscriptions, 'customer_id', customerId);
      return subscriptions.find(s => s.status !== BILLING_STATUS.CANCELLED) || null;
    } catch (error) {
      console.error('Error getting customer subscription:', error);
      return null;
    }
  }

  /**
   * Get billing history
   */
  async getBillingHistory(customerId, limit = 50) {
    try {
      const cursor = await r.table(TABLES.billing_records)
        .getAll(customerId, { index: 'customer_id' })
        .orderBy(r.desc('created_at'))
        .limit(limit)
        .run(this.db.connection);
      
      return await cursor.toArray();
    } catch (error) {
      console.error('Error getting billing history:', error);
      return [];
    }
  }

  // Helper methods
  getDefaultPlan(customerType) {
    return customerType === 'business' ? 'business_starter' : 'individual_basic';
  }

  async createStripeCustomer(customer) {
    return await this.stripe.customers.create({
      email: customer.email,
      name: customer.contact_person,
      metadata: {
        customer_id: customer.id,
        customer_type: customer.customer_type
      }
    });
  }

  async getPaymentMethodDetails(paymentMethodId) {
    const pm = await this.stripe.paymentMethods.retrieve(paymentMethodId);
    return {
      type: pm.type,
      last_four: pm.card?.last4,
      brand: pm.card?.brand,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year
    };
  }

  async recordBillingEvent(subscriptionId, eventType, eventData) {
    const billingRecord = {
      id: uuidv4(),
      subscription_id: subscriptionId,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date()
    };
    
    return await this.db.create(TABLES.billing_records, billingRecord);
  }

  async disableCustomerDevices(customerId) {
    const devices = await this.db.findByIndex(TABLES.devices, 'customer_id', customerId);
    for (const device of devices) {
      if (device.status === 'activated') {
        await this.db.update(TABLES.devices, device.id, { status: 'suspended' });
      }
    }
  }

  async enableCustomerDevices(customerId) {
    const devices = await this.db.findByIndex(TABLES.devices, 'customer_id', customerId);
    for (const device of devices) {
      if (device.status === 'suspended') {
        await this.db.update(TABLES.devices, device.id, { status: 'activated' });
      }
    }
  }

  // Notification methods (implement based on your notification service)
  async sendSubscriptionConfirmationEmail(customer, subscription) {
    // Implement email sending logic
    console.log(`Sending confirmation email to ${customer.email}`);
  }

  async sendPaymentFailureNotification(customer, subscription, attemptNumber) {
    // Implement notification logic
    console.log(`Sending payment failure notification (attempt ${attemptNumber}) to ${customer.email}`);
  }

  async sendSuspensionNotification(customer, subscription) {
    // Implement notification logic
    console.log(`Sending suspension notification to ${customer.email}`);
  }

  async scheduleTrialExpiryNotifications(subscription) {
    // Implement scheduling logic (using node-cron or similar)
    console.log(`Scheduling trial expiry notifications for subscription ${subscription.id}`);
  }

  async schedulePaymentRetry(subscriptionId, retryDate) {
    // Implement retry scheduling logic
    console.log(`Scheduling payment retry for ${subscriptionId} at ${retryDate}`);
  }

  /**
   * Initialize billing cron jobs
   */
  initializeBillingCron() {
    // Daily billing checks at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.processDailyBilling();
    });

    // Trial expiry checks at 9 AM daily
    cron.schedule('0 9 * * *', async () => {
      await this.checkTrialExpiries();
    });
  }

  async processDailyBilling() {
    console.log('Processing daily billing...');
    // Implement daily billing logic
  }

  async checkTrialExpiries() {
    console.log('Checking trial expiries...');
    // Implement trial expiry checking logic
  }
}

export default new BillingService();