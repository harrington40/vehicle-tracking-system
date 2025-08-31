import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../lib/theme';

export default function AppMenu({ collapsed = false }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline', path: '/' },
    { name: 'Vehicle Tracking', icon: 'location-outline', path: '/tracking' },
    { name: 'Fleet Management', icon: 'car-outline', path: '/fleet' },
    { name: 'Reports', icon: 'bar-chart-outline', path: '/reports' },
    { name: 'Settings', icon: 'settings-outline', path: '/settings' },
  ];
  
  return (
    <View style={styles.container}>
      {/* App logo */}
      <View style={styles.logoContainer}>
        {!collapsed && <Text style={styles.logoText}>Trans Tech</Text>}
        <View style={styles.logoIcon}>
          <Ionicons name="locate" size={collapsed ? 28 : 24} color="white" />
        </View>
      </View>
      
      {/* Menu items */}
      <ScrollView style={styles.menuScroll}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Pressable
              key={item.name}
              style={({ pressed }) => [
                styles.menuItem,
                isActive && styles.activeMenuItem,
                pressed && styles.pressedMenuItem,
                collapsed && styles.collapsedMenuItem,
              ]}
              onPress={() => router.push(item.path)}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer,
                collapsed && styles.centeredIcon
              ]}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive ? COLORS.primary : COLORS.subtext}
                />
              </View>
              
              {!collapsed && (
                <Text style={[
                  styles.menuText,
                  isActive && styles.activeMenuText
                ]}>
                  {item.name}
                </Text>
              )}
              
              {!collapsed && isActive && (
                <View style={styles.activeIndicator} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      
      {/* Help and logout */}
      <View style={styles.bottomSection}>
        {!collapsed && (
          <Pressable style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.helpText}>Need Help?</Text>
          </Pressable>
        )}
        
        <Pressable style={[styles.logoutButton, collapsed && styles.collapsedLogout]}>
          <Ionicons name="log-out-outline" size={22} color={collapsed ? COLORS.danger : 'white'} />
          {!collapsed && <Text style={styles.logoutText}>Logout</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
    ...SHADOWS.medium,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  logoText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: COLORS.primaryLight,
  },
  pressedMenuItem: {
    backgroundColor: COLORS.hover,
  },
  collapsedMenuItem: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeIconContainer: {
    backgroundColor: 'white',
    ...SHADOWS.small,
  },
  centeredIcon: {
    marginLeft: 0,
  },
  menuText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  activeMenuText: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    height: '50%',
    width: 4,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  bottomSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  helpText: {
    marginLeft: SPACING.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  collapsedLogout: {
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: 'white',
    marginLeft: SPACING.sm,
    fontWeight: FONTS.weights.medium,
  },
});