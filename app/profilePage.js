import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Image, 
  Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../lib/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ProfileEditModal from '../components/UserManagement/profileEditModal'; // Your existing modal

const ProfilePage = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [managerProfile, setManagerProfile] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with your actual API calls
      const mockUser = {
        id: userId || 'user_001',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@transtechologies.com',
        role: 'manager',
        avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
        is_active: true,
        created_at: '2020-03-15T00:00:00.000Z',
        updated_at: '2024-09-04T00:00:00.000Z'
      };

      const mockManagerProfile = {
        profile_data: {
          phone_work: '+1 (555) 123-4567',
          phone_mobile: '+1 (555) 987-6543',
          bio: 'Experienced fleet manager with 10+ years in transportation logistics.',
          location: 'San Francisco, CA',
          department: 'Operations',
          position: 'Fleet Manager',
          employee_id: 'EMP001',
          hire_date: '2020-03-15'
        },
        updated_at: '2024-09-04T00:00:00.000Z'
      };

      const mockTeamStats = {
        team_overview: {
          total_drivers: 12,
          active_drivers: 10,
          total_vehicles: 25,
          vehicles_in_use: 22
        }
      };

      setCurrentUser(mockUser);
      
      if (['manager', 'supervisor', 'admin'].includes(mockUser.role)) {
        setManagerProfile(mockManagerProfile);
        setTeamStats(mockTeamStats);
        setIsManager(true);
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (formData) => {
    try {
      // Mock update - replace with your actual API call
      console.log('Updating profile with:', formData);
      
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        first_name: formData.first_name,
        last_name: formData.last_name
      }));

      if (managerProfile) {
        setManagerProfile(prev => ({
          ...prev,
          profile_data: {
            ...prev.profile_data,
            phone_work: formData.phone_work,
            phone_mobile: formData.phone_mobile,
            bio: formData.bio,
            location: formData.location,
            department: formData.department,
            position: formData.position,
            employee_id: formData.employee_id
          }
        }));
      }

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
      throw error;
    }
  };

  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': '#ef4444',
      'manager': '#3b82f6',
      'supervisor': '#06b6d4',
      'driver': '#10b981',
      'viewer': '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color={COLORS.subtext} />
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
        <Text style={styles.breadcrumbText}>User Management</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
        <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileHeader}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: currentUser.avatar_url }}
                style={styles.avatar}
              />
              <View style={[styles.statusIndicator, { 
                backgroundColor: currentUser.is_active ? '#22c55e' : '#6b7280' 
              }]} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentUser.first_name} {currentUser.last_name}
              </Text>
              <View style={styles.roleContainer}>
                <View style={[styles.roleBadge, { 
                  backgroundColor: getRoleBadgeColor(currentUser.role) 
                }]}>
                  <Text style={styles.roleBadgeText}>{formatRole(currentUser.role)}</Text>
                </View>
              </View>
              {managerProfile?.profile_data?.location && (
                <Text style={styles.location}>
                  <Ionicons name="location-outline" size={14} color={COLORS.subtext} />
                  {' '}{managerProfile.profile_data.location}
                </Text>
              )}
            </View>

            <View style={styles.profileActions}>
              <Button
                title="Edit Profile"
                onPress={() => setEditModalVisible(true)}
                style={styles.editButton}
                textStyle={styles.editButtonText}
              />
            </View>
          </View>

          {managerProfile?.profile_data?.bio && (
            <Text style={styles.bio}>{managerProfile.profile_data.bio}</Text>
          )}
        </Card>

        {/* Information Cards */}
        <View style={styles.profileGrid}>
          {/* Basic Information Card */}
          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>
              <Ionicons name="person" size={18} color={COLORS.primary} />
              {' '}Basic Information
            </Text>
            <View style={styles.infoList}>
              <InfoItem label="Full Name" value={`${currentUser.first_name} ${currentUser.last_name}`} />
              <InfoItem label="Email" value={currentUser.email} />
              <InfoItem label="Role" value={formatRole(currentUser.role)} />
              {managerProfile?.profile_data && (
                <>
                  <InfoItem 
                    label="Department" 
                    value={managerProfile.profile_data.department || 'Not specified'} 
                  />
                  <InfoItem 
                    label="Employee ID" 
                    value={managerProfile.profile_data.employee_id || 'Not specified'} 
                  />
                </>
              )}
              <InfoItem 
                label="Member Since" 
                value={new Date(currentUser.created_at).toLocaleDateString()} 
              />
            </View>
          </Card>

          {/* Contact Information Card */}
          <Card style={styles.infoCard}>
            <Text style={styles.cardTitle}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
              {' '}Contact Information
            </Text>
            <View style={styles.contactList}>
              <ContactItem 
                icon="mail-outline" 
                label="Email" 
                value={currentUser.email} 
              />
              {managerProfile?.profile_data && (
                <>
                  <ContactItem 
                    icon="call-outline" 
                    label="Work Phone" 
                    value={managerProfile.profile_data.phone_work || 'Not provided'} 
                  />
                  <ContactItem 
                    icon="phone-portrait-outline" 
                    label="Mobile" 
                    value={managerProfile.profile_data.phone_mobile || 'Not provided'} 
                  />
                </>
              )}
            </View>
          </Card>
        </View>

        {/* Manager-Specific Content */}
        {isManager && teamStats && (
          <Card style={styles.teamOverviewCard}>
            <Text style={styles.cardTitle}>
              <Ionicons name="people" size={20} color={COLORS.primary} />
              {' '}Team Overview
            </Text>
            
            <View style={styles.teamStats}>
              <TeamStat 
                label="Total Drivers" 
                value={teamStats.team_overview.total_drivers}
              />
              <TeamStat 
                label="Active Drivers" 
                value={teamStats.team_overview.active_drivers}
              />
              <TeamStat 
                label="Managed Vehicles" 
                value={teamStats.team_overview.total_vehicles}
              />
              <TeamStat 
                label="Vehicles in Use" 
                value={teamStats.team_overview.vehicles_in_use}
              />
            </View>
          </Card>
        )}
      </View>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleProfileUpdate}
        user={currentUser}
        managerProfile={managerProfile}
        isManager={isManager}
      />
    </ScrollView>
  );
};

// Helper Components
const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ContactItem = ({ icon, label, value }) => (
  <View style={styles.contactItem}>
    <Ionicons name={icon} size={20} color={COLORS.subtext} />
    <View style={styles.contactItemContent}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </View>
);

const TeamStat = ({ label, value }) => (
  <View style={styles.teamStat}>
    <Text style={styles.teamStatValue}>{value}</Text>
    <Text style={styles.teamStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.subtext,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.subtext,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.subtext,
    marginHorizontal: 4,
  },
  breadcrumbActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    padding: 20,
    marginBottom: 16,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: COLORS.subtext,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileActions: {
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  profileGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoCard: {
    flex: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.subtext,
    flex: 1,
    textAlign: 'right',
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.subtext,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  teamOverviewCard: {
    padding: 16,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamStat: {
    alignItems: 'center',
    flex: 1,
  },
  teamStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  teamStatLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    textAlign: 'center',
  },
});

export default ProfilePage;