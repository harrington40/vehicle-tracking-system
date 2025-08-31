import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADIUS } from '../../lib/theme';
import { usePathname } from 'expo-router';

export default function Header({ title, subtitle, showAvatar = true, showSearch = true }) {
  const pathname = usePathname();
  
  // Format the current route for display
  const getRouteDisplay = () => {
    if (pathname === '/') return 'Dashboard';
    return pathname.substring(1).charAt(0).toUpperCase() + pathname.slice(2);
  };
  
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title || getRouteDisplay()}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={styles.rightSection}>
        {showSearch && (
          <Pressable style={styles.iconButton}>
            <Ionicons name="search" size={22} color={COLORS.subtext} />
          </Pressable>
        )}
        
        <Pressable style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.subtext} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>2</Text>
          </View>
        </Pressable>
        
        {showAvatar && (
          <Pressable style={styles.avatar}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatarImage}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  leftSection: {
    flexDirection: 'column',
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.subtext,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  notificationCount: {
    color: 'white',
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});