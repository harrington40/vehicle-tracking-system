import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton, Alert
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function AlertsPage() {
  const router = useRouter();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertFilter, setAlertFilter] = useState('all'); // all, critical, warning, info, resolved
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority, vehicle
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclose();

  // Comprehensive alert data with real-time telematic integration
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-001',
      type: 'critical',
      category: 'engine',
      title: 'Engine Overheating Warning',
      description: 'Engine temperature has exceeded safe operating limits',
      vehicleId: 'VH-002',
      vehicleName: 'Delivery Van 002',
      driverId: 'DR-002',
      driverName: 'Sarah Johnson',
      location: 'Interstate 95, Mile 23',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: 'active',
      priority: 'critical',
      source: 'OBD',
      
      // Telematic Data
      telematicData: {
        engineTemp: 105, // °C (critical threshold: 100°C)
        coolantLevel: 45, // % (low)
        oilPressure: 28, // PSI (low)
        batteryVoltage: 11.8, // V (low)
        speed: 65, // mph
        rpm: 2800,
        fuelLevel: 23 // %
      },
      
      // Alert Metrics
      alertMetrics: {
        duration: 5, // minutes active
        escalationLevel: 2, // 0-3 scale
        impactSeverity: 'high',
        estimatedCost: 450, // $ potential damage
        safetyRisk: 'high'
      },
      
      // Actions & Response
      actionsTaken: [
        { time: '2 min ago', action: 'Driver notified via mobile app', status: 'completed' },
        { time: '1 min ago', action: 'Dispatch contacted driver', status: 'completed' }
      ],
      recommendedActions: [
        'Pull over safely immediately',
        'Turn off engine and wait for cooling',
        'Check coolant level',
        'Contact roadside assistance'
      ],
      
      relatedAlerts: ['ALT-045', 'ALT-032'],
      isResolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: []
    },
    {
      id: 'ALT-002',
      type: 'warning',
      category: 'fuel',
      title: 'Low Fuel Alert',
      description: 'Vehicle fuel level below 15% threshold',
      vehicleId: 'VH-002',
      vehicleName: 'Delivery Van 002',
      driverId: 'DR-002',
      driverName: 'Sarah Johnson',
      location: 'Downtown Business District',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      status: 'acknowledged',
      priority: 'medium',
      source: 'OBD',
      
      telematicData: {
        fuelLevel: 12, // % (critical threshold: 15%)
        fuelEfficiency: 6.8, // mpg current
        rangeRemaining: 45, // miles
        nearestFuelStation: 2.3, // miles away
        estimatedFuelCost: 45.60, // $ to fill up
        speed: 32,
        engineTemp: 89,
        batteryVoltage: 12.4
      },
      
      alertMetrics: {
        duration: 15,
        escalationLevel: 1,
        impactSeverity: 'medium',
        estimatedCost: 50,
        safetyRisk: 'low'
      },
      
      actionsTaken: [
        { time: '10 min ago', action: 'Driver acknowledged alert', status: 'completed' },
        { time: '8 min ago', action: 'Route to nearest fuel station sent', status: 'completed' }
      ],
      recommendedActions: [
        'Proceed to nearest fuel station',
        'Monitor fuel level closely',
        'Adjust route if necessary'
      ],
      
      relatedAlerts: [],
      isResolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: [{ time: '10 min ago', note: 'Driver confirmed en route to fuel station', author: 'Sarah Johnson' }]
    },
    {
      id: 'ALT-003',
      type: 'info',
      category: 'maintenance',
      title: 'Scheduled Maintenance Due',
      description: 'Vehicle approaching scheduled maintenance interval',
      vehicleId: 'VH-001',
      vehicleName: 'Fleet Truck 001',
      driverId: 'DR-001',
      driverName: 'John Smith',
      location: 'Service completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'resolved',
      priority: 'low',
      source: 'System',
      
      telematicData: {
        odometer: 45689, // miles
        engineHours: 1250, // hours
        oilLife: 8, // % remaining
        airFilterLife: 15, // % remaining
        lastServiceMileage: 42500,
        serviceInterval: 3000, // miles
        engineTemp: 87,
        batteryVoltage: 12.6
      },
      
      alertMetrics: {
        duration: 120,
        escalationLevel: 0,
        impactSeverity: 'low',
        estimatedCost: 250,
        safetyRisk: 'low'
      },
      
      actionsTaken: [
        { time: '1 hour ago', action: 'Maintenance scheduled for tomorrow', status: 'completed' },
        { time: '30 min ago', action: 'Service center contacted', status: 'completed' }
      ],
      recommendedActions: [],
      
      relatedAlerts: [],
      isResolved: true,
      resolvedBy: 'Fleet Manager',
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
      notes: [{ time: '1 hour ago', note: 'Maintenance appointment scheduled for 8 AM tomorrow', author: 'Fleet Manager' }]
    },
    {
      id: 'ALT-004',
      type: 'warning',
      category: 'driver_behavior',
      title: 'Harsh Driving Detected',
      description: 'Multiple harsh braking events detected in short period',
      vehicleId: 'VH-004',
      vehicleName: 'Cargo Van 004',
      driverId: 'DR-004',
      driverName: 'Lisa Chen',
      location: 'Highway 101, Heavy Traffic Zone',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'active',
      priority: 'medium',
      source: 'OBD',
      
      telematicData: {
        harshBrakingCount: 5, // in last 10 minutes
        harshAccelerationCount: 2,
        harshCorneringCount: 1,
        avgSpeed: 45,
        maxSpeed: 68,
        driverScore: 76, // decreased from 82
        speed: 52,
        engineTemp: 91
      },
      
      alertMetrics: {
        duration: 30,
        escalationLevel: 1,
        impactSeverity: 'medium',
        estimatedCost: 75, // brake wear, fuel consumption
        safetyRisk: 'medium'
      },
      
      actionsTaken: [
        { time: '25 min ago', action: 'Driver coaching notification sent', status: 'completed' }
      ],
      recommendedActions: [
        'Reduce following distance',
        'Anticipate traffic conditions',
        'Maintain steady speed',
        'Schedule driver coaching session'
      ],
      
      relatedAlerts: ['ALT-028'],
      isResolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: []
    },
    {
      id: 'ALT-005',
      type: 'critical',
      category: 'security',
      title: 'Vehicle Theft Alert',
      description: 'Unauthorized vehicle movement detected outside operating hours',
      vehicleId: 'VH-003',
      vehicleName: 'Service Truck 003',
      driverId: null,
      driverName: 'Unassigned',
      location: 'Parking Lot B - Moved 0.5 miles',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: 'escalated',
      priority: 'critical',
      source: 'GPS',
      
      telematicData: {
        ignitionStatus: 'On',
        speed: 25,
        engineTemp: 85,
        batteryVoltage: 12.5,
        gpsAccuracy: 2.1, // meters
        engineRunTime: 8, // minutes
        doorStatus: 'Driver door open',
        alarmStatus: 'Triggered'
      },
      
      alertMetrics: {
        duration: 45,
        escalationLevel: 3,
        impactSeverity: 'critical',
        estimatedCost: 85000, // vehicle value
        safetyRisk: 'high'
      },
      
      actionsTaken: [
        { time: '40 min ago', action: 'Security team notified', status: 'completed' },
        { time: '35 min ago', action: 'Police contacted', status: 'completed' },
        { time: '30 min ago', action: 'Vehicle immobilizer activated', status: 'completed' }
      ],
      recommendedActions: [
        'Track vehicle location',
        'Coordinate with law enforcement',
        'Prepare insurance claim',
        'Review security footage'
      ],
      
      relatedAlerts: [],
      isResolved: false,
      resolvedBy: null,
      resolvedAt: null,
      notes: [
        { time: '35 min ago', note: 'Police case #2024-001234 opened', author: 'Security Team' },
        { time: '30 min ago', note: 'Vehicle stopped, engine immobilized', author: 'System' }
      ]
    }
  ]);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate real-time alert updates
        setAlerts(prev => prev.map(alert => ({
          ...alert,
          alertMetrics: {
            ...alert.alertMetrics,
            duration: alert.alertMetrics.duration + 1
          }
        })));
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getAlertTypeColor = (type) => ({
    critical: 'red.500',
    warning: 'orange.500',
    info: 'blue.500',
    success: 'green.500'
  }[type]);

  const getAlertIcon = (category) => ({
    engine: 'build',
    fuel: 'water',
    maintenance: 'construct',
    driver_behavior: 'person',
    security: 'shield',
    gps: 'location',
    temperature: 'thermometer',
    battery: 'battery-half'
  }[category]);

  const getPriorityColor = (priority) => ({
    critical: 'red.500',
    high: 'orange.600',
    medium: 'orange.400',
    low: 'blue.500'
  }[priority]);

  const getStatusColor = (status) => ({
    active: 'red.500',
    acknowledged: 'orange.500',
    escalated: 'red.600',
    resolved: 'green.500'
  }[status]);

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'resolved') return alert.isResolved;
    return alert.type === alertFilter || alert.priority === alertFilter;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp) - new Date(a.timestamp);
      case 'oldest':
        return new Date(a.timestamp) - new Date(b.timestamp);
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'vehicle':
        return a.vehicleName.localeCompare(b.vehicleName);
      default:
        return 0;
    }
  });

  const handleAlertDetails = (alert) => {
    setSelectedAlert(alert);
    onOpen();
  };

  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            isResolved: true, 
            status: 'resolved',
            resolvedBy: 'Fleet Manager',
            resolvedAt: new Date()
          }
        : alert
    ));
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' }
        : alert
    ));
  };

  // Calculate alert statistics
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(a => !a.isResolved).length;
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.isResolved).length;
  const avgResponseTime = 8; // minutes

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
                  Alert Management
                </Text>
                <HStack alignItems="center" space={2}>
                  <Circle size="8px" bg={autoRefresh ? "green.500" : "gray.400"} />
                  <Text fontSize="xs" color={COLORS.subtext}>
                    {autoRefresh ? 'Live Monitoring' : 'Paused'} • Updated: {lastUpdated.toLocaleTimeString()}
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
                onPress={onSettingsOpen}
                leftIcon={<Icon as={Ionicons} name="settings" size="sm" color={COLORS.primary} />}
              >
                Settings
              </Button>
              <Button 
                size="sm" 
                bg={COLORS.primary}
                leftIcon={<Icon as={Ionicons} name="refresh" size="sm" color="white" />}
                onPress={() => setLastUpdated(new Date())}
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Alert Statistics Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="notifications" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalAlerts}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Alerts</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="red.500" shadow={1}>
              <VStack space={2}>
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="warning" size="lg" color="red.500" />
                  {criticalAlerts > 0 && <Circle size="6px" bg="red.500" />}
                </HStack>
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{activeAlerts}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Active Alerts</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="orange.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="alert-circle" size="lg" color="orange.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{criticalAlerts}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Critical</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="time" size="lg" color="green.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgResponseTime}m</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Response</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Alert Filters and Controls */}
          <Box bg="white" p={4} borderRadius="xl" shadow={1}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                  Alert Controls
                </Text>
                <Switch 
                  isChecked={autoRefresh} 
                  onToggle={setAutoRefresh}
                  colorScheme="green"
                />
              </HStack>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={3}>
                  {['all', 'critical', 'warning', 'info', 'resolved'].map((filter) => (
                    <Pressable
                      key={filter}
                      px={4}
                      py={2}
                      borderRadius="full"
                      bg={alertFilter === filter ? COLORS.primary : 'gray.100'}
                      onPress={() => setAlertFilter(filter)}
                      _pressed={{ opacity: 0.8 }}
                    >
                      <Text
                        color={alertFilter === filter ? 'white' : COLORS.text}
                        fontSize="sm"
                        fontWeight="500"
                        textTransform="capitalize"
                      >
                        {filter === 'all' ? 'All Alerts' : filter}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>

              <HStack space={3} alignItems="center">
                <Text fontSize="sm" color={COLORS.subtext}>Sort by:</Text>
                <Select 
                  selectedValue={sortBy} 
                  onValueChange={setSortBy}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  flex={1}
                >
                  <Select.Item label="Newest First" value="newest" />
                  <Select.Item label="Oldest First" value="oldest" />
                  <Select.Item label="Priority" value="priority" />
                  <Select.Item label="Vehicle" value="vehicle" />
                </Select>
              </HStack>
            </VStack>
          </Box>

          {/* Alerts List */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Alert Overview ({sortedAlerts.length})
            </Text>
            
            {sortedAlerts.map((alert) => (
              <Pressable
                key={alert.id}
                onPress={() => handleAlertDetails(alert)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box 
                  bg="white" 
                  borderRadius="xl" 
                  p={4} 
                  shadow={2}
                  borderLeftWidth={6}
                  borderLeftColor={getAlertTypeColor(alert.type)}
                >
                  <VStack space={4}>
                    {/* Alert Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box 
                          w="50px" 
                          h="50px" 
                          bg={`${getAlertTypeColor(alert.type)}.100`}
                          borderRadius="xl" 
                          alignItems="center" 
                          justifyContent="center"
                          position="relative"
                        >
                          <Icon 
                            as={Ionicons} 
                            name={getAlertIcon(alert.category)} 
                            color={getAlertTypeColor(alert.type)} 
                            size="lg" 
                          />
                          {!alert.isResolved && alert.type === 'critical' && (
                            <Circle 
                              size="8px" 
                              bg="red.500" 
                              position="absolute" 
                              top="2px" 
                              right="2px"
                            />
                          )}
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                            {alert.title}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext} numberOfLines={2}>
                            {alert.description}
                          </Text>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                              {alert.id}
                            </Text>
                            <Badge bg={getPriorityColor(alert.priority)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {alert.priority.toUpperCase()}
                              </Text>
                            </Badge>
                            <Badge bg={getStatusColor(alert.status)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {alert.status.toUpperCase()}
                              </Text>
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={2}>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {alert.timestamp.toLocaleString()}
                        </Text>
                        <HStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="time" size="xs" color="gray.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>
                            {alert.alertMetrics.duration}m active
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Vehicle and Driver Info */}
                    <HStack space={4} justifyContent="space-between">
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="car" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                          {alert.vehicleName}
                        </Text>
                      </HStack>
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="person" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                          {alert.driverName || 'Unassigned'}
                        </Text>
                      </HStack>
                      <HStack space={2} flex={1}>
                        <Icon as={Ionicons} name="location" size="sm" color="gray.500" />
                        <Text fontSize="sm" color={COLORS.text} numberOfLines={1}>
                          {alert.location}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* Key Telematic Data */}
                    {alert.telematicData && (
                      <VStack space={3}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Live Telematic Data
                        </Text>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <HStack space={4}>
                            {alert.category === 'engine' && (
                              <>
                                <VStack alignItems="center" space={1}>
                                  <Icon as={Ionicons} name="thermometer" size="sm" color="red.500" />
                                  <Text fontSize="xs" color={COLORS.subtext}>Engine Temp</Text>
                                  <Text fontSize="sm" fontWeight="600" color="red.500">
                                    {alert.telematicData.engineTemp}°C
                                  </Text>
                                </VStack>
                                <VStack alignItems="center" space={1}>
                                  <Icon as={Ionicons} name="water" size="sm" color="blue.500" />
                                  <Text fontSize="xs" color={COLORS.subtext}>Coolant</Text>
                                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                    {alert.telematicData.coolantLevel}%
                                  </Text>
                                </VStack>
                                <VStack alignItems="center" space={1}>
                                  <Icon as={Ionicons} name="speedometer" size="sm" color="orange.500" />
                                  <Text fontSize="xs" color={COLORS.subtext}>Oil PSI</Text>
                                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                    {alert.telematicData.oilPressure}
                                  </Text>
                                </VStack>
                              </>
                            )}

                            {alert.category === 'fuel' && (
                              <>
                                <VStack alignItems="center" space={1}>
                                  <Icon as={Ionicons} name="water" size="sm" color="red.500" />
                                  <Text fontSize="xs" color={COLORS.subtext}>Fuel Level</Text>
                                  <Text fontSize="sm" fontWeight="600" color="red.500">
                                    {alert.telematicData.fuelLevel}%
                                  </Text>
                                </VStack>
                                <VStack alignItems="center" space={1}>
                                  <Icon as={Ionicons} name="location" size="sm" color="blue.500" />
                                  <Text fontSize="xs" color={COLORS.subtext}>Range</Text>
                                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                    {alert.telematicData.rangeRemaining} mi
                                  </Text>
                                </VStack>
                                <VStack alignItems="center" space={1}>
                                  <Icon as={Ionicons} name="business" size="sm" color="green.500" />
                                  <Text fontSize="xs" color={COLORS.subtext}>Station</Text>
                                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                    {alert.telematicData.nearestFuelStation} mi
                                  </Text>
                                </VStack>
                              </>
                            )}

                            <VStack alignItems="center" space={1}>
                              <Icon as={Ionicons} name="speedometer" size="sm" color="purple.500" />
                              <Text fontSize="xs" color={COLORS.subtext}>Speed</Text>
                              <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                                {alert.telematicData.speed} mph
                              </Text>
                            </VStack>
                          </HStack>
                        </ScrollView>
                      </VStack>
                    )}

                    {/* Impact Assessment */}
                    <VStack space={3}>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        Impact Assessment
                      </Text>
                      
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Safety Risk</Text>
                          <Badge bg={alert.alertMetrics.safetyRisk === 'high' ? 'red.500' : 
                                    alert.alertMetrics.safetyRisk === 'medium' ? 'orange.500' : 'green.500'}>
                            <Text color="white" fontSize="xs">{alert.alertMetrics.safetyRisk.toUpperCase()}</Text>
                          </Badge>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Est. Cost</Text>
                          <Text fontSize="sm" fontWeight="600" color="red.500">
                            ${alert.alertMetrics.estimatedCost}
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Escalation</Text>
                          <HStack space={1}>
                            {[...Array(4)].map((_, i) => (
                              <Circle 
                                key={i}
                                size="6px" 
                                bg={i < alert.alertMetrics.escalationLevel ? 'red.500' : 'gray.300'} 
                              />
                            ))}
                          </HStack>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Source</Text>
                          <Badge bg="blue.500">
                            <Text color="white" fontSize="xs">{alert.source}</Text>
                          </Badge>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Actions Taken */}
                    {alert.actionsTaken.length > 0 && (
                      <VStack space={2}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Actions Taken ({alert.actionsTaken.length})
                        </Text>
                        {alert.actionsTaken.slice(0, 2).map((action, index) => (
                          <HStack key={index} space={2} alignItems="center">
                            <Icon as={Ionicons} name="checkmark-circle" size="xs" color="green.500" />
                            <Text fontSize="xs" color={COLORS.text} flex={1}>
                              {action.action}
                            </Text>
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {action.time}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    )}

                    {/* Action Buttons */}
                    <Divider />
                    <HStack space={2} justifyContent="space-between">
                      {!alert.isResolved && alert.status !== 'acknowledged' && (
                        <Pressable 
                          px={3} 
                          py={2} 
                          bg="blue.100" 
                          borderRadius="md" 
                          _pressed={{ bg: 'blue.200' }}
                          flex={1}
                          onPress={() => handleAcknowledgeAlert(alert.id)}
                        >
                          <HStack alignItems="center" justifyContent="center" space={1}>
                            <Icon as={Ionicons} name="eye" size="xs" color="blue.600" />
                            <Text fontSize="xs" color="blue.600" fontWeight="600">Acknowledge</Text>
                          </HStack>
                        </Pressable>
                      )}
                      
                      {!alert.isResolved && (
                        <Pressable 
                          px={3} 
                          py={2} 
                          bg="green.100" 
                          borderRadius="md" 
                          _pressed={{ bg: 'green.200' }}
                          flex={1}
                          onPress={() => handleResolveAlert(alert.id)}
                        >
                          <HStack alignItems="center" justifyContent="center" space={1}>
                            <Icon as={Ionicons} name="checkmark-done" size="xs" color="green.600" />
                            <Text fontSize="xs" color="green.600" fontWeight="600">Resolve</Text>
                          </HStack>
                        </Pressable>
                      )}
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="purple.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'purple.200' }}
                        flex={1}
                        onPress={() => handleAlertDetails(alert)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="information-circle" size="xs" color="purple.600" />
                          <Text fontSize="xs" color="purple.600" fontWeight="600">Details</Text>
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

      {/* Alert Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedAlert ? `${selectedAlert.title} - Details` : 'Alert Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedAlert && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Alert Overview */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Alert Information
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Alert ID</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedAlert.id}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Category</Text>
                      <Text fontSize="sm" color={COLORS.text} textTransform="capitalize">
                        {selectedAlert.category.replace('_', ' ')}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Source</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedAlert.source}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Duration</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedAlert.alertMetrics.duration} minutes</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Detailed Telematic Data */}
                  {selectedAlert.telematicData && (
                    <>
                      <VStack space={3}>
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          Detailed Telematic Data
                        </Text>
                        {Object.entries(selectedAlert.telematicData).map(([key, value]) => (
                          <HStack key={key} justifyContent="space-between">
                            <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Text>
                            <Text fontSize="sm" color={COLORS.text}>
                              {typeof value === 'number' ? 
                                (key.includes('Temp') ? `${value}°C` :
                                 key.includes('Level') || key.includes('Life') ? `${value}%` :
                                 key.includes('Pressure') ? `${value} PSI` :
                                 key.includes('Voltage') ? `${value}V` :
                                 key.includes('Speed') ? `${value} mph` :
                                 key.includes('Cost') ? `$${value}` :
                                 key.includes('Distance') || key.includes('Range') ? `${value} mi` :
                                 value
                                ) : value
                              }
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <Divider />
                    </>
                  )}

                  {/* Recommended Actions */}
                  {selectedAlert.recommendedActions.length > 0 && (
                    <>
                      <VStack space={3}>
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          Recommended Actions
                        </Text>
                        {selectedAlert.recommendedActions.map((action, index) => (
                          <HStack key={index} space={2} alignItems="flex-start">
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="600">
                              {index + 1}.
                            </Text>
                            <Text fontSize="sm" color={COLORS.text} flex={1}>
                              {action}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                      <Divider />
                    </>
                  )}

                  {/* Action History */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Action History
                    </Text>
                    {selectedAlert.actionsTaken.map((action, index) => (
                      <HStack key={index} justifyContent="space-between" alignItems="center">
                        <HStack space={2} alignItems="center" flex={1}>
                          <Icon as={Ionicons} name="checkmark-circle" size="xs" color="green.500" />
                          <Text fontSize="sm" color={COLORS.text} flex={1}>
                            {action.action}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {action.time}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  {/* Notes */}
                  {selectedAlert.notes.length > 0 && (
                    <>
                      <Divider />
                      <VStack space={3}>
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          Notes & Comments
                        </Text>
                        {selectedAlert.notes.map((note, index) => (
                          <Box key={index} bg="gray.50" p={3} borderRadius="lg">
                            <VStack space={1}>
                              <Text fontSize="sm" color={COLORS.text}>
                                {note.note}
                              </Text>
                              <HStack justifyContent="space-between">
                                <Text fontSize="xs" color={COLORS.subtext}>
                                  By: {note.author}
                                </Text>
                                <Text fontSize="xs" color={COLORS.subtext}>
                                  {note.time}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </>
                  )}
                </VStack>
              </ScrollView>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                Close
              </Button>
              {selectedAlert && !selectedAlert.isResolved && (
                <Button bg={COLORS.primary} onPress={() => {
                  handleResolveAlert(selectedAlert.id);
                  onClose();
                }}>
                  Resolve Alert
                </Button>
              )}
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Alert Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Alert Settings & Configuration</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Configure alert thresholds and notification preferences
              </Text>
              
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Engine Temperature Threshold
                </Text>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>Critical (°C)</Text>
                  <Input 
                    width="100px" 
                    defaultValue="100" 
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>Warning (°C)</Text>
                  <Input 
                    width="100px" 
                    defaultValue="95" 
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </HStack>
              </VStack>

              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Fuel Level Alerts
                </Text>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>Low Fuel (%)</Text>
                  <Input 
                    width="100px" 
                    defaultValue="15" 
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>Critical (%)</Text>
                  <Input 
                    width="100px" 
                    defaultValue="5" 
                    keyboardType="numeric"
                    textAlign="center"
                  />
                </HStack>
              </VStack>

              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Notification Settings
                </Text>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>Email Notifications</Text>
                  <Switch colorScheme="green" defaultIsChecked />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>SMS Alerts</Text>
                  <Switch colorScheme="green" defaultIsChecked />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="sm" color={COLORS.subtext}>Push Notifications</Text>
                  <Switch colorScheme="green" defaultIsChecked />
                </HStack>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onSettingsClose}>
                Cancel
              </Button>
              <Button bg={COLORS.primary} onPress={onSettingsClose}>
                Save Settings
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}