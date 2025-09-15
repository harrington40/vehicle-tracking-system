import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton, Image,
  FlatList, Center, Spinner, SearchIcon, AddIcon, useToast,
  AlertDialog, Checkbox, Radio, FormControl, TextArea
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function UserManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclose();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclose();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclose();
  const { isOpen: isPermissionsOpen, onOpen: onPermissionsOpen, onClose: onPermissionsClose } = useDisclose();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclose();

  // Helper function for restoring users
  const handleRestoreUser = (user) => {
    // Implementation would go here
    toast.show({
      title: "User Restored",
      description: `${user.name} has been restored to active status.`,
      status: "success"
    });
  };

  // Helper function for permanent deletion
  const handlePermanentDelete = (user) => {
    // Implementation would go here
    toast.show({
      title: "User Permanently Deleted",
      description: `${user.name} has been permanently deleted from the system.`,
      status: "error"
    });
  };

  // Current manager user (logged in user)
  const currentUser = {
    id: 'USER-MGR-001',
    name: 'Fleet Manager',
    email: 'manager@transtechvtracking.com',
    role: 'fleet_manager',
    permissions: {
      userManagement: true,
      addUsers: true,
      deleteUsers: true,
      managePermissions: true,
      viewAnalytics: true,
      exportData: true,
      systemAdmin: true
    }
  };

  // Comprehensive user management data with OBD telematic integration
  const [users, setUsers] = useState([
    {
      id: 'USER-001',
      employeeId: 'EMP-001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      role: 'driver',
      department: 'logistics',
      status: 'active',
      avatar: 'https://via.placeholder.com/100',
      
      // Personal Information
      personalInfo: {
        dateOfBirth: new Date('1985-03-15'),
        address: '123 Main St, City, State 12345',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1 (555) 987-6543',
          relationship: 'Spouse'
        },
        licenseNumber: 'DL123456789',
        licenseExpiry: new Date('2025-12-31'),
        cdlClass: 'Class B',
        endorsements: ['Hazmat', 'Passenger'],
        medicalCertExpiry: new Date('2025-06-30')
      },

      // Employment Details
      employment: {
        hireDate: new Date('2020-01-15'),
        position: 'Senior Delivery Driver',
        supervisor: 'Fleet Manager',
        salary: 65000,
        payType: 'salary', // hourly, salary, commission
        workSchedule: 'full_time',
        location: 'Main Depot',
        yearsOfService: 4.8
      },

      // Role-Based Permissions & Access Control
      permissions: {
        // Dashboard Access
        viewDashboard: true,
        viewFleetOverview: false,
        viewAnalytics: false,
        
        // Vehicle Management
        viewVehicles: true,
        viewAssignedVehicle: true,
        viewAllVehicles: false,
        editVehicleInfo: false,
        scheduleVehicleMaintenance: false,
        
        // Trip & Route Management
        viewTripHistory: true,
        viewOwnTrips: true,
        viewAllTrips: false,
        createTrips: true,
        editTrips: false,
        deleteTrips: false,
        
        // Maintenance Access
        viewMaintenance: true,
        viewOwnVehicleMaintenance: true,
        viewAllMaintenance: false,
        scheduleMaintenance: false,
        approveMaintenance: false,
        
        // Driver Management
        viewDrivers: false,
        editDriverInfo: false,
        viewDriverPerformance: false,
        
        // OBD & Telematic Data
        viewOBDData: true,
        viewBasicOBDMetrics: true,
        viewAdvancedOBDMetrics: false,
        viewDiagnosticCodes: false,
        viewPredictiveAnalysis: false,
        exportOBDData: false,
        
        // Reporting & Analytics
        viewReports: true,
        viewBasicReports: true,
        viewAdvancedReports: false,
        generateReports: false,
        exportReports: false,
        viewCostAnalysis: false,
        
        // User Management
        viewUsers: false,
        addUsers: false,
        editUsers: false,
        deleteUsers: false,
        managePermissions: false,
        
        // System Administration
        systemSettings: false,
        userAuditLogs: false,
        systemBackup: false,
        integrationSettings: false
      },

      // Driver Performance & OBD Metrics
      performanceMetrics: {
        overallScore: 82,
        safetyScore: 85,
        efficiencyScore: 78,
        complianceScore: 90,
        
        // Driving Behavior Analysis
        drivingBehavior: {
          averageSpeed: 45.2,
          harshBrakingEvents: 23,
          harshAccelerationEvents: 18,
          speedingViolations: 5,
          idleTimePercentage: 12.5,
          fuelEfficiency: 8.4,
          nightDrivingHours: 45,
          weekendDrivingHours: 12
        },
        
        // Trip Statistics
        tripStats: {
          totalTrips: 234,
          totalMiles: 18750,
          totalHours: 412,
          onTimeDeliveries: 220,
          customerRatings: 4.3,
          incidentReports: 2,
          trafficViolations: 3
        },
        
        // Vehicle Assigned
        assignedVehicles: ['VH-001', 'VH-003'],
        primaryVehicle: 'VH-001',
        vehicleExperience: ['Truck', 'Van', 'SUV'],
        
        // Training & Certifications
        certifications: [
          {
            name: 'Defensive Driving',
            issueDate: new Date('2023-01-15'),
            expiryDate: new Date('2025-01-15'),
            status: 'current'
          },
          {
            name: 'Hazmat Handling',
            issueDate: new Date('2022-06-20'),
            expiryDate: new Date('2024-06-20'),
            status: 'expiring_soon'
          },
          {
            name: 'DOT Medical Certificate',
            issueDate: new Date('2023-07-10'),
            expiryDate: new Date('2025-07-10'),
            status: 'current'
          }
        ]
      },

      // Activity & Audit Trail
      activityLog: [
        {
          timestamp: new Date('2024-01-15T08:30:00'),
          action: 'login',
          details: 'Logged into mobile app',
          ipAddress: '192.168.1.100',
          deviceInfo: 'iPhone 14 Pro'
        },
        {
          timestamp: new Date('2024-01-15T09:00:00'),
          action: 'trip_start',
          details: 'Started trip TRIP-001',
          location: 'Fleet Depot'
        },
        {
          timestamp: new Date('2024-01-15T17:30:00'),
          action: 'trip_complete',
          details: 'Completed trip TRIP-001',
          location: 'Fleet Depot'
        }
      ],

      // Compliance & Training Status
      compliance: {
        backgroundCheck: {
          status: 'passed',
          lastUpdated: new Date('2023-01-15'),
          nextDue: new Date('2025-01-15')
        },
        drugScreening: {
          status: 'passed',
          lastUpdated: new Date('2023-12-01'),
          nextDue: new Date('2024-12-01')
        },
        safetyTraining: {
          status: 'current',
          lastCompleted: new Date('2023-11-15'),
          nextDue: new Date('2024-11-15')
        }
      },

      // Notification Preferences
      notificationSettings: {
        email: true,
        sms: true,
        pushNotifications: true,
        tripReminders: true,
        maintenanceAlerts: false,
        performanceReports: true,
        safetyAlerts: true
      },

      createdDate: new Date('2020-01-15'),
      lastLogin: new Date('2024-01-15T08:30:00'),
      isOnline: true,
      deletedDate: null,
      deletedBy: null
    },
    {
      id: 'USER-002',
      employeeId: 'EMP-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      role: 'dispatcher',
      department: 'operations',
      status: 'active',
      avatar: 'https://via.placeholder.com/100',
      
      personalInfo: {
        dateOfBirth: new Date('1990-07-22'),
        address: '456 Oak Ave, City, State 12345',
        emergencyContact: {
          name: 'Mike Johnson',
          phone: '+1 (555) 876-5432',
          relationship: 'Brother'
        },
        licenseNumber: 'DL987654321',
        licenseExpiry: new Date('2026-03-15'),
        cdlClass: 'Class C',
        endorsements: []
      },

      employment: {
        hireDate: new Date('2021-06-01'),
        position: 'Operations Dispatcher',
        supervisor: 'Operations Manager',
        salary: 55000,
        payType: 'salary',
        workSchedule: 'full_time',
        location: 'Operations Center',
        yearsOfService: 2.7
      },

      permissions: {
        // Enhanced permissions for dispatcher role
        viewDashboard: true,
        viewFleetOverview: true,
        viewAnalytics: true,
        
        viewVehicles: true,
        viewAssignedVehicle: true,
        viewAllVehicles: true,
        editVehicleInfo: false,
        scheduleVehicleMaintenance: true,
        
        viewTripHistory: true,
        viewOwnTrips: true,
        viewAllTrips: true,
        createTrips: true,
        editTrips: true,
        deleteTrips: false,
        
        viewMaintenance: true,
        viewOwnVehicleMaintenance: true,
        viewAllMaintenance: true,
        scheduleMaintenance: true,
        approveMaintenance: false,
        
        viewDrivers: true,
        editDriverInfo: false,
        viewDriverPerformance: true,
        
        viewOBDData: true,
        viewBasicOBDMetrics: true,
        viewAdvancedOBDMetrics: true,
        viewDiagnosticCodes: true,
        viewPredictiveAnalysis: false,
        exportOBDData: true,
        
        viewReports: true,
        viewBasicReports: true,
        viewAdvancedReports: true,
        generateReports: true,
        exportReports: true,
        viewCostAnalysis: true,
        
        viewUsers: true,
        addUsers: false,
        editUsers: false,
        deleteUsers: false,
        managePermissions: false,
        
        systemSettings: false,
        userAuditLogs: false,
        systemBackup: false,
        integrationSettings: false
      },

      performanceMetrics: {
        overallScore: 94,
        dispatchEfficiency: 96,
        responseTime: 2.3, // minutes
        routeOptimization: 89,
        
        dispatchStats: {
          totalTripsDispatched: 1250,
          averageResponseTime: 2.3,
          routeOptimizationScore: 89,
          customerSatisfaction: 4.7,
          emergencyResponseTime: 1.2
        }
      },

      activityLog: [
        {
          timestamp: new Date('2024-01-15T07:00:00'),
          action: 'login',
          details: 'Logged into dispatch system',
          ipAddress: '192.168.1.150'
        },
        {
          timestamp: new Date('2024-01-15T07:15:00'),
          action: 'trip_dispatch',
          details: 'Dispatched trip TRIP-001 to John Smith',
          location: 'Operations Center'
        }
      ],

      compliance: {
        backgroundCheck: {
          status: 'passed',
          lastUpdated: new Date('2023-06-01'),
          nextDue: new Date('2025-06-01')
        },
        systemTraining: {
          status: 'current',
          lastCompleted: new Date('2023-10-15'),
          nextDue: new Date('2024-10-15')
        }
      },

      notificationSettings: {
        email: true,
        sms: true,
        pushNotifications: true,
        emergencyAlerts: true,
        systemUpdates: true,
        performanceReports: true
      },

      createdDate: new Date('2021-06-01'),
      lastLogin: new Date('2024-01-15T07:00:00'),
      isOnline: true,
      deletedDate: null,
      deletedBy: null
    },
    {
      id: 'USER-003',
      employeeId: 'EMP-003',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      phone: '+1 (555) 345-6789',
      role: 'technician',
      department: 'maintenance',
      status: 'active',
      avatar: 'https://via.placeholder.com/100',
      
      personalInfo: {
        dateOfBirth: new Date('1982-11-08'),
        address: '789 Pine St, City, State 12345',
        emergencyContact: {
          name: 'Lisa Wilson',
          phone: '+1 (555) 765-4321',
          relationship: 'Wife'
        },
        licenseNumber: 'DL456789123',
        licenseExpiry: new Date('2025-09-20'),
        cdlClass: 'Class A',
        endorsements: ['Air Brakes', 'Combination Vehicle']
      },

      employment: {
        hireDate: new Date('2019-03-10'),
        position: 'Senior Fleet Technician',
        supervisor: 'Maintenance Manager',
        salary: 72000,
        payType: 'salary',
        workSchedule: 'full_time',
        location: 'Maintenance Facility',
        yearsOfService: 5.9
      },

      permissions: {
        // Technician-specific permissions
        viewDashboard: true,
        viewFleetOverview: false,
        viewAnalytics: false,
        
        viewVehicles: true,
        viewAssignedVehicle: true,
        viewAllVehicles: true,
        editVehicleInfo: true,
        scheduleVehicleMaintenance: true,
        
        viewTripHistory: false,
        viewOwnTrips: false,
        viewAllTrips: false,
        createTrips: false,
        editTrips: false,
        deleteTrips: false,
        
        viewMaintenance: true,
        viewOwnVehicleMaintenance: true,
        viewAllMaintenance: true,
        scheduleMaintenance: true,
        approveMaintenance: false,
        
        viewDrivers: false,
        editDriverInfo: false,
        viewDriverPerformance: false,
        
        viewOBDData: true,
        viewBasicOBDMetrics: true,
        viewAdvancedOBDMetrics: true,
        viewDiagnosticCodes: true,
        viewPredictiveAnalysis: true,
        exportOBDData: true,
        
        viewReports: true,
        viewBasicReports: true,
        viewAdvancedReports: false,
        generateReports: false,
        exportReports: false,
        viewCostAnalysis: false,
        
        viewUsers: false,
        addUsers: false,
        editUsers: false,
        deleteUsers: false,
        managePermissions: false,
        
        systemSettings: false,
        userAuditLogs: false,
        systemBackup: false,
        integrationSettings: false
      },

      performanceMetrics: {
        overallScore: 96,
        technicianEfficiency: 98,
        qualityScore: 94,
        responseTime: 15, // minutes
        
        maintenanceStats: {
          totalWorkOrders: 847,
          averageCompletionTime: 2.4, // hours
          qualityRating: 4.8,
          preventiveMaintenanceCompleted: 423,
          emergencyRepairs: 89,
          customerSatisfaction: 4.9
        }
      },

      createdDate: new Date('2019-03-10'),
      lastLogin: new Date('2024-01-15T06:30:00'),
      isOnline: true,
      deletedDate: null,
      deletedBy: null
    },
    // Deleted user example (soft delete - stored for 20 days)
    {
      id: 'USER-004',
      employeeId: 'EMP-004',
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@company.com',
      phone: '+1 (555) 456-7890',
      role: 'driver',
      department: 'logistics',
      status: 'deleted',
      avatar: 'https://via.placeholder.com/100',
      
      employment: {
        hireDate: new Date('2021-08-15'),
        position: 'Delivery Driver',
        terminationDate: new Date('2024-01-01'),
        terminationReason: 'Voluntary resignation'
      },

      deletedDate: new Date('2024-01-01'),
      deletedBy: 'USER-MGR-001',
      deletionReason: 'Employee resignation',
      dataRetentionDays: 20,
      permanentDeleteDate: new Date('2024-01-21')
    }
  ]);

  // Helper functions
  const getRoleColor = (role) => ({
    'fleet_manager': 'purple.500',
    'driver': 'blue.500',
    'dispatcher': 'green.500',
    'technician': 'orange.500',
    'admin': 'red.500'
  }[role] || 'gray.500');

  const getRoleIcon = (role) => ({
    'fleet_manager': 'people',
    'driver': 'car',
    'dispatcher': 'radio',
    'technician': 'construct',
    'admin': 'settings'
  }[role] || 'person');

  const getStatusColor = (status) => ({
    'active': 'green.500',
    'inactive': 'orange.500',
    'suspended': 'red.500',
    'deleted': 'gray.500'
  }[status] || 'gray.500');

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'green.500';
    if (score >= 80) return 'blue.500';
    if (score >= 70) return 'orange.500';
    return 'red.500';
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Show/hide deleted users based on toggle
    if (user.status === 'deleted' && !showDeletedUsers) return false;
    if (user.status !== 'deleted' && showDeletedUsers) return false;
    
    // Search filter
    const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    
    // Status filter (for active users)
    const statusMatch = filterStatus === 'all' || user.status === filterStatus;
    
    return searchMatch && roleMatch && statusMatch;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'role':
        return a.role.localeCompare(b.role);
      case 'department':
        return a.department.localeCompare(b.department);
      case 'performance':
        return (b.performanceMetrics?.overallScore || 0) - (a.performanceMetrics?.overallScore || 0);
      case 'lastLogin':
        return new Date(b.lastLogin) - new Date(a.lastLogin);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const totalActiveUsers = users.filter(u => u.status === 'active').length;
  const totalDrivers = users.filter(u => u.role === 'driver' && u.status === 'active').length;
  const totalDispatchers = users.filter(u => u.role === 'dispatcher' && u.status === 'active').length;
  const totalTechnicians = users.filter(u => u.role === 'technician' && u.status === 'active').length;
  const avgPerformance = users.filter(u => u.status === 'active' && u.performanceMetrics)
    .reduce((sum, u) => sum + u.performanceMetrics.overallScore, 0) / 
    users.filter(u => u.status === 'active' && u.performanceMetrics).length || 0;
  const onlineUsers = users.filter(u => u.isOnline && u.status === 'active').length;

  // Handler functions
  const handleUserDetails = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleAddUser = () => {
    onAddOpen();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    onEditOpen();
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const handleManagePermissions = (user) => {
    setSelectedUser(user);
    onPermissionsOpen();
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      // Soft delete - mark as deleted with 20-day retention
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? {
              ...user,
              status: 'deleted',
              deletedDate: new Date(),
              deletedBy: currentUser.id,
              permanentDeleteDate: new Date(Date.now() + (20 * 24 * 60 * 60 * 1000)) // 20 days
            }
          : user
      );
      
      setUsers(updatedUsers);
      
      toast.show({
        title: "User Deleted",
        description: `${selectedUser.name} has been soft-deleted. Data will be retained for 20 days.`,
        status: "warning"
      });
    }
    onDeleteClose();
  };

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={4}>
          {/* Header with Real-time Indicators */}
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space={3}>
              <Pressable onPress={() => router.back()}>
                <Icon as={Ionicons} name="arrow-back" size="lg" color={COLORS.text} />
              </Pressable>
              <VStack space={1}>
                <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
                  User Management
                </Text>
                <HStack alignItems="center" space={2}>
                  <Circle size="8px" bg="green.500" />
                  <Text fontSize="xs" color={COLORS.subtext}>
                    Live System • {onlineUsers} Online • Updated: {lastUpdated.toLocaleTimeString()}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <HStack space={2}>
              <Button 
                size="sm" 
                variant="outline" 
                borderColor={COLORS.primary}
                _text={{ color: COLORS.primary }}
                onPress={onAnalyticsOpen}
                leftIcon={<Icon as={Ionicons} name="analytics" size="sm" color={COLORS.primary} />}
              >
                Analytics
              </Button>
              <Button 
                size="sm" 
                bg={COLORS.primary}
                leftIcon={<Icon as={Ionicons} name="person-add" size="sm" color="white" />}
                onPress={handleAddUser}
              >
                Add User
              </Button>
            </HStack>
          </HStack>

          {/* User Statistics Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="people" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalActiveUsers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Users</Text>
                <Text fontSize="xs" color="green.500" fontWeight="600">
                  {onlineUsers} Online Now
                </Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="car" size="lg" color="purple.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalDrivers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Drivers</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="radio" size="lg" color="green.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalDispatchers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Dispatchers</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getPerformanceColor(avgPerformance)} shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="trending-up" size="lg" color={getPerformanceColor(avgPerformance)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{Math.round(avgPerformance)}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Performance</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Search and Filters */}
          <Box bg="white" p={4} borderRadius="xl" shadow={2}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                  User Directory & Controls
                </Text>
                <HStack alignItems="center" space={2}>
                  <Text fontSize="sm" color={COLORS.subtext}>Show Deleted</Text>
                  <Switch 
                    isChecked={showDeletedUsers} 
                    onToggle={setShowDeletedUsers}
                    colorScheme="red"
                    size="sm"
                  />
                </HStack>
              </HStack>

              {/* Search Bar */}
              <Input
                placeholder="Search users by name, email, or employee ID..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                bg="gray.50"
                borderRadius="lg"
                fontSize="sm"
                InputLeftElement={
                  <Icon as={Ionicons} name="search" size="sm" color="gray.400" ml={3} />
                }
                InputRightElement={
                  searchQuery ? (
                    <Pressable onPress={() => setSearchQuery('')} mr={3}>
                      <Icon as={Ionicons} name="close" size="sm" color="gray.400" />
                    </Pressable>
                  ) : null
                }
              />

              {/* Filters */}
              <HStack space={3} alignItems="center">
                <Text fontSize="sm" color={COLORS.subtext}>Filters:</Text>
                <Select 
                  selectedValue={filterRole} 
                  onValueChange={setFilterRole}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  minWidth="120px"
                >
                  <Select.Item label="All Roles" value="all" />
                  <Select.Item label="Drivers" value="driver" />
                  <Select.Item label="Dispatchers" value="dispatcher" />
                  <Select.Item label="Technicians" value="technician" />
                  <Select.Item label="Managers" value="fleet_manager" />
                </Select>

                <Select 
                  selectedValue={filterStatus} 
                  onValueChange={setFilterStatus}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  minWidth="120px"
                >
                  <Select.Item label="All Status" value="all" />
                  <Select.Item label="Active" value="active" />
                  <Select.Item label="Inactive" value="inactive" />
                  <Select.Item label="Suspended" value="suspended" />
                </Select>

                <Select 
                  selectedValue={sortBy} 
                  onValueChange={setSortBy}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  minWidth="140px"
                >
                  <Select.Item label="Sort by Name" value="name" />
                  <Select.Item label="Sort by Role" value="role" />
                  <Select.Item label="Sort by Department" value="department" />
                  <Select.Item label="Sort by Performance" value="performance" />
                  <Select.Item label="Sort by Last Login" value="lastLogin" />
                </Select>
              </HStack>
            </VStack>
          </Box>

          {/* User List */}
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                {showDeletedUsers ? 'Deleted Users' : 'Active Users'} ({sortedUsers.length})
              </Text>
              <HStack space={2}>
                <Pressable onPress={() => setIsLoading(!isLoading)}>
                  <HStack alignItems="center" space={1}>
                    <Icon as={Ionicons} name="refresh" size="sm" color={COLORS.primary} />
                    <Text fontSize="sm" color={COLORS.primary} fontWeight="500">Refresh</Text>
                  </HStack>
                </Pressable>
              </HStack>
            </HStack>
            
            {isLoading ? (
              <Center py={8}>
                <Spinner size="lg" color={COLORS.primary} />
                <Text mt={2} color={COLORS.subtext}>Loading user data...</Text>
              </Center>
            ) : (
              sortedUsers.map((user) => (
                <Pressable
                  key={user.id}
                  onPress={() => handleUserDetails(user)}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Box 
                    bg="white" 
                    borderRadius="xl" 
                    p={4} 
                    shadow={2}
                    borderLeftWidth={6}
                    borderLeftColor={user.status === 'deleted' ? 'gray.400' : getRoleColor(user.role)}
                    opacity={user.status === 'deleted' ? 0.7 : 1}
                  >
                    <VStack space={4}>
                      {/* User Header */}
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <HStack space={3} flex={1}>
                          <Box position="relative">
                            <Avatar 
                              size="md" 
                              source={{ uri: user.avatar }}
                              bg={getRoleColor(user.role) + '.100'}
                            >
                              <Icon 
                                as={Ionicons} 
                                name={getRoleIcon(user.role)} 
                                color={getRoleColor(user.role)} 
                                size="sm" 
                              />
                            </Avatar>
                            {user.isOnline && user.status === 'active' && (
                              <Circle 
                                size="12px" 
                                bg="green.500" 
                                position="absolute" 
                                bottom="0px" 
                                right="0px"
                                borderWidth={2}
                                borderColor="white"
                              />
                            )}
                          </Box>
                          <VStack space={1} flex={1}>
                            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                              {user.name}
                            </Text>
                            <Text fontSize="sm" color={COLORS.subtext}>
                              {user.email}
                            </Text>
                            <HStack alignItems="center" space={2}>
                              <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                                {user.employeeId}
                              </Text>
                              <Badge bg={getRoleColor(user.role)} borderRadius="md" size="sm">
                                <Text color="white" fontSize="xs" fontWeight="600">
                                  {user.role.replace('_', ' ').toUpperCase()}
                                </Text>
                              </Badge>
                              <Badge bg={getStatusColor(user.status)} borderRadius="md" size="sm">
                                <Text color="white" fontSize="xs" fontWeight="600">
                                  {user.status.toUpperCase()}
                                </Text>
                              </Badge>
                              {user.performanceMetrics && (
                                <Badge bg={getPerformanceColor(user.performanceMetrics.overallScore)} borderRadius="md" size="sm">
                                  <Text color="white" fontSize="xs" fontWeight="600">
                                    {user.performanceMetrics.overallScore}% PERF
                                  </Text>
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                        
                        <VStack alignItems="flex-end" space={1}>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {user.department}
                          </Text>
                          <Text fontSize="xs" color={COLORS.subtext}>
                            Last: {user.lastLogin?.toLocaleDateString()}
                          </Text>
                          {user.employment?.yearsOfService && (
                            <Text fontSize="xs" fontWeight="600" color={COLORS.text}>
                              {user.employment.yearsOfService.toFixed(1)}y service
                            </Text>
                          )}
                        </VStack>
                      </HStack>

                      {/* User Details */}
                      {user.status !== 'deleted' && (
                        <VStack space={3}>
                          <HStack space={4} justifyContent="space-between">
                            <VStack alignItems="center" space={1}>
                              <Icon as={Ionicons} name="call" size="sm" color="blue.500" />
                              <Text fontSize="xs" color={COLORS.subtext}>Phone</Text>
                              <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                {user.phone}
                              </Text>
                            </VStack>
                            
                            <VStack alignItems="center" space={1}>
                              <Icon as={Ionicons} name="business" size="sm" color="purple.500" />
                              <Text fontSize="xs" color={COLORS.subtext}>Position</Text>
                              <Text fontSize="sm" fontWeight="600" color={COLORS.text} textAlign="center">
                                {user.employment?.position || 'N/A'}
                              </Text>
                            </VStack>
                            
                            {user.performanceMetrics && (
                              <VStack alignItems="center" space={1}>
                                <Icon as={Ionicons} name="speedometer" size="sm" color={getPerformanceColor(user.performanceMetrics.overallScore)} />
                                <Text fontSize="xs" color={COLORS.subtext}>Performance</Text>
                                <Text fontSize="sm" fontWeight="600" color={getPerformanceColor(user.performanceMetrics.overallScore)}>
                                  {user.performanceMetrics.overallScore}%
                                </Text>
                              </VStack>
                            )}
                            
                            <VStack alignItems="center" space={1}>
                              <Icon as={Ionicons} name="shield-checkmark" size="sm" color="green.500" />
                              <Text fontSize="xs" color={COLORS.subtext}>Access Level</Text>
                              <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                {Object.values(user.permissions).filter(Boolean).length} perms
                              </Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      )}

                      {/* Deleted User Info */}
                      {user.status === 'deleted' && (
                        <Box bg="red.50" p={3} borderRadius="lg">
                          <VStack space={2}>
                            <Text fontSize="sm" fontWeight="600" color="red.700">
                              User Deleted
                            </Text>
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color="red.600">Deleted Date:</Text>
                              <Text fontSize="xs" color="red.600">{user.deletedDate?.toLocaleDateString()}</Text>
                            </HStack>
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color="red.600">Permanent Delete:</Text>
                              <Text fontSize="xs" color="red.600">{user.permanentDeleteDate?.toLocaleDateString()}</Text>
                            </HStack>
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color="red.600">Reason:</Text>
                              <Text fontSize="xs" color="red.600">{user.deletionReason || 'Not specified'}</Text>
                            </HStack>
                          </VStack>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      {user.status !== 'deleted' && (
                        <>
                          <Divider />
                          <HStack space={2} justifyContent="space-between">
                            <Pressable 
                              px={3} 
                              py={2} 
                              bg="blue.100" 
                              borderRadius="md" 
                              _pressed={{ bg: 'blue.200' }}
                              flex={1}
                              onPress={() => handleEditUser(user)}
                            >
                              <HStack alignItems="center" justifyContent="center" space={1}>
                                <Icon as={Ionicons} name="create" size="xs" color="blue.600" />
                                <Text fontSize="xs" color="blue.600" fontWeight="600">Edit</Text>
                              </HStack>
                            </Pressable>
                            
                            <Pressable 
                              px={3} 
                              py={2} 
                              bg="green.100" 
                              borderRadius="md" 
                              _pressed={{ bg: 'green.200' }}
                              flex={1}
                              onPress={() => handleManagePermissions(user)}
                            >
                              <HStack alignItems="center" justifyContent="center" space={1}>
                                <Icon as={Ionicons} name="shield-checkmark" size="xs" color="green.600" />
                                <Text fontSize="xs" color="green.600" fontWeight="600">Permissions</Text>
                              </HStack>
                            </Pressable>
                            
                            <Pressable 
                              px={3} 
                              py={2} 
                              bg="purple.100" 
                              borderRadius="md" 
                              _pressed={{ bg: 'purple.200' }}
                              flex={1}
                            >
                              <HStack alignItems="center" justifyContent="center" space={1}>
                                <Icon as={Ionicons} name="time" size="xs" color="purple.600" />
                                <Text fontSize="xs" color="purple.600" fontWeight="600">Activity</Text>
                              </HStack>
                            </Pressable>
                            
                            <Pressable 
                              px={3} 
                              py={2} 
                              bg="red.100" 
                              borderRadius="md" 
                              _pressed={{ bg: 'red.200' }}
                              flex={1}
                              onPress={() => handleDeleteUser(user)}
                            >
                              <HStack alignItems="center" justifyContent="center" space={1}>
                                <Icon as={Ionicons} name="trash" size="xs" color="red.600" />
                                <Text fontSize="xs" color="red.600" fontWeight="600">Delete</Text>
                              </HStack>
                            </Pressable>
                          </HStack>
                        </>
                      )}

                      {/* Restore/Permanently Delete for Deleted Users */}
                      {user.status === 'deleted' && (
                        <>
                          <Divider />
                          <HStack space={2} justifyContent="space-between">
                            <Pressable 
                              px={3} 
                              py={2} 
                              bg="green.100" 
                              borderRadius="md" 
                              _pressed={{ bg: 'green.200' }}
                              flex={1}
                              onPress={() => handleRestoreUser(user)}
                            >
                              <HStack alignItems="center" justifyContent="center" space={1}>
                                <Icon as={Ionicons} name="refresh" size="xs" color="green.600" />
                                <Text fontSize="xs" color="green.600" fontWeight="600">Restore</Text>
                              </HStack>
                            </Pressable>
                            
                            <Pressable 
                              px={3} 
                              py={2} 
                              bg="red.100" 
                              borderRadius="md" 
                              _pressed={{ bg: 'red.200' }}
                              flex={1}
                              onPress={() => handlePermanentDelete(user)}
                            >
                              <HStack alignItems="center" justifyContent="center" space={1}>
                                <Icon as={Ionicons} name="trash-bin" size="xs" color="red.600" />
                                <Text fontSize="xs" color="red.600" fontWeight="600">Permanent</Text>
                              </HStack>
                            </Pressable>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </Box>
                </Pressable>
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedUser ? `${selectedUser.name} - User Details` : 'User Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Personal Information */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Personal Information
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Employee ID</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedUser.employeeId}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Email</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedUser.email}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Phone</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedUser.phone}</Text>
                    </HStack>
                    {selectedUser.personalInfo && (
                      <>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Date of Birth</Text>
                          <Text fontSize="sm" color={COLORS.text}>
                            {selectedUser.personalInfo.dateOfBirth.toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>License Number</Text>
                          <Text fontSize="sm" color={COLORS.text}>{selectedUser.personalInfo.licenseNumber}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>CDL Class</Text>
                          <Text fontSize="sm" color={COLORS.text}>{selectedUser.personalInfo.cdlClass}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Medical Cert Expiry</Text>
                          <Text fontSize="sm" color={selectedUser.personalInfo.medicalCertExpiry > new Date() ? 'green.500' : 'red.500'}>
                            {selectedUser.personalInfo.medicalCertExpiry.toLocaleDateString()}
                          </Text>
                        </HStack>
                        {selectedUser.personalInfo.endorsements.length > 0 && (
                          <VStack space={1}>
                            <Text fontSize="sm" color={COLORS.subtext}>Endorsements</Text>
                            <HStack space={2} flexWrap="wrap">
                              {selectedUser.personalInfo.endorsements.map((endorsement, index) => (
                                <Badge key={index} bg="blue.500" borderRadius="md" size="sm">
                                  <Text color="white" fontSize="xs">{endorsement}</Text>
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                        )}
                      </>
                    )}
                  </VStack>

                  <Divider />

                  {/* Employment Information */}
                  {selectedUser.employment && (
                    <>
                      <VStack space={3}>
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          Employment Information
                        </Text>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Position</Text>
                          <Text fontSize="sm" color={COLORS.text}>{selectedUser.employment.position}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Department</Text>
                          <Text fontSize="sm" color={COLORS.text}>{selectedUser.department}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Hire Date</Text>
                          <Text fontSize="sm" color={COLORS.text}>
                            {selectedUser.employment.hireDate.toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Years of Service</Text>
                          <Text fontSize="sm" color={COLORS.text}>
                            {selectedUser.employment.yearsOfService?.toFixed(1)} years
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Supervisor</Text>
                          <Text fontSize="sm" color={COLORS.text}>{selectedUser.employment.supervisor}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Work Schedule</Text>
                          <Text fontSize="sm" color={COLORS.text} textTransform="capitalize">
                            {selectedUser.employment.workSchedule?.replace('_', ' ')}
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Location</Text>
                          <Text fontSize="sm" color={COLORS.text}>{selectedUser.employment.location}</Text>
                        </HStack>
                      </VStack>
                      <Divider />
                    </>
                  )}

                  {/* Rest of modal content */}
                </VStack>
              </ScrollView>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                Close
              </Button>
              {selectedUser?.status !== 'deleted' && (
                <Button bg={COLORS.primary} onPress={() => {
                  onClose();
                  handleEditUser(selectedUser);
                }}>
                  Edit User
                </Button>
              )}
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Add New User</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <FormControl>
                <FormControl.Label>Full Name</FormControl.Label>
                <Input placeholder="Enter full name" />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Email Address</FormControl.Label>
                <Input placeholder="Enter email address" />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Phone Number</FormControl.Label>
                <Input placeholder="Enter phone number" />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Role</FormControl.Label>
                <Select placeholder="Select role">
                  <Select.Item label="Driver" value="driver" />
                  <Select.Item label="Dispatcher" value="dispatcher" />
                  <Select.Item label="Technician" value="technician" />
                  <Select.Item label="Fleet Manager" value="fleet_manager" />
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Department</FormControl.Label>
                <Select placeholder="Select department">
                  <Select.Item label="Logistics" value="logistics" />
                  <Select.Item label="Operations" value="operations" />
                  <Select.Item label="Maintenance" value="maintenance" />
                  <Select.Item label="Administration" value="administration" />
                </Select>
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onAddClose}>
                Cancel
              </Button>
              <Button bg={COLORS.primary} onPress={onAddClose}>
                Create User
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      {/* Edit User Modal - Add this missing modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedUser ? `Edit User - ${selectedUser.name}` : 'Edit User'}
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <VStack space={4}>
                <FormControl>
                  <FormControl.Label>Full Name</FormControl.Label>
                  <Input defaultValue={selectedUser.name} />
                </FormControl>
                
                <FormControl>
                  <FormControl.Label>Email Address</FormControl.Label>
                  <Input defaultValue={selectedUser.email} />
                </FormControl>
                
                <FormControl>
                  <FormControl.Label>Phone Number</FormControl.Label>
                  <Input defaultValue={selectedUser.phone} />
                </FormControl>

                <FormControl>
                  <FormControl.Label>Status</FormControl.Label>
                  <Select selectedValue={selectedUser.status}>
                    <Select.Item label="Active" value="active" />
                    <Select.Item label="Inactive" value="inactive" />
                    <Select.Item label="Suspended" value="suspended" />
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormControl.Label>Role</FormControl.Label>
                  <Select selectedValue={selectedUser.role}>
                    <Select.Item label="Driver" value="driver" />
                    <Select.Item label="Dispatcher" value="dispatcher" />
                    <Select.Item label="Technician" value="technician" />
                    <Select.Item label="Fleet Manager" value="fleet_manager" />
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormControl.Label>Department</FormControl.Label>
                  <Select selectedValue={selectedUser.department}>
                    <Select.Item label="Logistics" value="logistics" />
                    <Select.Item label="Operations" value="operations" />
                    <Select.Item label="Maintenance" value="maintenance" />
                    <Select.Item label="Administration" value="administration" />
                  </Select>
                </FormControl>

                {selectedUser.employment && (
                  <FormControl>
                    <FormControl.Label>Position</FormControl.Label>
                    <Input defaultValue={selectedUser.employment.position} />
                  </FormControl>
                )}

                <Box bg="orange.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <Text fontSize="sm" fontWeight="600" color="orange.700">
                      Permission Changes
                    </Text>
                    <Text fontSize="xs" color="orange.600">
                      Role changes may affect user permissions. Review permissions after updating the role.
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onEditClose}>
                Cancel
              </Button>
              <Button bg={COLORS.primary} onPress={() => {
                toast.show({
                  title: "User Updated",
                  description: "User information has been successfully updated.",
                  status: "success"
                });
                onEditClose();
              }}>
                Update User
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>


      {/* Permissions Management Modal */}
      <Modal isOpen={isPermissionsOpen} onClose={onPermissionsClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedUser ? `Manage Permissions - ${selectedUser.name}` : 'Manage Permissions'}
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  <Text fontSize="sm" color={COLORS.subtext}>
                    Configure access permissions for {selectedUser.name} ({selectedUser.role})
                  </Text>
                  
                  {/* Permission Categories */}
                  {[
                    { title: 'Dashboard Access', permissions: ['viewDashboard', 'viewFleetOverview', 'viewAnalytics'] },
                    { title: 'Vehicle Management', permissions: ['viewVehicles', 'viewAllVehicles', 'editVehicleInfo', 'scheduleVehicleMaintenance'] },
                    { title: 'Trip Management', permissions: ['viewTripHistory', 'viewAllTrips', 'createTrips', 'editTrips', 'deleteTrips'] },
                    { title: 'Maintenance', permissions: ['viewMaintenance', 'viewAllMaintenance', 'scheduleMaintenance', 'approveMaintenance'] },
                    { title: 'OBD & Telematic Data', permissions: ['viewOBDData', 'viewAdvancedOBDMetrics', 'viewDiagnosticCodes', 'viewPredictiveAnalysis', 'exportOBDData'] },
                    { title: 'Reporting', permissions: ['viewReports', 'viewAdvancedReports', 'generateReports', 'exportReports', 'viewCostAnalysis'] },
                    { title: 'User Management', permissions: ['viewUsers', 'addUsers', 'editUsers', 'deleteUsers', 'managePermissions'] },
                    { title: 'System Administration', permissions: ['systemSettings', 'userAuditLogs', 'systemBackup', 'integrationSettings'] }
                  ].map((category) => (
                    <Box key={category.title} bg="gray.50" p={4} borderRadius="lg">
                      <VStack space={3}>
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          {category.title}
                        </Text>
                        {category.permissions.map((permission) => (
                          selectedUser.permissions.hasOwnProperty(permission) && (
                            <HStack key={permission} justifyContent="space-between" alignItems="center">
                              <Text fontSize="sm" color={COLORS.text} textTransform="capitalize" flex={1}>
                                {permission.replace(/([A-Z])/g, ' $1').trim()}
                              </Text>
                              <Switch 
                                isChecked={selectedUser.permissions[permission]} 
                                colorScheme="green"
                                size="sm"
                              />
                            </HStack>
                          )
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </ScrollView>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onPermissionsClose}>
                Cancel
              </Button>
              <Button bg={COLORS.primary} onPress={onPermissionsClose}>
                Save Permissions
              </Button>
            </Button.Group>
          </Modal.Footer>
    </Modal.Content>
  </Modal>

  {/* Delete Confirmation Alert Dialog */}
  <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
    <AlertDialog.Content>
      <AlertDialog.CloseButton />
      <AlertDialog.Header>Delete User Account</AlertDialog.Header>
      <AlertDialog.Body>
        {selectedUser && (
          <VStack space={3}>
            <Text>
              Are you sure you want to delete <Text fontWeight="600">{selectedUser.name}</Text>'s account?
            </Text>
            <Box bg="orange.50" p={3} borderRadius="lg">
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color="orange.700">
                  📋 Soft Delete Policy (20-Day Retention)
                </Text>
                <Text fontSize="sm" color="orange.600">
                  • User will be immediately deactivated and unable to login
                </Text>
                <Text fontSize="sm" color="orange.600">
                  • All user data preserved for 20 days for compliance
                </Text>
                <Text fontSize="sm" color="orange.600">
                  • Trip history and OBD data will be anonymized
                </Text>
                <Text fontSize="sm" color="orange.600">
                  • Account can be restored within 20-day window
                </Text>
                <Text fontSize="sm" color="orange.600">
                  • Permanent deletion occurs automatically after 20 days
                </Text>
              </VStack>
            </Box>
            <Box bg="red.50" p={3} borderRadius="lg">
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color="red.700">
                  ⚠️ Impact Assessment
                </Text>
                <Text fontSize="sm" color="red.600">
                  • Active trips will need reassignment
                </Text>
                <Text fontSize="sm" color="red.600">
                  • Scheduled maintenance tasks will be unassigned
                </Text>
                <Text fontSize="sm" color="red.600">
                  • Access to all systems will be immediately revoked
                </Text>
              </VStack>
            </Box>
          </VStack>
        )}
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <Button.Group space={2}>
          <Button variant="unstyled" colorScheme="coolGray" onPress={onDeleteClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onPress={confirmDeleteUser}>
            Delete
          </Button>
        </Button.Group>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog>

    {/* Analytics Modal */}
    <Modal isOpen={isAnalyticsOpen} onClose={onAnalyticsClose} size="lg">
      <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>User Management Analytics</Modal.Header>
              <Modal.Body>
                <VStack space={4}>
                  <Text fontSize="sm" color={COLORS.subtext}>
                    Comprehensive user management and performance analytics
                  </Text>
                  
                  <VStack space={3}>
                    <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                      User Statistics Overview
                    </Text>
                    <Box bg="gray.50" p={3} borderRadius="lg">
                      <VStack space={2}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Total Active Users</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>{totalActiveUsers}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Currently Online</Text>
                          <Text fontSize="sm" fontWeight="600" color="green.500">{onlineUsers}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Total Drivers</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>{totalDrivers}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Total Dispatchers</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>{totalDispatchers}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Total Technicians</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>{totalTechnicians}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Average Performance</Text>
                          <Text fontSize="sm" fontWeight="600" color={getPerformanceColor(avgPerformance)}>
                            {Math.round(avgPerformance)}%
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Best Performer</Text>
                          <Text fontSize="sm" fontWeight="600" color="green.500">
                            Mike Wilson (96%)
                          </Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Compliance Rate</Text>
                          <Text fontSize="sm" fontWeight="600" color="green.500">
                            94.2%
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
    
                    <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                      User Activity Insights
                    </Text>
                    <Box bg="gray.50" p={3} borderRadius="lg">
                      <VStack space={2}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Daily Active Users</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>89%</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Avg Session Duration</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>4.2 hours</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Security Incidents</Text>
                          <Text fontSize="sm" fontWeight="600" color="green.500">0 this month</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext}>Permission Changes</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>12 this week</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </VStack>
              </Modal.Body>
              <Modal.Footer>
                <Button.Group space={2}>
                  <Button variant="ghost" colorScheme="blueGray" onPress={onAnalyticsClose}>
                    Close
                  </Button>
                  <Button bg={COLORS.primary} onPress={onAnalyticsClose}>
                    Export Report
                  </Button>
                </Button.Group>
              </Modal.Footer>
      </Modal.Content>
    </Modal>
      </Box>
    );
  }