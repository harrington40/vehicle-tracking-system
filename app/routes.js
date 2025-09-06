import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function RoutesPage() {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeFilter, setRouteFilter] = useState('all'); // all, active, completed, planned
  const [optimizationMode, setOptimizationMode] = useState('distance'); // distance, time, fuel
  const [showOptimization, setShowOptimization] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isOptOpen, onOpen: onOptOpen, onClose: onOptClose } = useDisclose();

  // Route data with comprehensive business logic
  const [routes, setRoutes] = useState([
    {
      id: 'RT-001',
      name: 'Downtown Delivery Circuit',
      description: 'Daily delivery route covering downtown business district',
      status: 'active',
      priority: 'high',
      vehicleId: 'VH-001',
      vehicleName: 'Fleet Truck 001',
      driverId: 'DR-001',
      driverName: 'John Smith',
      // Route Planning Data
      totalDistance: 45.2, // miles
      estimatedDuration: 185, // minutes
      actualDuration: 195, // minutes (if completed)
      startTime: '08:00',
      endTime: '11:15',
      plannedStops: 8,
      completedStops: 5,
      currentStop: 6,
      // Waypoints
      waypoints: [
        { id: 1, name: 'Warehouse Hub', address: '123 Industrial Blvd', status: 'completed', arrivalTime: '08:00', departureTime: '08:15', type: 'pickup' },
        { id: 2, name: 'City Center Mall', address: '456 Main St', status: 'completed', arrivalTime: '08:35', departureTime: '08:50', type: 'delivery' },
        { id: 3, name: 'Business Plaza', address: '789 Corporate Dr', status: 'completed', arrivalTime: '09:10', departureTime: '09:25', type: 'delivery' },
        { id: 4, name: 'Hospital Complex', address: '321 Medical Ave', status: 'completed', arrivalTime: '09:45', departureTime: '10:00', type: 'delivery' },
        { id: 5, name: 'University Campus', address: '654 College Rd', status: 'completed', arrivalTime: '10:20', departureTime: '10:35', type: 'delivery' },
        { id: 6, name: 'Financial District', address: '987 Bank St', status: 'current', arrivalTime: '10:55', departureTime: '11:10', type: 'delivery' },
        { id: 7, name: 'Shopping Center', address: '147 Retail Blvd', status: 'pending', arrivalTime: '11:30', departureTime: '11:45', type: 'delivery' },
        { id: 8, name: 'Return to Hub', address: '123 Industrial Blvd', status: 'pending', arrivalTime: '12:05', departureTime: null, type: 'return' }
      ],
      // Performance Metrics
      onTimePerformance: 92, // percentage
      fuelEfficiency: 8.4, // mpg
      avgSpeed: 28, // mph
      idleTime: 45, // minutes
      trafficDelays: 12, // minutes
      // Route Optimization Data
      optimizationScore: 85,
      carbonFootprint: 12.5, // kg CO2
      costEstimate: 45.30,
      weatherConditions: 'Clear',
      trafficCondition: 'Moderate',
      // Alerts and Issues
      alerts: ['Traffic delay on segment 3'],
      deviations: 1,
      lastOptimized: '2024-01-15 07:45'
    },
    {
      id: 'RT-002',
      name: 'Suburban Service Route',
      description: 'Weekly maintenance service route for suburban clients',
      status: 'planned',
      priority: 'medium',
      vehicleId: 'VH-003',
      vehicleName: 'Service Truck 003',
      driverId: 'DR-003',
      driverName: 'Mike Wilson',
      // Route Planning Data
      totalDistance: 78.6,
      estimatedDuration: 420, // 7 hours
      actualDuration: null,
      startTime: '07:00',
      endTime: '14:00',
      plannedStops: 12,
      completedStops: 0,
      currentStop: 0,
      // Waypoints
      waypoints: [
        { id: 1, name: 'Service Depot', address: '555 Service Rd', status: 'pending', arrivalTime: '07:00', departureTime: '07:30', type: 'start' },
        { id: 2, name: 'Residential Area A', address: '111 Suburb St', status: 'pending', arrivalTime: '08:00', departureTime: '09:00', type: 'service' },
        { id: 3, name: 'Commercial Complex', address: '222 Business Park', status: 'pending', arrivalTime: '09:30', departureTime: '10:30', type: 'service' },
        { id: 4, name: 'School District', address: '333 Education Ave', status: 'pending', arrivalTime: '11:00', departureTime: '12:00', type: 'service' },
        { id: 5, name: 'Return to Depot', address: '555 Service Rd', status: 'pending', arrivalTime: '14:00', departureTime: null, type: 'return' }
      ],
      // Performance Metrics
      onTimePerformance: 88,
      fuelEfficiency: 9.2,
      avgSpeed: 35,
      idleTime: 120,
      trafficDelays: 0,
      // Route Optimization
      optimizationScore: 78,
      carbonFootprint: 22.1,
      costEstimate: 89.50,
      weatherConditions: 'Partly Cloudy',
      trafficCondition: 'Light',
      alerts: [],
      deviations: 0,
      lastOptimized: '2024-01-14 16:30'
    },
    {
      id: 'RT-003',
      name: 'Express Delivery Run',
      description: 'High-priority express delivery route',
      status: 'completed',
      priority: 'urgent',
      vehicleId: 'VH-002',
      vehicleName: 'Delivery Van 002',
      driverId: 'DR-002',
      driverName: 'Sarah Johnson',
      // Route Planning Data
      totalDistance: 125.8,
      estimatedDuration: 240,
      actualDuration: 225, // Completed faster
      startTime: '06:00',
      endTime: '09:45',
      plannedStops: 6,
      completedStops: 6,
      currentStop: 6,
      // Waypoints - all completed
      waypoints: [
        { id: 1, name: 'Distribution Center', address: '999 Logistics Way', status: 'completed', arrivalTime: '06:00', departureTime: '06:20', type: 'pickup' },
        { id: 2, name: 'Airport Terminal', address: 'Terminal 1 Gate A', status: 'completed', arrivalTime: '07:00', departureTime: '07:15', type: 'delivery' },
        { id: 3, name: 'Port Authority', address: '888 Harbor Dr', status: 'completed', arrivalTime: '08:00', departureTime: '08:15', type: 'delivery' },
        { id: 4, name: 'Train Station', address: '777 Railway St', status: 'completed', arrivalTime: '08:45', departureTime: '09:00', type: 'delivery' },
        { id: 5, name: 'Emergency Depot', address: '666 Response Rd', status: 'completed', arrivalTime: '09:25', departureTime: '09:40', type: 'delivery' },
        { id: 6, name: 'Base Return', address: '999 Logistics Way', status: 'completed', arrivalTime: '09:45', departureTime: null, type: 'return' }
      ],
      // Performance Metrics
      onTimePerformance: 100,
      fuelEfficiency: 7.8,
      avgSpeed: 42,
      idleTime: 25,
      trafficDelays: 5,
      // Route Optimization
      optimizationScore: 94,
      carbonFootprint: 18.7,
      costEstimate: 67.80,
      weatherConditions: 'Clear',
      trafficCondition: 'Heavy',
      alerts: [],
      deviations: 0,
      lastOptimized: '2024-01-15 05:30'
    }
  ]);

  const getStatusColor = (status) => ({
    active: 'green.500',
    planned: 'blue.500',
    completed: 'gray.500',
    delayed: 'red.500',
    paused: 'orange.500'
  }[status]);

  const getPriorityColor = (priority) => ({
    urgent: 'red.500',
    high: 'orange.500',
    medium: 'blue.500',
    low: 'gray.500'
  }[priority]);

  const getWaypointIcon = (type) => ({
    pickup: 'cube-outline',
    delivery: 'location',
    service: 'build',
    start: 'play-circle',
    return: 'home',
    stop: 'pause-circle'
  }[type]);

  const getOptimizationColor = (score) => {
    if (score >= 90) return 'green.500';
    if (score >= 75) return 'orange.500';
    return 'red.500';
  };

  const filteredRoutes = routeFilter === 'all' 
    ? routes 
    : routes.filter(route => route.status === routeFilter);

  const handleRouteDetails = (route) => {
    setSelectedRoute(route);
    onOpen();
  };

  const handleOptimizeRoute = (route) => {
    setSelectedRoute(route);
    onOptOpen();
  };

  // Calculate route statistics
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const completedToday = routes.filter(r => r.status === 'completed').length;
  const avgOptimization = Math.round(routes.reduce((sum, r) => sum + r.optimizationScore, 0) / routes.length);

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
                  Route Management
                </Text>
                <Text fontSize="sm" color={COLORS.subtext}>
                  Plan, optimize, and track delivery routes
                </Text>
              </VStack>
            </HStack>
            <HStack space={2}>
              <Button 
                size="sm" 
                bg={COLORS.primary}
                onPress={onOptOpen}
                leftIcon={<Icon as={Ionicons} name="analytics" size="sm" color="white" />}
              >
                Optimize
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                borderColor={COLORS.primary}
                _text={{ color: COLORS.primary }}
                leftIcon={<Icon as={Ionicons} name="add" size="sm" color={COLORS.primary} />}
              >
                New Route
              </Button>
            </HStack>
          </HStack>

          {/* Route Analytics Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="map" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalRoutes}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Routes</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={1}>
              <VStack space={2}>
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="time" size="lg" color="green.500" />
                  <Circle size="6px" bg="green.500" />
                </HStack>
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{activeRoutes}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Now</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="checkmark-circle" size="lg" color="purple.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{completedToday}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Completed</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getOptimizationColor(avgOptimization)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="trending-up" size="lg" color={getOptimizationColor(avgOptimization)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgOptimization}%</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Optimization</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Route Filters */}
          <VStack space={3}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={3}>
                {['all', 'active', 'planned', 'completed'].map((filter) => (
                  <Pressable
                    key={filter}
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg={routeFilter === filter ? COLORS.primary : 'white'}
                    borderWidth={1}
                    borderColor={routeFilter === filter ? COLORS.primary : 'gray.200'}
                    onPress={() => setRouteFilter(filter)}
                    _pressed={{ opacity: 0.8 }}
                    shadow={routeFilter === filter ? 1 : 0}
                  >
                    <Text
                      color={routeFilter === filter ? 'white' : COLORS.text}
                      fontSize="sm"
                      fontWeight="500"
                      textTransform="capitalize"
                    >
                      {filter === 'all' ? 'All Routes' : filter}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>

          {/* Routes List */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Route Overview
            </Text>
            
            {filteredRoutes.map((route) => (
              <Pressable
                key={route.id}
                onPress={() => handleRouteDetails(route)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box bg="white" borderRadius="xl" p={4} shadow={2}>
                  <VStack space={4}>
                    {/* Route Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box 
                          w="50px" 
                          h="50px" 
                          bg={`${getStatusColor(route.status)}.100`}
                          borderRadius="xl" 
                          alignItems="center" 
                          justifyContent="center"
                          position="relative"
                        >
                          <Icon as={Ionicons} name="map" color={getStatusColor(route.status)} size="lg" />
                          {route.status === 'active' && (
                            <Circle 
                              size="8px" 
                              bg="green.500" 
                              position="absolute" 
                              top="2px" 
                              right="2px"
                            />
                          )}
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                            {route.name}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext} numberOfLines={2}>
                            {route.description}
                          </Text>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                              {route.id}
                            </Text>
                            <Badge bg={getPriorityColor(route.priority)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {route.priority.toUpperCase()}
                              </Text>
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={2}>
                        <Badge bg={getStatusColor(route.status)} borderRadius="md">
                          <Text color="white" fontSize="xs" fontWeight="600">
                            {route.status.toUpperCase()}
                          </Text>
                        </Badge>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {route.startTime} - {route.endTime}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Vehicle & Driver Assignment */}
                    <HStack space={4} justifyContent="space-between">
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="car" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                          {route.vehicleName}
                        </Text>
                      </HStack>
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="person" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                          {route.driverName}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* Route Progress */}
                    <VStack space={3}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Route Progress
                        </Text>
                        <Text fontSize="sm" color={COLORS.primary} fontWeight="600">
                          {route.completedStops}/{route.plannedStops} stops
                        </Text>
                      </HStack>
                      
                      <Progress 
                        value={(route.completedStops / route.plannedStops) * 100} 
                        bg="gray.200" 
                        _filledTrack={{ bg: getStatusColor(route.status) }}
                        h="3"
                        borderRadius="full"
                      />

                      <HStack justifyContent="space-between">
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {route.totalDistance} miles • {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                        </Text>
                        <Text fontSize="xs" color={getOptimizationColor(route.optimizationScore)} fontWeight="600">
                          {route.optimizationScore}% optimized
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Key Metrics Row */}
                    <HStack space={4} justifyContent="space-between">
                      <VStack alignItems="center" space={1}>
                        <Text fontSize="xs" color={COLORS.subtext}>Efficiency</Text>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          {route.fuelEfficiency} mpg
                        </Text>
                      </VStack>
                      <VStack alignItems="center" space={1}>
                        <Text fontSize="xs" color={COLORS.subtext}>On Time</Text>
                        <Text fontSize="sm" fontWeight="600" color={route.onTimePerformance >= 90 ? "green.500" : route.onTimePerformance >= 75 ? "orange.500" : "red.500"}>
                          {route.onTimePerformance}%
                        </Text>
                      </VStack>
                      <VStack alignItems="center" space={1}>
                        <Text fontSize="xs" color={COLORS.subtext}>Avg Speed</Text>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          {route.avgSpeed} mph
                        </Text>
                      </VStack>
                      <VStack alignItems="center" space={1}>
                        <Text fontSize="xs" color={COLORS.subtext}>Cost</Text>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          ${route.costEstimate}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Current Status or Next Action */}
                    {route.status === 'active' && (
                      <Box bg="green.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="green.500">
                        <HStack justifyContent="space-between" alignItems="center">
                          <VStack space={1} flex={1}>
                            <Text fontSize="sm" fontWeight="600" color="green.700">
                              Currently at: {route.waypoints.find(w => w.status === 'current')?.name}
                            </Text>
                            <Text fontSize="xs" color="green.600">
                              Next: {route.waypoints.find(w => w.status === 'pending')?.name}
                            </Text>
                          </VStack>
                          <Icon as={Ionicons} name="navigate" color="green.500" size="md" />
                        </HStack>
                      </Box>
                    )}

                    {/* Alerts */}
                    {route.alerts.length > 0 && (
                      <Box bg="red.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="red.500">
                        <VStack space={2}>
                          <Text fontSize="sm" fontWeight="600" color="red.700">
                            Active Alerts
                          </Text>
                          {route.alerts.map((alert, index) => (
                            <HStack key={index} space={2} alignItems="center">
                              <Icon as={Ionicons} name="warning" size="xs" color="red.500" />
                              <Text fontSize="xs" color="red.600">{alert}</Text>
                            </HStack>
                          ))}
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
                          <Icon as={Ionicons} name="map" size="xs" color="blue.600" />
                          <Text fontSize="xs" color="blue.600" fontWeight="600">Map</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="green.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'green.200' }}
                        flex={1}
                        onPress={() => handleOptimizeRoute(route)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="analytics" size="xs" color="green.600" />
                          <Text fontSize="xs" color="green.600" fontWeight="600">Optimize</Text>
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
                          <Icon as={Ionicons} name="share" size="xs" color="purple.600" />
                          <Text fontSize="xs" color="purple.600" fontWeight="600">Share</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="gray.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'gray.200' }}
                        flex={1}
                        onPress={() => handleRouteDetails(route)}
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

      {/* Route Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedRoute ? `${selectedRoute.name} - Detailed View` : 'Route Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedRoute && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Route Overview */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Route Information
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Status</Text>
                      <Badge bg={getStatusColor(selectedRoute.status)}>
                        <Text color="white" fontSize="xs">{selectedRoute.status.toUpperCase()}</Text>
                      </Badge>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Priority</Text>
                      <Badge bg={getPriorityColor(selectedRoute.priority)}>
                        <Text color="white" fontSize="xs">{selectedRoute.priority.toUpperCase()}</Text>
                      </Badge>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Weather</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.weatherConditions}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Traffic</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.trafficCondition}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Waypoints */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Waypoints ({selectedRoute.waypoints.length})
                    </Text>
                    {selectedRoute.waypoints.map((waypoint, index) => (
                      <Box 
                        key={waypoint.id} 
                        p={3} 
                        bg={waypoint.status === 'completed' ? 'green.50' : 
                            waypoint.status === 'current' ? 'blue.50' : 'gray.50'}
                        borderRadius="lg"
                        borderLeftWidth={4}
                        borderLeftColor={waypoint.status === 'completed' ? 'green.500' : 
                                        waypoint.status === 'current' ? 'blue.500' : 'gray.300'}
                      >
                        <HStack space={3} alignItems="center">
                          <Icon 
                            as={Ionicons} 
                            name={getWaypointIcon(waypoint.type)} 
                            color={waypoint.status === 'completed' ? 'green.500' : 
                                   waypoint.status === 'current' ? 'blue.500' : 'gray.400'}
                            size="md"
                          />
                          <VStack space={1} flex={1}>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {index + 1}. {waypoint.name}
                            </Text>
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {waypoint.address}
                            </Text>
                            <HStack space={4}>
                              <Text fontSize="xs" color={COLORS.subtext}>
                                Arrival: {waypoint.arrivalTime}
                              </Text>
                              {waypoint.departureTime && (
                                <Text fontSize="xs" color={COLORS.subtext}>
                                  Departure: {waypoint.departureTime}
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                          <Badge 
                            bg={waypoint.status === 'completed' ? 'green.500' : 
                                waypoint.status === 'current' ? 'blue.500' : 'gray.400'}
                            borderRadius="full"
                          >
                            <Text color="white" fontSize="xs">
                              {waypoint.status === 'completed' ? '✓' : 
                               waypoint.status === 'current' ? '●' : '○'}
                            </Text>
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Performance Analytics */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Performance Analytics
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Carbon Footprint</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.carbonFootprint} kg CO₂</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Idle Time</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.idleTime} minutes</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Traffic Delays</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.trafficDelays} minutes</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Deviations</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.deviations}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Last Optimized</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedRoute.lastOptimized}</Text>
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
              <Button bg={COLORS.primary} onPress={() => {
                onClose();
                onOptOpen();
              }}>
                Optimize Route
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Route Optimization Modal */}
      <Modal isOpen={isOptOpen} onClose={onOptClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Route Optimization</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Optimize routes based on distance, time, or fuel efficiency
              </Text>
              
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Optimization Mode
                </Text>
                <Select 
                  selectedValue={optimizationMode} 
                  onValueChange={setOptimizationMode}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                >
                  <Select.Item label="Minimize Distance" value="distance" />
                  <Select.Item label="Minimize Time" value="time" />
                  <Select.Item label="Maximize Fuel Efficiency" value="fuel" />
                  <Select.Item label="Reduce Carbon Footprint" value="eco" />
                  <Select.Item label="Balanced Optimization" value="balanced" />
                </Select>
              </VStack>

              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Optimization Preview
                </Text>
                <Box bg="gray.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Estimated Savings</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">
                        {optimizationMode === 'distance' ? '12 miles' :
                         optimizationMode === 'time' ? '25 minutes' :
                         optimizationMode === 'fuel' ? '2.3 gallons' :
                         optimizationMode === 'eco' ? '4.2 kg CO₂' : '15% overall'}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Cost Reduction</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">$8.50</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>New Route Score</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">92%</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onOptClose}>
                Cancel
              </Button>
              <Button bg={COLORS.primary} onPress={() => {
                // Apply optimization logic here
                onOptClose();
              }}>
                Apply Optimization
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}