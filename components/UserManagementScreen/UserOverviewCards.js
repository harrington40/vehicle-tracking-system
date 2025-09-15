import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/theme';

const UserOverviewCards = ({ users }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const fleetManagers = users.filter(user => user.role === 'fleet_manager').length;
  const pendingInvites = 3; // This would come from your API

  const cards = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      icon: 'people',
      color: COLORS.primary,
      bgColor: COLORS.primary + '20'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      icon: 'person-circle',
      color: '#00ac69',
      bgColor: '#00ac6920',
      badge: '+2'
    },
    {
      title: 'Pending Invites',
      value: pendingInvites.toString(),
      icon: 'mail',
      color: '#f39c12',
      bgColor: '#f39c1220'
    },
    {
      title: 'Fleet Managers',
      value: fleetManagers.toString(),
      icon: 'star',
      color: '#6900c7',
      bgColor: '#6900c720'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.cardsGrid}>
        {cards.map((card, index) => (
          <View key={index} style={[styles.card, { borderLeftColor: card.color }]}>
            <View style={[styles.cardIcon, { backgroundColor: card.bgColor }]}>
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            {card.badge && (
              <View style={[styles.badge, { backgroundColor: card.color }]}>
                <Text style={styles.badgeText}>{card.badge}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
});

export default UserOverviewCards;