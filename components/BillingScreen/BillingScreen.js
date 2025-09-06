import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../lib/theme';
import Container from '../layout/Container';
import Card from '../ui/Card';

const BillingScreen = () => {
  const router = useRouter();
  const [billingData] = useState({
    currentBill: 29.99,
    nextPaymentDate: 'July 15, 2024',
    currentPlan: 'Professional',
    paymentMethods: [
      {
        id: 1,
        type: 'Visa',
        lastFour: '1234',
        expiry: '04/2024',
        isDefault: true,
      },
      {
        id: 2,
        type: 'Mastercard',
        lastFour: '5678',
        expiry: '05/2025',
        isDefault: false,
      },
      {
        id: 3,
        type: 'American Express',
        lastFour: '9012',
        expiry: '01/2026',
        isDefault: false,
      },
    ],
    billingHistory: [
      {
        id: '#39201',
        date: '06/15/2024',
        amount: 29.99,
        status: 'pending',
      },
      {
        id: '#38594',
        date: '05/15/2024',
        amount: 29.99,
        status: 'paid',
      },
      {
        id: '#38223',
        date: '04/15/2024',
        amount: 29.99,
        status: 'paid',
      },
      {
        id: '#38125',
        date: '03/15/2024',
        amount: 29.99,
        status: 'paid',
      },
    ],
  });

  const getCardIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'american express':
        return 'card';
      default:
        return 'card';
    }
  };

  const getCardColor = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'american express':
        return '#006FCF';
      default:
        return '#666';
    }
  };

  const getStatusBadge = (status) => {
    const isSuccess = status === 'paid';
    return (
      <View style={[styles.statusBadge, isSuccess ? styles.statusSuccess : styles.statusPending]}>
        <Text style={[styles.statusText, isSuccess ? styles.statusTextSuccess : styles.statusTextPending]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container maxWidth={1280} style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Billing & Subscription</Text>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.navTabs}>
            <TouchableOpacity style={styles.navTab}>
              <Text style={styles.navTabText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
              <Text style={[styles.navTabText, styles.navTabTextActive]}>Billing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navTab}>
              <Text style={styles.navTabText}>Security</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navTab}>
              <Text style={styles.navTabText}>Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* Top Cards Row */}
          <View style={styles.cardsRow}>
            <Card style={[styles.billingCard, styles.cardPrimary]}>
              <Text style={styles.cardSubtitle}>Current monthly bill</Text>
              <Text style={styles.cardAmount}>${billingData.currentBill}</Text>
              <TouchableOpacity style={styles.cardAction}>
                <Text style={styles.cardActionText}>Switch to yearly billing</Text>
                <Ionicons name="arrow-forward" size={16} color="#0061f2" />
              </TouchableOpacity>
            </Card>

            <Card style={[styles.billingCard, styles.cardSecondary]}>
              <Text style={styles.cardSubtitle}>Next payment due</Text>
              <Text style={styles.cardAmount}>{billingData.nextPaymentDate}</Text>
              <TouchableOpacity style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#6900c7' }]}>View payment history</Text>
                <Ionicons name="arrow-forward" size={16} color="#6900c7" />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Bottom Cards Row */}
          <View style={styles.cardsRow}>
            <Card style={[styles.billingCard, styles.cardSuccess]}>
              <Text style={styles.cardSubtitle}>Current plan</Text>
              <Text style={styles.cardAmount}>{billingData.currentPlan}</Text>
              <TouchableOpacity style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#00ac69' }]}>Upgrade plan</Text>
                <Ionicons name="arrow-forward" size={16} color="#00ac69" />
              </TouchableOpacity>
            </Card>

            <Card style={[styles.billingCard, styles.cardWarning]}>
              <Text style={styles.cardSubtitle}>Account status</Text>
              <Text style={styles.cardAmount}>Pending</Text>
              <TouchableOpacity style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: '#f39c12' }]}>Review account</Text>
                <Ionicons name="arrow-forward" size={16} color="#f39c12" />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Payment Methods Section */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>

            {billingData.paymentMethods.map((method, index) => (
              <View key={method.id}>
                <View style={styles.paymentMethod}>
                  <View style={styles.paymentMethodLeft}>
                    <View style={styles.cardIconContainer}>
                      <Ionicons 
                        name={getCardIcon(method.type)} 
                        size={32} 
                        color={getCardColor(method.type)} 
                      />
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodName}>
                        {method.type} ending in {method.lastFour}
                      </Text>
                      <Text style={styles.paymentMethodExpiry}>Expires {method.expiry}</Text>
                    </View>
                  </View>
                  <View style={styles.paymentMethodRight}>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                    <TouchableOpacity>
                      <Text style={styles.editLink}>
                        {method.isDefault ? 'Edit' : 'Make Default'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {index < billingData.paymentMethods.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </Card>

          {/* Billing History Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Billing History</Text>
            
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Transaction ID</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Amount</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
            </View>
            
            {billingData.billingHistory.map((transaction, index) => (
              <View key={transaction.id}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{transaction.id}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{transaction.date}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>${transaction.amount}</Text>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    {getStatusBadge(transaction.status)}
                  </View>
                </View>
                {index < billingData.billingHistory.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </Card>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fc',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  navTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  navTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navTabActive: {
    borderBottomColor: '#0061f2',
  },
  navTabText: {
    fontSize: 16,
    color: '#69707a',
  },
  navTabTextActive: {
    color: '#0061f2',
    fontWeight: '500',
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  billingCard: {
    flex: 1,
    padding: 20,
    borderLeftWidth: 4,
  },
  cardPrimary: {
    borderLeftColor: '#0061f2',
  },
  cardSecondary: {
    borderLeftColor: '#6900c7',
  },
  cardSuccess: {
    borderLeftColor: '#00ac69',
  },
  cardWarning: {
    borderLeftColor: '#f39c12',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#69707a',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: 14,
    color: '#0061f2',
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#0061f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: '#69707a',
  },
  paymentMethodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: COLORS.text,
  },
  editLink: {
    fontSize: 14,
    color: '#0061f2',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e6ed',
    marginHorizontal: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 40, 50, 0.03)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#f8f9fa',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextSuccess: {
    color: '#155724',
  },
  statusTextPending: {
    color: COLORS.text,
  },
});

export default BillingScreen;