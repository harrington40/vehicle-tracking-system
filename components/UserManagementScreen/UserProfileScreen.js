import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../lib/theme';

const UserProfileScreen = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Fleet Manager',
    department: 'Operations',
    employeeId: 'EMP-001',
    location: 'New York Office',
    timezone: 'EST (UTC-5)',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
    maintenanceReminders: true,
    geofenceAlerts: true
  });

  const handleSave = () => {
    // Save profile changes
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const toggleNotification = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>User Profile</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "create"} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Picture & Basic Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
              {isEditing && (
                <TouchableOpacity style={styles.changePhotoButton}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userName}>{profileData.name}</Text>
            <Text style={styles.userRole}>{profileData.role}</Text>
            <Text style={styles.userDepartment}>{profileData.department}</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={profileData.name}
                    onChangeText={(text) => setProfileData({...profileData, name: text})}
                  />
                ) : (
                  <Text style={styles.infoValue}>{profileData.name}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={profileData.email}
                    onChangeText={(text) => setProfileData({...profileData, email: text})}
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profileData.email}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={profileData.phone}
                    onChangeText={(text) => setProfileData({...profileData, phone: text})}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profileData.phone}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employee ID</Text>
                <Text style={styles.infoValue}>{profileData.employeeId}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{profileData.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Timezone</Text>
                <Text style={styles.infoValue}>{profileData.timezone}</Text>
              </View>
            </View>
          </View>

          {/* Notification Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            <View style={styles.infoCard}>
              {Object.entries(notificationSettings).map(([key, value]) => (
                <View key={key} style={styles.notificationRow}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <Text style={styles.notificationDescription}>
                      {getNotificationDescription(key)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, value ? styles.toggleActive : styles.toggleInactive]}
                    onPress={() => toggleNotification(key)}
                  >
                    <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.infoCard}>
              <TouchableOpacity style={styles.securityOption}>
                <View style={styles.securityIcon}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.securityInfo}>
                  <Text style={styles.securityLabel}>Change Password</Text>
                  <Text style={styles.securityDescription}>Update your password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.subtext} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.securityOption}>
                <View style={styles.securityIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.securityInfo}>
                  <Text style={styles.securityLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.securityDescription}>Add extra security to your account</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.subtext} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.securityOption}>
                <View style={styles.securityIcon}>
                  <Ionicons name="time" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.securityInfo}>
                  <Text style={styles.securityLabel}>Login History</Text>
                  <Text style={styles.securityDescription}>View recent login activity</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton}>
              <Ionicons name="log-out-outline" size={20} color="#dc3545" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getNotificationDescription = (key) => {
  const descriptions = {
    emailAlerts: 'Receive important alerts via email',
    pushNotifications: 'Get notifications on your device',
    smsAlerts: 'Receive critical alerts via SMS',
    weeklyReports: 'Weekly fleet performance reports',
    maintenanceReminders: 'Vehicle maintenance notifications',
    geofenceAlerts: 'Geofence entry/exit notifications'
  };
  return descriptions[key] || '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginLeft: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.subtext,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoInput: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleInactive: {
    backgroundColor: '#e0e6ed',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  signOutText: {
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserProfileScreen;