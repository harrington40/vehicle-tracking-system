import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Switch, Progress, Circle,
  Modal, useDisclose, Skeleton, FlatList
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function LiveTrackingPage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [trackingMode, setTrackingMode] = useState('all'); // all, active, alerts
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isOpen, onOpen, onClose } = useDisclose();

  // Real-time vehicle tracking data
  const [liveVehicles, setLiveVehicles] = useState([
    {
      id: 'VH-001',
      name: 'Fleet Truck 001',
      driver: 'John Smith',
      status: 'driving',
      // GPS Data
      latitude: 40.7128,
      longitude: -74.0060,
      heading: 275, // degrees (West)
      speed: 45, // mph
      altitude: 156, // feet
      accuracy: 3.2, // meters
      lastGpsUpdate: new Date().toISOString(),
      // Route Info
      currentRoute: 'Downtown → Warehouse District',
      nextWaypoint: 'Warehouse Loading Dock',
      distanceToDestination: 2.3, // miles
      estimatedArrival: '14:35',
      routeProgress: 78, // percentage
      // OBD Telematic Data
      engineRpm: 2100,
      fuelLevel: 68,
      engineTemp: 89,
      batteryVoltage: 12.6,
      oilPressure: 35, // psi
      coolantTemp: 87,
      intakeTemp: 45,
      throttlePosition: 15, // percentage
      maf: 2.1, // mass air flow
      // Trip Data
      tripDistance: 23.5,
      tripDuration: 95, // minutes
      avgSpeed: 35,
      maxSpeed: 62,
      idleTime: 8, // minutes
      // Alerts & Events
      alerts: [],
      recentEvents: [
        { time: '14:18', event: 'Left pickup location', type: 'info' },
        { time: '14:12', event: 'Arrived at pickup', type: 'success' }
      ],
      // Performance Metrics
      fuelEfficiency: 8.2, // mpg current
      harshAcceleration: 0,
      harshBraking: 1,
      harshCornering: 0,
      driverScore: 92
    },
    {
      id: 'VH-002',
      name: 'Delivery Van 002',
      driver: 'Sarah Johnson',
      status: 'driving',
      // GPS Data
      latitude: 40.7589,
      longitude: -73.9851,
      heading: 180, // degrees (South)
      speed: 32,
      altitude: 98,
      accuracy: 2.8,
      lastGpsUpdate: new Date().toISOString(),
      // Route Info
      currentRoute: 'Central Park → Brooklyn',
      nextWaypoint: 'Brooklyn Bridge Exit',
      distanceToDestination: 5.7,
      estimatedArrival: '15:12',
      routeProgress: 45,
      // OBD Data
      engineRpm: 1800,
      fuelLevel: 23,
      engineTemp: 92,
      batteryVoltage: 12.4,
      oilPressure: 32,
      coolantTemp: 90,
      intakeTemp: 52,
      throttlePosition: 22,
      maf: 1.8,
      // Trip Data
      tripDistance: 45.2,
      tripDuration: 156,
      avgSpeed: 28,
      maxSpeed: 55,
      idleTime: 23,
      // Alerts
      alerts: ['Low Fuel Warning'],
      recentEvents: [
        { time: '14:45', event: 'Low fuel detected', type: 'warning' },
        { time: '14:30', event: 'Traffic delay detected', type: 'info' }
      ],
      // Performance
      fuelEfficiency: 6.8,
      harshAcceleration: 2,
      harshBraking: 1,
      harshCornering: 1,
      driverScore: 78
    },
    {
      id: 'VH-003',
      name: 'Service Truck 003',
      driver: 'Mike Wilson',
      status: 'idle',
      // GPS Data
      latitude: 40.6782,
      longitude: -73.9442,
      heading: 0,
      speed: 0,
      altitude: 45,
      accuracy: 1.5,
      lastGpsUpdate: new Date().toISOString(),
      // Route Info
      currentRoute: 'Service Complete',
      nextWaypoint: null,
      distanceToDestination: 0,
      estimatedArrival: null,
      routeProgress: 100,
      // OBD Data
      engineRpm: 800, // idle
      fuelLevel: 82,
      engineTemp: 85,
      batteryVoltage: 12.8,
      oilPressure: 15,
      coolantTemp: 82,
      intakeTemp: 32,
      throttlePosition: 0,
      maf: 0.5,
      // Trip Data
      tripDistance: 67.8,
      tripDuration: 285,
      avgSpeed: 25,
      maxSpeed: 58,
      idleTime: 45,
      // Alerts
      alerts: [],
      recentEvents: [
        { time: '14:22', event: 'Service completed', type: 'success' },
        { time: '13:45', event: 'Started service call', type: 'info' }
      ],
      // Performance
      fuelEfficiency: 9.1,
      harshAcceleration: 0,
      harshBraking: 0,
      harshCornering: 0,
      driverScore: 95
    }
  ]);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate real-time updates
        setLiveVehicles(prev => prev.map(vehicle => ({
          ...vehicle,
          lastGpsUpdate: new Date().toISOString(),
          // Simulate small changes in real data
          speed: vehicle.status === 'driving' 
            ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10)
            : 0,
          engineRpm: vehicle.status === 'driving' 
            ? Math.max(800, vehicle.engineRpm + (Math.random() - 0.5) * 300)
            : 800
        })));
      }, refreshInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status) => ({
    driving: 'green.500',
    idle: 'orange.500',
    parked: 'blue.500',
    offline: 'gray.500',
    alert: 'red.500'
  }[status]);

  const getSignalStrength = (accuracy) => {
    if (accuracy <= 2) return { strength: 'Excellent', color: 'green.500', bars: 4 };
    if (accuracy <= 5) return { strength: 'Good', color: 'green.400', bars: 3 };
    if (accuracy <= 10) return { strength: 'Fair', color: 'orange.500', bars: 2 };
    return { strength: 'Poor', color: 'red.500', bars: 1 };
  };

  const getDriverScoreColor = (score) => {
    if (score >= 90) return 'green.500';
    if (score >= 75) return 'orange.500';
    return 'red.500';
  };

  const filteredVehicles = liveVehicles.filter(vehicle => {
    if (trackingMode === 'active') return vehicle.status === 'driving';
    if (trackingMode === 'alerts') return vehicle.alerts.length > 0;
    return true;
  });

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    onOpen();
  };

  // Calculate fleet metrics
  const activeVehicles = liveVehicles.filter(v => v.status === 'driving').length;
  const avgSpeed = Math.round(
    liveVehicles.filter(v => v.status === 'driving')
      .reduce((sum, v) => sum + v.speed, 0) / 
    Math.max(activeVehicles, 1)
  );
  const totalAlerts = liveVehicles.reduce((sum, v) => sum + v.alerts.length, 0);
  const avgDriverScore = Math.round(
    liveVehicles.reduce((sum, v) => sum + v.driverScore, 0) / liveVehicles.length
  );

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={4}>
          {/* Header with Real-time Indicator */}
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space={3}>
              <Pressable onPress={() => router.back()}>
                <Icon as={Ionicons} name="arrow-back" size="lg" color={COLORS.text} />
              </Pressable>
              <VStack space={1}>
                <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
                  Live Tracking
                </Text>
                <HStack alignItems="center" space={2}>
                  <Circle size="8px" bg={autoRefresh ? "green.500" : "gray.400"} />
                  <Text fontSize="xs" color={COLORS.subtext}>
                    {autoRefresh ? 'Live Updates' : 'Paused'} • Last: {lastUpdated.toLocaleTimeString()}
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
                onPress={() => setLastUpdated(new Date())}
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Real-time Fleet Metrics */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={1}>
              <VStack space={2}>
                <HStack alignItems="center" space={2}>
                  <Icon as={Ionicons} name="car-sport" size="md" color="green.500" />
                  <Circle size="6px" bg="green.500" />
                </HStack>
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{activeVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Now</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="speedometer" size="md" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgSpeed}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Speed (mph)</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={totalAlerts > 0 ? "red.500" : "gray.300"} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="warning" size="md" color={totalAlerts > 0 ? "red.500" : "gray.400"} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalAlerts}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Alerts</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getDriverScoreColor(avgDriverScore)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="star" size="md" color={getDriverScoreColor(avgDriverScore)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgDriverScore}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Driver Score</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Control Panel */}
          <Box bg="white" p={4} borderRadius="xl" shadow={1}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                Tracking Controls
              </Text>
              
              <HStack justifyContent="space-between" alignItems="center">
                <VStack space={1}>
                  <Text fontSize="sm" fontWeight="500" color={COLORS.text}>
                    Auto Refresh
                  </Text>
                  <Text fontSize="xs" color={COLORS.subtext}>
                    Updates every {refreshInterval}s
                  </Text>
                </VStack>
                <Switch 
                  isChecked={autoRefresh} 
                  onToggle={setAutoRefresh}
                  colorScheme="green"
                />
              </HStack>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={2}>
                  {['all', 'active', 'alerts'].map((mode) => (
                    <Pressable
                      key={mode}
                      px={4}
                      py={2}
                      borderRadius="full"
                      bg={trackingMode === mode ? COLORS.primary : 'gray.100'}
                      onPress={() => setTrackingMode(mode)}
                      _pressed={{ opacity: 0.8 }}
                    >
                      <Text
                        color={trackingMode === mode ? 'white' : COLORS.text}
                        fontSize="sm"
                        fontWeight="500"
                        textTransform="capitalize"
                      >
                        {mode === 'all' ? 'All Vehicles' : mode === 'active' ? 'Active Only' : 'With Alerts'}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
          </Box>

          {/* Live Vehicle Tracking Cards */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Live Vehicle Status
            </Text>
            
            {filteredVehicles.map((vehicle) => {
              const signal = getSignalStrength(vehicle.accuracy);
              return (
                <Pressable
                  key={vehicle.id}
                  onPress={() => handleVehicleSelect(vehicle)}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Box bg="white" borderRadius="xl" p={4} shadow={2}>
                    
                    <VStack space={4}>
                      {/* Vehicle Header with Live Indicator */}
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <HStack space={3} flex={1}>
                          <Box 
                            w="50px" 
                            h="50px" 
                            bg={`${getStatusColor(vehicle.status)}.100`}
                            borderRadius="xl" 
                            alignItems="center" 
                            justifyContent="center"
                            position="relative"
                          >
                            <Icon as={Ionicons} name="car" color={getStatusColor(vehicle.status)} size="lg" />
                            {vehicle.status === 'driving' && (
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
                              {vehicle.name}
                            </Text>
                            <Text fontSize="sm" color={COLORS.subtext}>
                              Driver: {vehicle.driver}
                            </Text>
                            <HStack alignItems="center" space={2}>
                              <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                                {vehicle.id}
                              </Text>
                              <Badge bg={getStatusColor(vehicle.status)} borderRadius="md" size="sm">
                                <Text color="white" fontSize="xs" fontWeight="600">
                                  {vehicle.status.toUpperCase()}
                                </Text>
                              </Badge>
                            </HStack>
                          </VStack>
                        </HStack>
                        
                        <VStack alignItems="flex-end" space={2}>
                          {/* GPS Signal Strength */}
                          <HStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="wifi" color={signal.color} size="xs" />
                            <Text fontSize="xs" color={signal.color} fontWeight="600">
                              {signal.strength}
                            </Text>
                          </HStack>
                          {vehicle.alerts.length > 0 && (
                            <Badge bg="red.500" borderRadius="full">
                              <Text color="white" fontSize="xs">{vehicle.alerts.length}</Text>
                            </Badge>
                          )}
                        </VStack>
                      </HStack>

                      {/* Real-time Speed & Location */}
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Current Speed</Text>
                          <Text fontSize="xl" fontWeight="700" color={vehicle.speed > 0 ? "green.500" : "gray.400"}>
                            {Math.round(vehicle.speed)}
                          </Text>
                          <Text fontSize="xs" color={COLORS.subtext}>mph</Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Engine RPM</Text>
                          <Text fontSize="xl" fontWeight="700" color={COLORS.text}>
                            {Math.round(vehicle.engineRpm)}
                          </Text>
                          <Text fontSize="xs" color={COLORS.subtext}>rpm</Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Heading</Text>
                          <Text fontSize="xl" fontWeight="700" color={COLORS.text}>
                            {vehicle.heading}°
                          </Text>
                          <Text fontSize="xs" color={COLORS.subtext}>
                            {vehicle.heading <= 45 || vehicle.heading > 315 ? 'N' :
                             vehicle.heading <= 135 ? 'E' :
                             vehicle.heading <= 225 ? 'S' : 'W'}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Driver Score</Text>
                          <Text fontSize="xl" fontWeight="700" color={getDriverScoreColor(vehicle.driverScore)}>
                            {vehicle.driverScore}
                          </Text>
                          <Text fontSize="xs" color={COLORS.subtext}>/ 100</Text>
                        </VStack>
                      </HStack>

                      {/* Route Progress */}
                      {vehicle.currentRoute && (
                        <VStack space={2}>
                          <HStack justifyContent="space-between">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              Current Route
                            </Text>
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {vehicle.routeProgress}% Complete
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {vehicle.currentRoute}
                          </Text>
                          <Progress 
                            value={vehicle.routeProgress} 
                            bg="gray.200" 
                            _filledTrack={{ bg: COLORS.primary }}
                            h="2"
                            borderRadius="full"
                          />
                          {vehicle.nextWaypoint && (
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color={COLORS.subtext}>
                                Next: {vehicle.nextWaypoint}
                              </Text>
                              <Text fontSize="xs" color={COLORS.primary}>
                                {vehicle.distanceToDestination} mi • ETA {vehicle.estimatedArrival}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      )}

                      {/* OBD Engine Data */}
                      <VStack space={3}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Engine Telemetrics
                        </Text>
                        
                        <HStack space={4} justifyContent="space-between">
                          <VStack alignItems="center" space={1} flex={1}>
                            <Icon as={Ionicons} name="water" size="sm" color="blue.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Fuel</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {vehicle.fuelLevel}%
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1} flex={1}>
                            <Icon as={Ionicons} name="thermometer" size="sm" color="orange.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Engine °C</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {vehicle.engineTemp}
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1} flex={1}>
                            <Icon as={Ionicons} name="battery-half" size="sm" color="green.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Battery</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {vehicle.batteryVoltage}V
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1} flex={1}>
                            <Icon as={Ionicons} name="speedometer" size="sm" color="purple.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Oil PSI</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {vehicle.oilPressure}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>

                      {/* Active Alerts */}
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
                            <Text fontSize="xs" color="blue.600" fontWeight="600">Map View</Text>
                          </HStack>
                        </Pressable>
                        
                        <Pressable 
                          px={3} 
                          py={2} 
                          bg="green.100" 
                          borderRadius="md" 
                          _pressed={{ bg: 'green.200' }}
                          flex={1}
                        >
                          <HStack alignItems="center" justifyContent="center" space={1}>
                            <Icon as={Ionicons} name="call" size="xs" color="green.600" />
                            <Text fontSize="xs" color="green.600" fontWeight="600">Contact</Text>
                          </HStack>
                        </Pressable>
                        
                        <Pressable 
                          px={3} 
                          py={2} 
                          bg="purple.100" 
                          borderRadius="md" 
                          _pressed={{ bg: 'purple.200' }}
                          flex={1}
                          onPress={() => handleVehicleSelect(vehicle)}
                        >
                          <HStack alignItems="center" justifyContent="center" space={1}>
                            <Icon as={Ionicons} name="analytics" size="xs" color="purple.600" />
                            <Text fontSize="xs" color="purple.600" fontWeight="600">Details</Text>
                          </HStack>
                        </Pressable>
                      </HStack>
                    </VStack>
                  </Box>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Detailed Vehicle Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="500px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedVehicle ? `${selectedVehicle.name} - Live Details` : 'Vehicle Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedVehicle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* GPS Coordinates */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      GPS Location
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Latitude</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.latitude.toFixed(6)}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Longitude</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.longitude.toFixed(6)}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Accuracy</Text>
                      <Text fontSize="sm" color={COLORS.text}>±{selectedVehicle.accuracy}m</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Altitude</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.altitude} ft</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Detailed OBD Data */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Advanced OBD Data
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Intake Air Temp</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.intakeTemp}°C</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Throttle Position</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.throttlePosition}%</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Mass Air Flow</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.maf} g/s</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Coolant Temp</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.coolantTemp}°C</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Trip Performance */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Trip Performance
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Trip Distance</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.tripDistance} mi</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Trip Duration</Text>
                      <Text fontSize="sm" color={COLORS.text}>{Math.floor(selectedVehicle.tripDuration / 60)}h {selectedVehicle.tripDuration % 60}m</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Idle Time</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.idleTime} min</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Max Speed</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.maxSpeed} mph</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Recent Events */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Recent Events
                    </Text>
                    {selectedVehicle.recentEvents.map((event, index) => (
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
              <Button bg={COLORS.primary} onPress={onClose}>
                View on Map
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}