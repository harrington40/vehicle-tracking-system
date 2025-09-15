import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../lib/theme';

const UserManagementScreen = () => {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  // Sample data - replace with your API calls
  const [users] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'fleet_manager',
      vehicleAccess: 'All Vehicles (47)',
      lastActive: '2 hours ago',
      status: 'active',
      permissions: ['view_all_vehicles', 'manage_drivers', 'view_reports'],
      department: 'Operations'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'dispatcher',
      vehicleAccess: 'Group A (12)',
      lastActive: '1 day ago',
      status: 'active',
      permissions: ['view_live_tracking', 'assign_routes'],
      department: 'Dispatch'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.w@company.com',
      role: 'driver',
      vehicleAccess: 'Vehicle #VH-001',
      lastActive: '5 minutes ago',
      status: 'active',
      permissions: ['view_own_vehicle', 'update_status'],
      department: 'Field Operations'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      email: 'lisa.c@company.com',
      role: 'operations_manager',
      vehicleAccess: 'Region East (23)',
      lastActive: '30 minutes ago',
      status: 'inactive',
      permissions: ['view_assigned_vehicles', 'manage_trips'],
      department: 'Regional Operations'
    }
  ]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Handle delete logic here
          console.log('Delete user:', userId);
        }}
      ]
    );
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => user.role === filterRole);

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
            <Text style={styles.headerTitle}>User Management</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddUser}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>

          {/* Overview Cards */}
          <UserOverviewCards users={users} />

          {/* Filters */}
          <UserFilters 
            filterRole={filterRole} 
            setFilterRole={setFilterRole} 
          />

          {/* Users List */}
          <UserList 
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />

          {/* Access Control Summary */}
          <AccessControlSummary users={users} />

          {/* User Form Modal */}
          <UserFormModal
            visible={showUserForm}
            user={selectedUser}
            onClose={() => setShowUserForm(false)}
            onSave={(userData) => {
              // Handle save logic here
              console.log('Save user:', userData);
              setShowUserForm(false);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default UserManagementScreen;