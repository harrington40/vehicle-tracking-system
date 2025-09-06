import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton, Image
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function DriversPage() {
  const router = useRouter();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverFilter, setDriverFilter] = useState('all'); // all, active, available, break, offline
  const [performanceFilter, setPerformanceFilter] = useState('week'); // day, week, month
  const [showPerformance, setShowPerformance] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isPerfOpen, onOpen: onPerfOpen, onClose: onPerfClose } = useDisclose();

  // Comprehensive driver data with business logic
  const [drivers, setDrivers] = useState([
    {
      id: 'DR-001',
      employeeId: 'EMP-12345',
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://via.placeholder.com/100',
      status: 'driving', // driving, available, break, offline, scheduled
      
      // License & Certification
      licenseNumber: 'DL123456789',
      licenseClass: 'CDL-A',
      licenseExpiry: '2025-06-15',
      certifications: ['Hazmat', 'Passenger Transport', 'Defensive Driving'],
      yearsExperience: 8,
      hireDate: '2019-03-15',
      
      // Current Assignment
      currentVehicleId: 'VH-001',
      currentVehicleName: 'Fleet Truck 001',
      currentRoute: 'Downtown Delivery Circuit',
      currentLocation: 'Financial District, Downtown',
      shiftStart: '08:00',
      shiftEnd: '17:00',
      breakTime: 60, // minutes
      overtimeHours: 2.5,
      
      // Performance Metrics (Real-time and Historical)
      driverScore: 92, // Overall performance score
      safetyScore: 95,
      efficiencyScore: 88,
      punctualityScore: 94,
      
      // Driving Behavior (OBD Telematic Data)
      avgSpeed: 35, // mph
      maxSpeedToday: 58,
      harshAcceleration: 2, // count today
      harshBraking: 1, // count today
      harshCornering: 0, // count today
      idleTime: 45, // minutes today
      fuelEfficiency: 8.4, // mpg average
      
      // Trip Statistics
      milesThisWeek: 1247,
      milesThisMonth: 4892,
      tripsCompleted: 23,
      onTimeDeliveries: 21,
      customerRating: 4.8, // out of 5
      
      // Health & Safety
      fatigueLevel: 'Low', // Low, Medium, High
      lastBreak: '12:30 PM',
      hoursWorkedToday: 6.5,
      speedingViolations: 0,
      seatbeltViolations: 0,
      phoneUsageViolations: 0,
      
      // Recent Activities
      lastActivity: '2 min ago',
      recentEvents: [
        { time: '14:18', event: 'Completed delivery at Financial District', type: 'success' },
        { time: '14:05', event: 'Started break (15 min)', type: 'info' },
        { time: '13:50', event: 'Arrived at delivery location', type: 'info' },
        { time: '13:30', event: 'Route deviation detected', type: 'warning' }
      ],
      
      // Alerts & Violations
      alerts: [],
      violations: [],
      
      // Training & Development
      trainingCompleted: 85, // percentage
      nextTrainingDue: '2024-02-15',
      skillRatings: {
        navigation: 9,
        customerService: 8,
        vehicleMaintenance: 7,
        safetyCompliance: 10
      }
    },
    {
      id: 'DR-002',
      employeeId: 'EMP-12346',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4568',
      avatar: 'https://via.placeholder.com/100',
      status: 'available',
      
      // License & Certification
      licenseNumber: 'DL987654321',
      licenseClass: 'CDL-B',
      licenseExpiry: '2024-12-20',
      certifications: ['Defensive Driving', 'First Aid'],
      yearsExperience: 5,
      hireDate: '2021-07-10',
      
      // Current Assignment
      currentVehicleId: 'VH-002',
      currentVehicleName: 'Delivery Van 002',
      currentRoute: null,
      currentLocation: 'Main Hub Parking',
      shiftStart: '09:00',
      shiftEnd: '18:00',
      breakTime: 45,
      overtimeHours: 0,
      
      // Performance Metrics
      driverScore: 88,
      safetyScore: 92,
      efficiencyScore: 85,
      punctualityScore: 89,
      
      // Driving Behavior
      avgSpeed: 32,
      maxSpeedToday: 55,
      harshAcceleration: 1,
      harshBraking: 0,
      harshCornering: 1,
      idleTime: 32,
      fuelEfficiency: 9.1,
      
      // Trip Statistics
      milesThisWeek: 892,
      milesThisMonth: 3456,
      tripsCompleted: 18,
      onTimeDeliveries: 17,
      customerRating: 4.6,
      
      // Health & Safety
      fatigueLevel: 'Low',
      lastBreak: '11:15 AM',
      hoursWorkedToday: 5.5,
      speedingViolations: 0,
      seatbeltViolations: 0,
      phoneUsageViolations: 1,
      
      // Recent Activities
      lastActivity: '5 min ago',
      recentEvents: [
        { time: '14:10', event: 'Returned to hub', type: 'success' },
        { time: '13:45', event: 'Completed delivery route', type: 'success' },
        { time: '11:30', event: 'Phone usage detected while driving', type: 'warning' }
      ],
      
      alerts: ['Phone usage violation'],
      violations: [{ type: 'Phone Usage', time: '11:30', severity: 'Low' }],
      
      // Training
      trainingCompleted: 78,
      nextTrainingDue: '2024-01-30',
      skillRatings: {
        navigation: 8,
        customerService: 9,
        vehicleMaintenance: 6,
        safetyCompliance: 8
      }
    },
    {
      id: 'DR-003',
      employeeId: 'EMP-12347',
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com',
      phone: '+1 (555) 123-4569',
      avatar: 'https://via.placeholder.com/100',
      status: 'break',
      
      // License & Certification
      licenseNumber: 'DL456789123',
      licenseClass: 'CDL-A',
      licenseExpiry: '2025-03-10',
      certifications: ['Hazmat', 'Heavy Equipment', 'Safety Inspector'],
      yearsExperience: 12,
      hireDate: '2017-01-20',
      
      // Current Assignment
      currentVehicleId: 'VH-003',
      currentVehicleName: 'Service Truck 003',
      currentRoute: 'Suburban Service Route',
      currentLocation: 'Rest Area Mile 45',
      shiftStart: '07:00',
      shiftEnd: '16:00',
      breakTime: 30,
      overtimeHours: 1.0,
      
      // Performance Metrics
      driverScore: 96,
      safetyScore: 98,
      efficiencyScore: 94,
      punctualityScore: 97,
      
      // Driving Behavior
      avgSpeed: 38,
      maxSpeedToday: 62,
      harshAcceleration: 0,
      harshBraking: 0,
      harshCornering: 0,
      idleTime: 28,
      fuelEfficiency: 9.8,
      
      // Trip Statistics
      milesThisWeek: 1567,
      milesThisMonth: 6234,
      tripsCompleted: 31,
      onTimeDeliveries: 31,
      customerRating: 4.9,
      
      // Health & Safety
      fatigueLevel: 'Low',
      lastBreak: '2:00 PM',
      hoursWorkedToday: 7.0,
      speedingViolations: 0,
      seatbeltViolations: 0,
      phoneUsageViolations: 0,
      
      // Recent Activities
      lastActivity: 'Now',
      recentEvents: [
        { time: '14:00', event: 'Started scheduled break', type: 'info' },
        { time: '13:45', event: 'Completed service at Commercial Complex', type: 'success' },
        { time: '12:30', event: 'Perfect driving score achieved', type: 'success' }
      ],
      
      alerts: [],
      violations: [],
      
      // Training
      trainingCompleted: 95,
      nextTrainingDue: '2024-03-15',
      skillRatings: {
        navigation: 10,
        customerService: 9,
        vehicleMaintenance: 10,
        safetyCompliance: 10
      }
    },
    {
      id: 'DR-004',
      employeeId: 'EMP-12348',
      name: 'Lisa Chen',
      email: 'lisa.chen@company.com',
      phone: '+1 (555) 123-4570',
      avatar: 'https://via.placeholder.com/100',
      status: 'scheduled',
      
      // License & Certification
      licenseNumber: 'DL789123456',
      licenseClass: 'CDL-B',
      licenseExpiry: '2024-09-30',
      certifications: ['Defensive Driving', 'Customer Service Excellence'],
      yearsExperience: 3,
      hireDate: '2022-05-01',
      
      // Current Assignment
      currentVehicleId: null,
      currentVehicleName: null,
      currentRoute: null,
      currentLocation: 'Off Duty',
      shiftStart: '15:00',
      shiftEnd: '23:00',
      breakTime: 60,
      overtimeHours: 0,
      
      // Performance Metrics
      driverScore: 82,
      safetyScore: 87,
      efficiencyScore: 78,
      punctualityScore: 85,
      
      // Driving Behavior
      avgSpeed: 29,
      maxSpeedToday: 0, // Not driving today
      harshAcceleration: 0,
      harshBraking: 0,
      harshCornering: 0,
      idleTime: 0,
      fuelEfficiency: 8.7,
      
      // Trip Statistics
      milesThisWeek: 567,
      milesThisMonth: 2234,
      tripsCompleted: 12,
      onTimeDeliveries: 11,
      customerRating: 4.4,
      
      // Health & Safety
      fatigueLevel: 'Low',
      lastBreak: 'N/A',
      hoursWorkedToday: 0,
      speedingViolations: 1,
      seatbeltViolations: 0,
      phoneUsageViolations: 0,
      
      // Recent Activities
      lastActivity: 'Yesterday',
      recentEvents: [
        { time: 'Yesterday 22:30', event: 'Shift ended', type: 'info' },
        { time: 'Yesterday 21:45', event: 'Speed limit exceeded by 8 mph', type: 'warning' },
        { time: 'Yesterday 19:30', event: 'Started evening route', type: 'info' }
      ],
      
      alerts: ['Training due soon'],
      violations: [{ type: 'Speeding', time: 'Yesterday 21:45', severity: 'Medium' }],
      
      // Training
      trainingCompleted: 65,
      nextTrainingDue: '2024-01-20',
      skillRatings: {
        navigation: 7,
        customerService: 8,
        vehicleMaintenance: 5,
        safetyCompliance: 7
      }
    }
  ]);

  const getStatusColor = (status) => ({
    driving: 'green.500',
    available: 'blue.500',
    break: 'orange.500',
    offline: 'gray.500',
    scheduled: 'purple.500'
  }[status]);

  const getStatusIcon = (status) => ({
    driving: 'car',
    available: 'checkmark-circle',
    break: 'pause-circle',
    offline: 'power',
    scheduled: 'time'
  }[status]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'green.500';
    if (score >= 75) return 'orange.500';
    return 'red.500';
  };

  const getFatigueColor = (level) => ({
    'Low': 'green.500',
    'Medium': 'orange.500',
    'High': 'red.500'
  }[level]);

  const filteredDrivers = driverFilter === 'all' 
    ? drivers 
    : drivers.filter(driver => driver.status === driverFilter);

  const handleDriverDetails = (driver) => {
    setSelectedDriver(driver);
    onOpen();
  };

  const handlePerformanceView = (driver) => {
    setSelectedDriver(driver);
    onPerfOpen();
  };

  // Calculate fleet driver statistics
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'driving').length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;
  const avgDriverScore = Math.round(drivers.reduce((sum, d) => sum + d.driverScore, 0) / drivers.length);

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
              <VStack space={1}>
                <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
                  Driver Management
                </Text>
                <Text fontSize="sm" color={COLORS.subtext}>
                  Monitor performance, safety, and compliance
                </Text>
              </VStack>
            </HStack>
            <HStack space={2}>
              <Button 
                size="sm" 
                bg={COLORS.primary}
                onPress={onPerfOpen}
                leftIcon={<Icon as={Ionicons} name="analytics" size="sm" color="white" />}
              >
                Analytics
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                borderColor={COLORS.primary}
                _text={{ color: COLORS.primary }}
                leftIcon={<Icon as={Ionicons} name="person-add" size="sm" color={COLORS.primary} />}
              >
                Add Driver
              </Button>
            </HStack>
          </HStack>

          {/* Driver Analytics Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="people" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalDrivers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Drivers</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={1}>
              <VStack space={2}>
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="car" size="lg" color="green.500" />
                  <Circle size="6px" bg="green.500" />
                </HStack>
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{activeDrivers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Now</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="checkmark-circle" size="lg" color="purple.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{availableDrivers}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Available</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getScoreColor(avgDriverScore)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="star" size="lg" color={getScoreColor(avgDriverScore)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgDriverScore}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Score</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Driver Status Filters */}
          <VStack space={3}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={3}>
                {['all', 'driving', 'available', 'break', 'scheduled', 'offline'].map((filter) => (
                  <Pressable
                    key={filter}
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg={driverFilter === filter ? COLORS.primary : 'white'}
                    borderWidth={1}
                    borderColor={driverFilter === filter ? COLORS.primary : 'gray.200'}
                    onPress={() => setDriverFilter(filter)}
                    _pressed={{ opacity: 0.8 }}
                    shadow={driverFilter === filter ? 1 : 0}
                  >
                    <Text
                      color={driverFilter === filter ? 'white' : COLORS.text}
                      fontSize="sm"
                      fontWeight="500"
                      textTransform="capitalize"
                    >
                      {filter === 'all' ? 'All Drivers' : filter}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>

          {/* Drivers List */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Driver Overview
            </Text>
            
            {filteredDrivers.map((driver) => (
              <Pressable
                key={driver.id}
                onPress={() => handleDriverDetails(driver)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box bg="white" borderRadius="xl" p={4} shadow={2}>
                  <VStack space={4}>
                    {/* Driver Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box position="relative">
                          <Avatar 
                            size="md" 
                            source={{ uri: driver.avatar }}
                            bg="gray.200"
                          >
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Circle 
                            size="12px" 
                            bg={getStatusColor(driver.status)}
                            position="absolute" 
                            bottom="0px" 
                            right="0px"
                            borderWidth={2}
                            borderColor="white"
                          />
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                            {driver.name}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {driver.licenseClass} • {driver.yearsExperience} years exp.
                          </Text>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                              {driver.id}
                            </Text>
                            <Badge bg={getStatusColor(driver.status)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {driver.status.toUpperCase()}
                              </Text>
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={2}>
                        <HStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="star" color={getScoreColor(driver.driverScore)} size="sm" />
                          <Text fontSize="lg" fontWeight="700" color={getScoreColor(driver.driverScore)}>
                            {driver.driverScore}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {driver.lastActivity}
                        </Text>
                        {driver.alerts.length > 0 && (
                          <Badge bg="red.500" borderRadius="full">
                            <Text color="white" fontSize="xs">{driver.alerts.length}</Text>
                          </Badge>
                        )}
                      </VStack>
                    </HStack>

                    {/* Current Assignment */}
                    {driver.currentVehicleName && (
                      <HStack space={4} justifyContent="space-between">
                        <HStack space={2} flex={1}>
                          <Icon as={Ionicons} name="car" size="sm" color="gray.500" />
                          <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                            {driver.currentVehicleName}
                          </Text>
                        </HStack>
                        <HStack space={2} flex={1}>
                          <Icon as={Ionicons} name="location" size="sm" color="gray.500" />
                          <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                            {driver.currentLocation}
                          </Text>
                        </HStack>
                      </HStack>
                    )}

                    {/* Performance Scores */}
                    <VStack space={3}>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        Performance Metrics
                      </Text>
                      
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1} flex={1}>
                          <Circle size="40px" bg={`${getScoreColor(driver.safetyScore)}.100`}>
                            <Text fontSize="sm" fontWeight="700" color={getScoreColor(driver.safetyScore)}>
                              {driver.safetyScore}
                            </Text>
                          </Circle>
                          <Text fontSize="xs" color={COLORS.subtext}>Safety</Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1} flex={1}>
                          <Circle size="40px" bg={`${getScoreColor(driver.efficiencyScore)}.100`}>
                            <Text fontSize="sm" fontWeight="700" color={getScoreColor(driver.efficiencyScore)}>
                              {driver.efficiencyScore}
                            </Text>
                          </Circle>
                          <Text fontSize="xs" color={COLORS.subtext}>Efficiency</Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1} flex={1}>
                          <Circle size="40px" bg={`${getScoreColor(driver.punctualityScore)}.100`}>
                            <Text fontSize="sm" fontWeight="700" color={getScoreColor(driver.punctualityScore)}>
                              {driver.punctualityScore}
                            </Text>
                          </Circle>
                          <Text fontSize="xs" color={COLORS.subtext}>Punctuality</Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1} flex={1}>
                          <Circle size="40px" bg={getFatigueColor(driver.fatigueLevel) + '.100'}>
                            <Icon 
                              as={Ionicons} 
                              name={driver.fatigueLevel === 'Low' ? 'happy' : driver.fatigueLevel === 'Medium' ? 'sad' : 'warning'}
                              color={getFatigueColor(driver.fatigueLevel)}
                              size="sm"
                            />
                          </Circle>
                          <Text fontSize="xs" color={COLORS.subtext}>Fatigue</Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Driving Behavior Metrics */}
                    <VStack space={3}>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        Today's Driving Behavior
                      </Text>
                      
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Avg Speed</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {driver.avgSpeed} mph
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Harsh Events</Text>
                          <Text fontSize="sm" fontWeight="600" color={
                            (driver.harshAcceleration + driver.harshBraking + driver.harshCornering) === 0 ? 'green.500' : 'red.500'
                          }>
                            {driver.harshAcceleration + driver.harshBraking + driver.harshCornering}
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Fuel Eff.</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {driver.fuelEfficiency} mpg
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Hours</Text>
                          <Text fontSize="sm" fontWeight="600" color={driver.hoursWorkedToday > 8 ? 'orange.500' : COLORS.text}>
                            {driver.hoursWorkedToday}h
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Current Status Info */}
                    {driver.status === 'driving' && driver.currentRoute && (
                      <Box bg="green.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="green.500">
                        <HStack justifyContent="space-between" alignItems="center">
                          <VStack space={1} flex={1}>
                            <Text fontSize="sm" fontWeight="600" color="green.700">
                              Currently on: {driver.currentRoute}
                            </Text>
                            <Text fontSize="xs" color="green.600">
                              Location: {driver.currentLocation}
                            </Text>
                          </VStack>
                          <Icon as={Ionicons} name="navigate" color="green.500" size="md" />
                        </HStack>
                      </Box>
                    )}

                    {driver.status === 'break' && (
                      <Box bg="orange.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="orange.500">
                        <HStack justifyContent="space-between" alignItems="center">
                          <VStack space={1} flex={1}>
                            <Text fontSize="sm" fontWeight="600" color="orange.700">
                              On Break
                            </Text>
                            <Text fontSize="xs" color="orange.600">
                              Started: {driver.lastBreak} • {driver.breakTime} min scheduled
                            </Text>
                          </VStack>
                          <Icon as={Ionicons} name="pause-circle" color="orange.500" size="md" />
                        </HStack>
                      </Box>
                    )}

                    {/* Alerts & Violations */}
                    {(driver.alerts.length > 0 || driver.violations.length > 0) && (
                      <Box bg="red.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="red.500">
                        <VStack space={2}>
                          {driver.alerts.length > 0 && (
                            <>
                              <Text fontSize="sm" fontWeight="600" color="red.700">
                                Active Alerts
                              </Text>
                              {driver.alerts.map((alert, index) => (
                                <HStack key={index} space={2} alignItems="center">
                                  <Icon as={Ionicons} name="warning" size="xs" color="red.500" />
                                  <Text fontSize="xs" color="red.600">{alert}</Text>
                                </HStack>
                              ))}
                            </>
                          )}
                          {driver.violations.length > 0 && (
                            <>
                              <Text fontSize="sm" fontWeight="600" color="red.700">
                                Recent Violations
                              </Text>
                              {driver.violations.map((violation, index) => (
                                <HStack key={index} space={2} alignItems="center">
                                  <Icon as={Ionicons} name="alert-circle" size="xs" color="red.500" />
                                  <Text fontSize="xs" color="red.600">
                                    {violation.type} - {violation.severity} ({violation.time})
                                  </Text>
                                </HStack>
                              ))}
                            </>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Divider />
                    <HStack space={2} justifyContent="space-between">
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="blue.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'blue.200' }}
                        flex={1}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="call" size="xs" color="blue.600" />
                          <Text fontSize="xs" color="blue.600" fontWeight="600">Contact</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="green.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'green.200' }}
                        flex={1}
                        onPress={() => handlePerformanceView(driver)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="analytics" size="xs" color="green.600" />
                          <Text fontSize="xs" color="green.600" fontWeight="600">Performance</Text>
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
                          <Icon as={Ionicons} name="document-text" size="xs" color="purple.600" />
                          <Text fontSize="xs" color="purple.600" fontWeight="600">Reports</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'gray.200' }}
                        flex={1}
                        onPress={() => handleDriverDetails(driver)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="information-circle" size="xs" color="gray.600" />
                          <Text fontSize="xs" color="gray.600" fontWeight="600">Details</Text>
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

      {/* Driver Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedDriver ? `${selectedDriver.name} - Profile` : 'Driver Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedDriver && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Personal Information */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Personal Information
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Employee ID</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.employeeId}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Email</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.email}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Phone</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.phone}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Hire Date</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.hireDate}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* License & Certifications */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      License & Certifications
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>License Number</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.licenseNumber}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>License Class</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.licenseClass}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Expiry Date</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.licenseExpiry}</Text>
                    </HStack>
                    <VStack space={2}>
                      <Text fontSize="sm" color={COLORS.subtext}>Certifications</Text>
                      <HStack space={2} flexWrap="wrap">
                        {selectedDriver.certifications.map((cert, index) => (
                          <Badge key={index} bg={COLORS.primary} borderRadius="full" mb={1}>
                            <Text color="white" fontSize="xs">{cert}</Text>
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  </VStack>

                  <Divider />

                  {/* Performance Statistics */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Performance Statistics
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Miles This Week</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.milesThisWeek.toLocaleString()}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Miles This Month</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.milesThisMonth.toLocaleString()}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Trips Completed</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedDriver.tripsCompleted}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>On-Time Deliveries</Text>
                      <Text fontSize="sm" color={selectedDriver.onTimeDeliveries === selectedDriver.tripsCompleted ? 'green.500' : 'orange.500'}>
                        {selectedDriver.onTimeDeliveries}/{selectedDriver.tripsCompleted}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Customer Rating</Text>
                      <HStack alignItems="center" space={1}>
                        <Icon as={Ionicons} name="star" color="orange.400" size="sm" />
                        <Text fontSize="sm" color={COLORS.text}>{selectedDriver.customerRating}/5.0</Text>
                      </HStack>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Skill Ratings */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Skill Assessment
                    </Text>
                    {Object.entries(selectedDriver.skillRatings).map(([skill, rating]) => (
                      <VStack key={skill} space={1}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                            {skill.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                          <Text fontSize="sm" color={getScoreColor(rating * 10)} fontWeight="600">
                            {rating}/10
                          </Text>
                        </HStack>
                        <Progress 
                          value={rating * 10} 
                          bg="gray.200" 
                          _filledTrack={{ bg: getScoreColor(rating * 10) }}
                          h="2"
                          borderRadius="full"
                        />
                      </VStack>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Recent Activities */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Recent Activities
                    </Text>
                    {selectedDriver.recentEvents.map((event, index) => (
                      <HStack key={index} justifyContent="space-between" alignItems="center">
                        <HStack space={2} alignItems="center" flex={1}>
                          <Icon 
                            as={Ionicons} 
                            name={event.type === 'success' ? 'checkmark-circle' : 
                                  event.type === 'warning' ? 'warning' : 'information-circle'} 
                            size="xs" 
                            color={event.type === 'success' ? 'green.500' : 
                                   event.type === 'warning' ? 'orange.500' : 'blue.500'} 
                          />
                          <Text fontSize="sm" color={COLORS.text} flex={1}>
                            {event.event}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {event.time}
                        </Text>
                      </HStack>
                    ))}
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
              <Button bg={COLORS.primary} onPress={() => {
                onClose();
                onPerfOpen();
              }}>
                View Performance
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Performance Analytics Modal */}
      <Modal isOpen={isPerfOpen} onClose={onPerfClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Driver Performance Analytics</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Comprehensive performance analysis and safety metrics
              </Text>
              
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Performance Period
                </Text>
                <Select 
                  selectedValue={performanceFilter} 
                  onValueChange={setPerformanceFilter}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                >
                  <Select.Item label="Today" value="day" />
                  <Select.Item label="This Week" value="week" />
                  <Select.Item label="This Month" value="month" />
                  <Select.Item label="Last 3 Months" value="quarter" />
                </Select>
              </VStack>

              {selectedDriver && (
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                    Performance Summary for {selectedDriver.name}
                  </Text>
                  <Box bg="gray.50" p={3} borderRadius="lg">
                    <VStack space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext}>Overall Score</Text>
                        <Text fontSize="sm" fontWeight="600" color={getScoreColor(selectedDriver.driverScore)}>
                          {selectedDriver.driverScore}/100
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext}>Safety Violations</Text>
                        <Text fontSize="sm" fontWeight="600" color={selectedDriver.violations.length === 0 ? 'green.500' : 'red.500'}>
                          {selectedDriver.violations.length}
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext}>Fuel Efficiency</Text>
                        <Text fontSize="sm" fontWeight="600" color="green.500">
                          {selectedDriver.fuelEfficiency} mpg
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext}>Customer Rating</Text>
                        <Text fontSize="sm" fontWeight="600" color="orange.500">
                          {selectedDriver.customerRating}/5.0 ⭐
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onPerfClose}>
                Close
              </Button>
              <Button bg={COLORS.primary} onPress={onPerfClose}>
                Generate Report
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}