import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Avatar, Divider, Button, Input, Select, CheckIcon,
  Modal, FormControl, useDisclose, Progress, Spinner
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function VehiclesPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclose();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Sample vehicle data with OBD telematic information
  const [vehicles] = useState([
    {
      id: 'VH-001',
      name: 'Fleet Truck 001',
      make: 'Ford',
      model: 'Transit',
      year: '2023',
      licensePlate: 'ABC-1234',
      vin: '1FTBW2CM5JKA12345',
      driver: 'John Smith',
      status: 'active',
      location: 'Downtown Warehouse',
      lastUpdate: '2 min ago',
      // OBD Data
      odometer: 45234,
      fuelLevel: 78,
      engineHealth: 95,
      batteryVoltage: 12.4,
      engineTemp: 87,
      speed: 0,
      // Trip Data
      todayDistance: 234,
      weeklyDistance: 1456,
      monthlyDistance: 5678,
      // Alerts
      alerts: ['Maintenance Due'],
      nextService: '2024-01-15',
      avgFuelConsumption: 8.5
    },
    {
      id: 'VH-002',
      name: 'Delivery Van 002',
      make: 'Mercedes',
      model: 'Sprinter',
      year: '2022',
      licensePlate: 'XYZ-5678',
      vin: '2FTBW2CM5JKA67890',
      driver: 'Sarah Johnson',
      status: 'driving',
      location: 'Route 45 - Mile 23',
      lastUpdate: '1 min ago',
      // OBD Data
      odometer: 67890,
      fuelLevel: 45,
      engineHealth: 92,
      batteryVoltage: 12.6,
      engineTemp: 92,
      speed: 65,
      // Trip Data
      todayDistance: 456,
      weeklyDistance: 2134,
      monthlyDistance: 8765,
      // Alerts
      alerts: ['Low Fuel'],
      nextService: '2024-02-20',
      avgFuelConsumption: 9.2
    },
    {
      id: 'VH-003',
      name: 'Service Truck 003',
      make: 'Chevrolet',
      model: 'Silverado',
      year: '2023',
      licensePlate: 'DEF-9012',
      vin: '3FTBW2CM5JKA34567',
      driver: 'Mike Wilson',
      status: 'maintenance',
      location: 'Service Center',
      lastUpdate: '3 hours ago',
      // OBD Data
      odometer: 23456,
      fuelLevel: 90,
      engineHealth: 88,
      batteryVoltage: 12.1,
      engineTemp: 0,
      speed: 0,
      // Trip Data
      todayDistance: 0,
      weeklyDistance: 789,
      monthlyDistance: 3456,
      // Alerts
      alerts: ['Scheduled Maintenance', 'Oil Change Required'],
      nextService: '2024-01-10',
      avgFuelConsumption: 10.1
    },
    {
      id: 'VH-004',
      name: 'Cargo Van 004',
      make: 'Ram',
      model: 'ProMaster',
      year: '2021',
      licensePlate: 'GHI-3456',
      vin: '4FTBW2CM5JKA78901',
      driver: 'Lisa Chen',
      status: 'idle',
      location: 'Parking Lot A',
      lastUpdate: '15 min ago',
      // OBD Data
      odometer: 89012,
      fuelLevel: 62,
      engineHealth: 90,
      batteryVoltage: 12.3,
      engineTemp: 85,
      speed: 0,
      // Trip Data
      todayDistance: 123,
      weeklyDistance: 1098,
      monthlyDistance: 4321,
      // Alerts
      alerts: [],
      nextService: '2024-03-15',
      avgFuelConsumption: 7.8
    }
  ]);

  const getStatusColor = (status) => ({
    active: 'green.500',
    driving: 'blue.500',
    idle: 'orange.500',
    maintenance: 'red.500',
    offline: 'gray.500'
  }[status]);

  const getStatusLabel = (status) => ({
    active: 'Active',
    driving: 'Driving',
    idle: 'Idle',
    maintenance: 'Maintenance',
    offline: 'Offline'
  }[status]);

  const getEngineHealthColor = (health) => {
    if (health >= 90) return 'green.500';
    if (health >= 70) return 'orange.500';
    return 'red.500';
  };

  const getFuelLevelColor = (level) => {
    if (level >= 50) return 'green.500';
    if (level >= 25) return 'orange.500';
    return 'red.500';
  };

  const filteredVehicles = filterStatus === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.status === filterStatus);

  const searchedVehicles = searchQuery
    ? filteredVehicles.filter(vehicle => 
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredVehicles;

  const handleVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    onOpen();
  };

  // Calculate fleet statistics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'driving').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const avgFuelLevel = Math.round(vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length);

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
                Fleet Vehicles
              </Text>
            </HStack>
            <Button 
              bg={COLORS.primary} 
              onPress={onOpen}
              leftIcon={<Icon as={Ionicons} name="add" size="sm" color="white" />}
              size="sm"
              _pressed={{ bg: 'green.600' }}
            >
              Add Vehicle
            </Button>
          </HStack>

          {/* Fleet Overview Cards */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="car-sport" size="lg" color="green.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Fleet</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="checkmark-circle" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{activeVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="red.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="build" size="lg" color="red.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{maintenanceVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Maintenance</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="orange.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="water" size="lg" color="orange.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgFuelLevel}%</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Fuel</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Search and Filters */}
          <VStack space={3}>
            <Input
              placeholder="Search vehicles, plates, or drivers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftElement={<Icon as={Ionicons} name="search" size="sm" color="gray.400" ml={3} />}
              bg="white"
              borderRadius="xl"
              borderWidth={0}
              shadow={1}
              _focus={{ bg: "white", borderColor: COLORS.primary }}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={2}>
                {['all', 'active', 'driving', 'idle', 'maintenance', 'offline'].map((status) => (
                  <Pressable
                    key={status}
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg={filterStatus === status ? COLORS.primary : 'white'}
                    borderWidth={1}
                    borderColor={filterStatus === status ? COLORS.primary : 'gray.200'}
                    onPress={() => setFilterStatus(status)}
                    _pressed={{ opacity: 0.8 }}
                    shadow={filterStatus === status ? 1 : 0}
                  >
                    <Text
                      color={filterStatus === status ? 'white' : COLORS.text}
                      fontSize="sm"
                      fontWeight="500"
                      textTransform="capitalize"
                    >
                      {status === 'all' ? 'All Vehicles' : getStatusLabel(status)}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>

          {/* Vehicles List */}
          <VStack space={4}>
            {searchedVehicles.map((vehicle) => (
              <Pressable
                key={vehicle.id}
                onPress={() => handleVehicleDetails(vehicle)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box bg="white" borderRadius="xl" p={4} shadow={2}>
                  <VStack space={4}>
                    {/* Vehicle Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box 
                          w="50px" 
                          h="50px" 
                          bg={`${getStatusColor(vehicle.status)}.100`}
                          borderRadius="xl" 
                          alignItems="center" 
                          justifyContent="center"
                        >
                          <Icon as={Ionicons} name="car" color={getStatusColor(vehicle.status)} size="lg" />
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                            {vehicle.name}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Text>
                          <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                            {vehicle.licensePlate} • ID: {vehicle.id}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={1}>
                        <Badge bg={getStatusColor(vehicle.status)} borderRadius="md">
                          <Text color="white" fontSize="xs" fontWeight="600">
                            {getStatusLabel(vehicle.status)}
                          </Text>
                        </Badge>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {vehicle.lastUpdate}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Driver & Location */}
                    <HStack space={4}>
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="person" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text}>{vehicle.driver}</Text>
                      </HStack>
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="location" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                          {vehicle.location}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* OBD Telematic Data */}
                    <VStack space={3}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Vehicle Telemetrics
                        </Text>
                        <HStack space={2}>
                          {vehicle.alerts.length > 0 && (
                            <Badge bg="red.500" borderRadius="full">
                              <Text color="white" fontSize="xs">{vehicle.alerts.length}</Text>
                            </Badge>
                          )}
                        </HStack>
                      </HStack>

                      {/* Fuel Level */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs" color={COLORS.subtext}>Fuel Level</Text>
                          <Text fontSize="xs" color={getFuelLevelColor(vehicle.fuelLevel)} fontWeight="600">
                            {vehicle.fuelLevel}%
                          </Text>
                        </HStack>
                        <Progress 
                          value={vehicle.fuelLevel} 
                          bg="gray.200" 
                          _filledTrack={{ bg: getFuelLevelColor(vehicle.fuelLevel) }}
                          h="2"
                          borderRadius="full"
                        />
                      </VStack>

                      {/* Engine Health */}
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs" color={COLORS.subtext}>Engine Health</Text>
                          <Text fontSize="xs" color={getEngineHealthColor(vehicle.engineHealth)} fontWeight="600">
                            {vehicle.engineHealth}%
                          </Text>
                        </HStack>
                        <Progress 
                          value={vehicle.engineHealth} 
                          bg="gray.200" 
                          _filledTrack={{ bg: getEngineHealthColor(vehicle.engineHealth) }}
                          h="2"
                          borderRadius="full"
                        />
                      </VStack>

                      {/* Quick Stats Row */}
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Speed</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.speed} mph
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Odometer</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.odometer.toLocaleString()} mi
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Today</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.todayDistance} mi
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Fuel Avg</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.avgFuelConsumption} mpg
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Alerts */}
                    {vehicle.alerts.length > 0 && (
                      <>
                        <Divider />
                        <VStack space={2}>
                          <Text fontSize="sm" fontWeight="600" color="red.500">
                            Active Alerts
                          </Text>
                          {vehicle.alerts.map((alert, index) => (
                            <HStack key={index} space={2} alignItems="center">
                              <Icon as={Ionicons} name="warning" size="xs" color="red.500" />
                              <Text fontSize="xs" color="red.500">{alert}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </>
                    )}

                    {/* Action Buttons */}
                    <Divider />
                    <HStack space={3} justifyContent="space-between">
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'gray.200' }}
                        flex={1}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="location" size="xs" color="gray.600" />
                          <Text fontSize="xs" color="gray.600">Track</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'gray.200' }}
                        flex={1}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="analytics" size="xs" color="gray.600" />
                          <Text fontSize="xs" color="gray.600">Reports</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'gray.200' }}
                        flex={1}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="build" size="xs" color="gray.600" />
                          <Text fontSize="xs" color="gray.600">Service</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'gray.200' }}
                        flex={1}
                        onPress={() => handleVehicleDetails(vehicle)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="information-circle" size="xs" color="gray.600" />
                          <Text fontSize="xs" color="gray.600">Details</Text>
                        </HStack>
                      </Pressable>
                    </HStack>
                  </VStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Vehicle Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="500px" maxHeight="80%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedVehicle ? `${selectedVehicle.name} Details` : 'Add New Vehicle'}
          </Modal.Header>
          <Modal.Body>
            {selectedVehicle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Vehicle Info */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Vehicle Information
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>VIN</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.vin}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Next Service</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.nextService}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Detailed OBD Data */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Engine Diagnostics
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Battery Voltage</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.batteryVoltage}V</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Engine Temperature</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.engineTemp}°C</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Trip Statistics */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Trip Statistics
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Weekly Distance</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.weeklyDistance} mi</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Monthly Distance</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.monthlyDistance} mi</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </ScrollView>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                Close
              </Button>
              <Button bg={COLORS.primary} onPress={onClose}>
                Edit Vehicle
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}