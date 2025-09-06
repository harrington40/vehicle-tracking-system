import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Avatar, Divider, Button, Input, Select, CheckIcon,
  Modal, FormControl, useDisclose
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../lib/theme';

const UserManagementScreen = () => {
  const router = useRouter();
  const [filterRole, setFilterRole] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclose();
  const [selectedUser, setSelectedUser] = useState(null);

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
      department: 'Regional Operations'
    }
  ]);

  const getRoleBadgeColor = (role) => {
    const colors = {
      fleet_manager: 'blue.500',
      operations_manager: 'purple.500',
      dispatcher: 'green.500',
      driver: 'orange.500',
      viewer: 'gray.500'
    };
    return colors[role] || 'gray.500';
  };

  const getRoleLabel = (role) => {
    const labels = {
      fleet_manager: 'Fleet Manager',
      operations_manager: 'Operations Mgr',
      dispatcher: 'Dispatcher',
      driver: 'Driver',
      viewer: 'Viewer'
    };
    return labels[role] || role;
  };

  const getStatusColor = (status) => ({
    active: 'green.500',
    inactive: 'red.500',
    pending: 'orange.500'
  }[status]);

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => user.role === filterRole);

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const fleetManagers = users.filter(user => user.role === 'fleet_manager').length;

  const handleEditUser = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    onOpen();
  };

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={4}>
          {/* Header */}
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space={3}>
              <Pressable onPress={() => router.back()}>
                <Icon as={Ionicons} name="arrow-back" size="lg" color={COLORS.text} />
              </Pressable>
              <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
                User Management
              </Text>
            </HStack>
            <Button 
              bg={COLORS.primary} 
              onPress={handleAddUser}
              leftIcon={<Icon as={Ionicons} name="add" size="sm" color="white" />}
              size="sm"
              _pressed={{ bg: 'blue.600' }}
            >
              Add User
            </Button>
          </HStack>

          {/* Overview Cards */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="people" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalUsers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Users</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="person-circle" size="lg" color="green.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{activeUsers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Users</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="star" size="lg" color="purple.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{fleetManagers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Fleet Managers</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Filters */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>User Directory</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={2}>
                {['all', 'fleet_manager', 'dispatcher', 'driver', 'operations_manager'].map((role) => (
                  <Pressable
                    key={role}
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg={filterRole === role ? COLORS.primary : 'white'}
                    borderWidth={1}
                    borderColor={filterRole === role ? COLORS.primary : 'gray.200'}
                    onPress={() => setFilterRole(role)}
                    _pressed={{ opacity: 0.8 }}
                    shadow={filterRole === role ? 1 : 0}
                  >
                    <Text
                      color={filterRole === role ? 'white' : COLORS.text}
                      fontSize="sm"
                      fontWeight="500"
                    >
                      {role === 'all' ? 'All Users' : getRoleLabel(role)}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>

          {/* Users List */}
          <VStack space={3}>
            {filteredUsers.map((user) => (
              <Box key={user.id} bg="white" borderRadius="xl" p={4} shadow={1}>
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <HStack space={3} flex={1}>
                      <Avatar size="md" bg={getRoleBadgeColor(user.role)}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <VStack space={1} flex={1}>
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          {user.name}
                        </Text>
                        <Text fontSize="sm" color={COLORS.subtext}>
                          {user.email}
                        </Text>
                        <Text fontSize="xs" color={COLORS.primary}>
                          {user.vehicleAccess}
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext} fontStyle="italic">
                          {user.department}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <VStack alignItems="flex-end" space={1}>
                      <Badge bg={getRoleBadgeColor(user.role)} borderRadius="md">
                        <Text color="white" fontSize="xs" fontWeight="600">
                          {getRoleLabel(user.role)}
                        </Text>
                      </Badge>
                      
                      <HStack alignItems="center" space={1}>
                        <Box w={2} h={2} borderRadius="full" bg={getStatusColor(user.status)} />
                        <Text fontSize="xs" color={COLORS.subtext} textTransform="capitalize">
                          {user.status}
                        </Text>
                      </HStack>
                      
                      <Text fontSize="xs" color={COLORS.subtext}>
                        {user.lastActive}
                      </Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <HStack space={3} justifyContent="flex-start">
                    <Pressable px={3} py={2} bg="gray.100" borderRadius="md" _pressed={{ bg: 'gray.200' }}>
                      <HStack alignItems="center" space={1}>
                        <Icon as={Ionicons} name="eye" size="xs" color="gray.600" />
                        <Text fontSize="xs" color="gray.600">View</Text>
                      </HStack>
                    </Pressable>
                    
                    <Pressable 
                      px={3} 
                      py={2} 
                      bg="gray.100" 
                      borderRadius="md" 
                      _pressed={{ bg: 'gray.200' }}
                      onPress={() => handleEditUser(user)}
                    >
                      <HStack alignItems="center" space={1}>
                        <Icon as={Ionicons} name="create" size="xs" color="gray.600" />
                        <Text fontSize="xs" color="gray.600">Edit</Text>
                      </HStack>
                    </Pressable>
                    
                    <Pressable px={3} py={2} bg="gray.100" borderRadius="md" _pressed={{ bg: 'gray.200' }}>
                      <HStack alignItems="center" space={1}>
                        <Icon as={Ionicons} name="settings" size="xs" color="gray.600" />
                        <Text fontSize="xs" color="gray.600">Permissions</Text>
                      </HStack>
                    </Pressable>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>

          {/* Access Summary */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>Access Control Summary</Text>
            <HStack space={3}>
              <Box flex={1} bg="white" p={4} borderRadius="lg" alignItems="center" shadow={1}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text} textAlign="center">
                  Vehicle Access
                </Text>
                <Text fontSize="xl" fontWeight="700" color={COLORS.primary} mt={2}>
                  32 users
                </Text>
                <Text fontSize="xs" color={COLORS.subtext} textAlign="center">
                  have vehicle assignments
                </Text>
              </Box>
              
              <Box flex={1} bg="white" p={4} borderRadius="lg" alignItems="center" shadow={1}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text} textAlign="center">
                  Admin Rights
                </Text>
                <Text fontSize="xl" fontWeight="700" color={COLORS.primary} mt={2}>
                  8 users
                </Text>
                <Text fontSize="xs" color={COLORS.subtext} textAlign="center">
                  with admin permissions
                </Text>
              </Box>
              
              <Box flex={1} bg="white" p={4} borderRadius="lg" alignItems="center" shadow={1}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text} textAlign="center">
                  Geofence Access
                </Text>
                <Text fontSize="xl" fontWeight="700" color={COLORS.primary} mt={2}>
                  15 users
                </Text>
                <Text fontSize="xs" color={COLORS.subtext} textAlign="center">
                  can manage geofences
                </Text>
              </Box>
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>

      {/* User Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>{selectedUser ? 'Edit User' : 'Add New User'}</Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <FormControl>
                <FormControl.Label>Full Name</FormControl.Label>
                <Input placeholder="Enter full name" defaultValue={selectedUser?.name} />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Email</FormControl.Label>
                <Input placeholder="Enter email" defaultValue={selectedUser?.email} />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Role</FormControl.Label>
                <Select 
                  selectedValue={selectedUser?.role || 'driver'} 
                  accessibilityLabel="Choose Role" 
                  placeholder="Choose Role" 
                  _selectedItem={{
                    bg: "teal.600",
                    endIcon: <CheckIcon size="5" />
                  }} 
                  mt={1}
                >
                  <Select.Item label="Fleet Manager" value="fleet_manager" />
                  <Select.Item label="Operations Manager" value="operations_manager" />
                  <Select.Item label="Dispatcher" value="dispatcher" />
                  <Select.Item label="Driver" value="driver" />
                  <Select.Item label="Viewer" value="viewer" />
                </Select>
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Department</FormControl.Label>
                <Input placeholder="Enter department" defaultValue={selectedUser?.department} />
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                Cancel
              </Button>
              <Button onPress={onClose}>
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default UserManagementScreen;