import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton, Image,
  FlatList, Center, Spinner
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function HistoryPage() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week'); // today, week, month, quarter, year
  const [vehicleFilter, setVehicleFilter] = useState('all'); // all, specific vehicle
  const [driverFilter, setDriverFilter] = useState('all'); // all, specific driver
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, distance, duration, efficiency
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclose();
  const { isOpen: isCompareOpen, onOpen: onCompareOpen, onClose: onCompareClose } = useDisclose();

  // Comprehensive trip history data with OBD telematic integration
  const [tripHistory, setTripHistory] = useState([
    {
      id: 'TRIP-001',
      vehicleId: 'VH-001',
      vehicleName: 'Fleet Truck 001',
      driverId: 'DR-001',
      driverName: 'John Smith',
      
      // Trip Basic Info
      startTime: new Date('2024-01-15T08:30:00'),
      endTime: new Date('2024-01-15T16:45:00'),
      duration: 495, // minutes
      totalDistance: 186.5, // miles
      startLocation: 'Fleet Depot - 123 Industrial Blvd',
      endLocation: 'Fleet Depot - 123 Industrial Blvd',
      routeName: 'Downtown Delivery Circuit',
      tripType: 'delivery', // delivery, service, maintenance, personal
      
      // OBD Performance Data
      obdMetrics: {
        averageSpeed: 34.2, // mph
        maxSpeed: 68.5, // mph
        idleTime: 45, // minutes
        fuelConsumed: 22.7, // gallons
        fuelEfficiency: 8.2, // mpg
        engineOnTime: 510, // minutes
        hardBraking: 3, // count
        hardAcceleration: 2, // count
        harshCorners: 1, // count
        excessiveIdling: 8, // instances
        speedingViolations: 2, // count
        engineTemp: {
          average: 89, // °C
          max: 94, // °C
          min: 85 // °C
        },
        oilPressure: {
          average: 45, // PSI
          max: 52, // PSI
          min: 38 // PSI
        },
        batteryVoltage: {
          average: 12.6, // V
          max: 13.2, // V
          min: 11.8 // V
        },
        rpmData: {
          average: 1850, // RPM
          max: 3200, // RPM
          redlineEvents: 0 // count
        }
      },
      
      // Route Performance Analysis
      routeAnalysis: {
        stops: 12, // number of stops
        stopDuration: 185, // total minutes stopped
        averageStopTime: 15.4, // minutes per stop
        drivingTime: 310, // minutes actually driving
        trafficDelay: 23, // minutes in heavy traffic
        optimalRouteDeviation: 5.2, // miles from optimal route
        fuelOptimizationScore: 87, // out of 100
        timeEfficiencyScore: 92, // out of 100
        safetyScore: 78, // out of 100 (affected by harsh events)
        overallScore: 85 // weighted average
      },
      
      // Cost & Environmental Analysis
      costAnalysis: {
        fuelCost: 78.31, // $ based on fuel consumed
        laborCost: 123.75, // $ based on driver hours
        vehicleWearCost: 18.65, // $ estimated wear and tear
        totalTripCost: 220.71, // $ total cost
        revenueGenerated: 485.00, // $ from deliveries
        profitMargin: 264.29, // $ profit from trip
        costPerMile: 1.18, // $ per mile
        costPerHour: 26.74, // $ per hour
        co2Emissions: 0.504, // tons CO2
        fuelEfficiencyRank: 3 // compared to similar trips
      },
      
      // Detailed Stop Information
      stops: [
        {
          id: 'STOP-001',
          location: 'Downtown Mall - Loading Dock',
          arrivalTime: new Date('2024-01-15T09:15:00'),
          departureTime: new Date('2024-01-15T09:45:00'),
          duration: 30, // minutes
          purpose: 'delivery',
          packages: 8,
          idleTime: 5, // minutes engine running while stopped
          engineOff: true,
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        {
          id: 'STOP-002',
          location: 'Office Complex - Bay 3',
          arrivalTime: new Date('2024-01-15T10:30:00'),
          departureTime: new Date('2024-01-15T10:50:00'),
          duration: 20,
          purpose: 'delivery',
          packages: 5,
          idleTime: 3,
          engineOff: true,
          coordinates: { lat: 40.7580, lng: -73.9855 }
        }
        // ... more stops
      ],
      
      // Driver Behavior Analysis
      driverBehavior: {
        overallScore: 78, // out of 100
        speedingScore: 85, // adherence to speed limits
        accelerationScore: 72, // smooth acceleration
        brakingScore: 75, // smooth braking
        corneringScore: 88, // safe cornering
        idlingScore: 65, // minimal unnecessary idling
        seatbeltUsage: 100, // % of trip with seatbelt
        phoneUsage: 0, // minutes detected (if available)
        drowsinessAlerts: 0, // count
        improvements: [
          'Reduce harsh braking events',
          'Minimize idle time at stops',
          'Maintain more consistent speeds'
        ]
      },
      
      // Vehicle Health During Trip
      vehicleHealth: {
        overallCondition: 'Good',
        engineHealth: 95, // %
        transmissionHealth: 92, // %
        brakeHealth: 88, // %
        tireHealth: 91, // %
        batteryHealth: 97, // %
        alertsGenerated: [
          {
            time: new Date('2024-01-15T12:30:00'),
            type: 'warning',
            message: 'Engine temperature slightly elevated',
            resolved: true
          }
        ],
        maintenanceFlags: [],
        diagnosticCodes: [] // OBD trouble codes if any
      },
      
      // Weather & External Conditions
      conditions: {
        weather: 'Partly Cloudy',
        temperature: 72, // °F
        precipitation: 0, // inches
        windSpeed: 8, // mph
        visibility: 10, // miles
        roadConditions: 'Good',
        trafficDensity: 'Moderate'
      },
      
      // Delivery/Service Performance
      serviceMetrics: {
        deliveriesCompleted: 12,
        deliveriesScheduled: 12,
        onTimeDeliveries: 10,
        customerSatisfaction: 4.6, // out of 5
        packageDamage: 0,
        returnsPickedUp: 3,
        specialInstructions: 'Handle with care items',
        deliveryEfficiency: 92 // %
      },
      
      status: 'completed',
      notes: 'Successful delivery route with minor traffic delays',
      verified: true,
      exported: false
    },
    {
      id: 'TRIP-002',
      vehicleId: 'VH-002',
      vehicleName: 'Delivery Van 002',
      driverId: 'DR-002',
      driverName: 'Sarah Johnson',
      
      // Trip Basic Info
      startTime: new Date('2024-01-14T13:00:00'),
      endTime: new Date('2024-01-14T18:30:00'),
      duration: 330, // minutes
      totalDistance: 89.3, // miles
      startLocation: 'Fleet Depot - 123 Industrial Blvd',
      endLocation: 'Fleet Depot - 123 Industrial Blvd',
      routeName: 'Express Delivery Run',
      tripType: 'delivery',
      
      // OBD Performance Data
      obdMetrics: {
        averageSpeed: 28.7,
        maxSpeed: 55.2,
        idleTime: 38,
        fuelConsumed: 12.6,
        fuelEfficiency: 7.1,
        engineOnTime: 345,
        hardBraking: 7, // higher than optimal
        hardAcceleration: 5,
        harshCorners: 3,
        excessiveIdling: 12,
        speedingViolations: 0,
        engineTemp: {
          average: 92,
          max: 98,
          min: 87
        },
        oilPressure: {
          average: 42,
          max: 48,
          min: 35
        },
        batteryVoltage: {
          average: 12.4,
          max: 12.9,
          min: 11.6
        },
        rpmData: {
          average: 2100,
          max: 3800,
          redlineEvents: 1
        }
      },
      
      // Route Performance Analysis
      routeAnalysis: {
        stops: 18,
        stopDuration: 245,
        averageStopTime: 13.6,
        drivingTime: 85,
        trafficDelay: 45,
        optimalRouteDeviation: 8.7,
        fuelOptimizationScore: 72,
        timeEfficiencyScore: 68,
        safetyScore: 61, // lower due to harsh events
        overallScore: 67
      },
      
      // Cost & Environmental Analysis
      costAnalysis: {
        fuelCost: 43.48,
        laborCost: 82.50,
        vehicleWearCost: 15.23,
        totalTripCost: 141.21,
        revenueGenerated: 285.00,
        profitMargin: 143.79,
        costPerMile: 1.58,
        costPerHour: 25.68,
        co2Emissions: 0.279,
        fuelEfficiencyRank: 7
      },
      
      // Driver Behavior Analysis
      driverBehavior: {
        overallScore: 61,
        speedingScore: 95,
        accelerationScore: 58,
        brakingScore: 52,
        corneringScore: 71,
        idlingScore: 58,
        seatbeltUsage: 100,
        phoneUsage: 0,
        drowsinessAlerts: 1,
        improvements: [
          'Significantly reduce harsh braking',
          'Improve acceleration smoothness',
          'Plan routes to reduce traffic delays'
        ]
      },
      
      // Vehicle Health During Trip
      vehicleHealth: {
        overallCondition: 'Fair',
        engineHealth: 89,
        transmissionHealth: 87,
        brakeHealth: 82, // affected by harsh braking
        tireHealth: 85,
        batteryHealth: 91,
        alertsGenerated: [
          {
            time: new Date('2024-01-14T15:45:00'),
            type: 'warning',
            message: 'Excessive harsh braking detected',
            resolved: false
          },
          {
            time: new Date('2024-01-14T17:20:00'),
            type: 'info',
            message: 'High RPM event recorded',
            resolved: true
          }
        ],
        maintenanceFlags: ['Schedule brake inspection'],
        diagnosticCodes: []
      },
      
      conditions: {
        weather: 'Light Rain',
        temperature: 58,
        precipitation: 0.1,
        windSpeed: 12,
        visibility: 8,
        roadConditions: 'Wet',
        trafficDensity: 'Heavy'
      },
      
      serviceMetrics: {
        deliveriesCompleted: 17,
        deliveriesScheduled: 18,
        onTimeDeliveries: 14,
        customerSatisfaction: 4.2,
        packageDamage: 1,
        returnsPickedUp: 2,
        specialInstructions: 'Weather delays expected',
        deliveryEfficiency: 78
      },
      
      status: 'completed',
      notes: 'Route completed with weather-related delays. Driver coaching recommended.',
      verified: true,
      exported: false
    },
    {
      id: 'TRIP-003',
      vehicleId: 'VH-003',
      vehicleName: 'Service Truck 003',
      driverId: 'DR-003',
      driverName: 'Mike Wilson',
      
      // Trip Basic Info
      startTime: new Date('2024-01-13T07:45:00'),
      endTime: new Date('2024-01-13T17:15:00'),
      duration: 570, // minutes
      totalDistance: 234.8, // miles
      startLocation: 'Fleet Depot - 123 Industrial Blvd',
      endLocation: 'Fleet Depot - 123 Industrial Blvd',
      routeName: 'Suburban Service Route',
      tripType: 'service',
      
      // OBD Performance Data
      obdMetrics: {
        averageSpeed: 38.4,
        maxSpeed: 72.3,
        idleTime: 125, // higher due to service work
        fuelConsumed: 24.7,
        fuelEfficiency: 9.5,
        engineOnTime: 585,
        hardBraking: 1,
        hardAcceleration: 0,
        harshCorners: 0,
        excessiveIdling: 4, // minimal considering service nature
        speedingViolations: 0,
        engineTemp: {
          average: 87,
          max: 91,
          min: 84
        },
        oilPressure: {
          average: 48,
          max: 54,
          min: 42
        },
        batteryVoltage: {
          average: 12.8,
          max: 13.4,
          min: 12.2
        },
        rpmData: {
          average: 1650,
          max: 2800,
          redlineEvents: 0
        }
      },
      
      // Route Performance Analysis
      routeAnalysis: {
        stops: 8,
        stopDuration: 420, // longer stops for service work
        averageStopTime: 52.5,
        drivingTime: 150,
        trafficDelay: 8,
        optimalRouteDeviation: 2.1,
        fuelOptimizationScore: 94,
        timeEfficiencyScore: 89,
        safetyScore: 98,
        overallScore: 94
      },
      
      // Cost & Environmental Analysis
      costAnalysis: {
        fuelCost: 85.29,
        laborCost: 142.50,
        vehicleWearCost: 23.48,
        totalTripCost: 251.27,
        revenueGenerated: 850.00, // service calls
        profitMargin: 598.73,
        costPerMile: 1.07,
        costPerHour: 26.44,
        co2Emissions: 0.548,
        fuelEfficiencyRank: 1
      },
      
      // Driver Behavior Analysis
      driverBehavior: {
        overallScore: 96,
        speedingScore: 100,
        accelerationScore: 98,
        brakingScore: 95,
        corneringScore: 100,
        idlingScore: 88, // good considering service requirements
        seatbeltUsage: 100,
        phoneUsage: 0,
        drowsinessAlerts: 0,
        improvements: [
          'Excellent driving performance',
          'Continue current practices',
          'Model driver for fleet'
        ]
      },
      
      // Vehicle Health During Trip
      vehicleHealth: {
        overallCondition: 'Excellent',
        engineHealth: 98,
        transmissionHealth: 97,
        brakeHealth: 96,
        tireHealth: 94,
        batteryHealth: 99,
        alertsGenerated: [],
        maintenanceFlags: [],
        diagnosticCodes: []
      },
      
      conditions: {
        weather: 'Clear',
        temperature: 75,
        precipitation: 0,
        windSpeed: 5,
        visibility: 15,
        roadConditions: 'Excellent',
        trafficDensity: 'Light'
      },
      
      serviceMetrics: {
        servicesCompleted: 8,
        servicesScheduled: 8,
        onTimeServices: 8,
        customerSatisfaction: 4.9,
        workOrdersCompleted: 8,
        partsUsed: 23,
        specialInstructions: 'Preventive maintenance route',
        serviceEfficiency: 98
      },
      
      status: 'completed',
      notes: 'Excellent performance on all metrics. Perfect service completion.',
      verified: true,
      exported: true
    }
  ]);

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update timestamp every minute

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 85) return 'green.500';
    if (score >= 70) return 'orange.500';
    return 'red.500';
  };

  const getTripTypeIcon = (type) => ({
    delivery: 'cube',
    service: 'construct',
    maintenance: 'build',
    personal: 'person'
  }[type]);

  const getTripTypeColor = (type) => ({
    delivery: 'blue.500',
    service: 'purple.500',
    maintenance: 'orange.500',
    personal: 'gray.500'
  }[type]);

  const filteredTrips = tripHistory.filter(trip => {
    const now = new Date();
    const tripDate = new Date(trip.startTime);
    
    // Time filter
    let timeMatch = true;
    switch (timeFilter) {
      case 'today':
        timeMatch = tripDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        timeMatch = tripDate >= weekAgo;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        timeMatch = tripDate >= monthAgo;
        break;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        timeMatch = tripDate >= quarterAgo;
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        timeMatch = tripDate >= yearAgo;
        break;
    }

    // Vehicle filter
    const vehicleMatch = vehicleFilter === 'all' || trip.vehicleId === vehicleFilter;
    
    // Driver filter
    const driverMatch = driverFilter === 'all' || trip.driverId === driverFilter;

    return timeMatch && vehicleMatch && driverMatch;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.startTime) - new Date(a.startTime);
      case 'oldest':
        return new Date(a.startTime) - new Date(b.startTime);
      case 'distance':
        return b.totalDistance - a.totalDistance;
      case 'duration':
        return b.duration - a.duration;
      case 'efficiency':
        return b.obdMetrics.fuelEfficiency - a.obdMetrics.fuelEfficiency;
      default:
        return 0;
    }
  });

  const handleTripDetails = (trip) => {
    setSelectedTrip(trip);
    onOpen();
  };

  // Calculate summary statistics
  const totalTrips = filteredTrips.length;
  const totalDistance = filteredTrips.reduce((sum, trip) => sum + trip.totalDistance, 0);
  const totalFuelConsumed = filteredTrips.reduce((sum, trip) => sum + trip.obdMetrics.fuelConsumed, 0);
  const avgEfficiency = totalFuelConsumed > 0 ? totalDistance / totalFuelConsumed : 0;
  const avgSafetyScore = filteredTrips.length > 0 
    ? filteredTrips.reduce((sum, trip) => sum + trip.driverBehavior.overallScore, 0) / filteredTrips.length 
    : 0;

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
                  Trip History & Analytics
                </Text>
                <HStack alignItems="center" space={2}>
                  <Circle size="8px" bg="blue.500" />
                  <Text fontSize="xs" color={COLORS.subtext}>
                    Live Data • Updated: {lastUpdated.toLocaleTimeString()}
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
                leftIcon={<Icon as={Ionicons} name="download" size="sm" color="white" />}
                onPress={() => setIsLoading(true)}
              >
                Export
              </Button>
            </HStack>
          </HStack>

          {/* Trip Summary Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="list" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalTrips}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Trips</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="speedometer" size="lg" color="purple.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{Math.round(totalDistance)}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Miles Driven</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getScoreColor(avgEfficiency)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="leaf" size="lg" color={getScoreColor(avgEfficiency)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgEfficiency.toFixed(1)}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg MPG</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getScoreColor(avgSafetyScore)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="shield-checkmark" size="lg" color={getScoreColor(avgSafetyScore)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{Math.round(avgSafetyScore)}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Safety Score</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Trip Filters and Controls */}
          <Box bg="white" p={4} borderRadius="xl" shadow={1}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                  Trip Filters & Analysis
                </Text>
                <Switch 
                  isChecked={showAnalytics} 
                  onToggle={setShowAnalytics}
                  colorScheme="green"
                />
              </HStack>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={3}>
                  {['today', 'week', 'month', 'quarter', 'year'].map((filter) => (
                    <Pressable
                      key={filter}
                      px={4}
                      py={2}
                      borderRadius="full"
                      bg={timeFilter === filter ? COLORS.primary : 'gray.100'}
                      onPress={() => setTimeFilter(filter)}
                      _pressed={{ opacity: 0.8 }}
                    >
                      <Text
                        color={timeFilter === filter ? 'white' : COLORS.text}
                        fontSize="sm"
                        fontWeight="500"
                        textTransform="capitalize"
                      >
                        {filter === 'today' ? 'Today' : 
                         filter === 'week' ? 'This Week' :
                         filter === 'month' ? 'This Month' :
                         filter === 'quarter' ? 'Quarter' : 'Year'}
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
                  <Select.Item label="Distance" value="distance" />
                  <Select.Item label="Duration" value="duration" />
                  <Select.Item label="Fuel Efficiency" value="efficiency" />
                </Select>
              </HStack>
            </VStack>
          </Box>

          {/* Trip History List */}
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                Trip History ({sortedTrips.length})
              </Text>
              <Pressable onPress={onCompareOpen}>
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="git-compare" size="sm" color={COLORS.primary} />
                  <Text fontSize="sm" color={COLORS.primary} fontWeight="500">Compare</Text>
                </HStack>
              </Pressable>
            </HStack>
            
            {isLoading ? (
              <Center py={8}>
                <Spinner size="lg" color={COLORS.primary} />
                <Text mt={2} color={COLORS.subtext}>Loading trip data...</Text>
              </Center>
            ) : (
              sortedTrips.map((trip) => (
                <Pressable
                  key={trip.id}
                  onPress={() => handleTripDetails(trip)}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Box 
                    bg="white" 
                    borderRadius="xl" 
                    p={4} 
                    shadow={2}
                    borderLeftWidth={6}
                    borderLeftColor={getTripTypeColor(trip.tripType)}
                  >
                    <VStack space={4}>
                      {/* Trip Header */}
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <HStack space={3} flex={1}>
                          <Box 
                            w="50px" 
                            h="50px" 
                            bg={`${getTripTypeColor(trip.tripType)}.100`}
                            borderRadius="xl" 
                            alignItems="center" 
                            justifyContent="center"
                            position="relative"
                          >
                            <Icon 
                              as={Ionicons} 
                              name={getTripTypeIcon(trip.tripType)} 
                              color={getTripTypeColor(trip.tripType)} 
                              size="lg" 
                            />
                            {trip.status === 'completed' && trip.verified && (
                              <Circle 
                                size="12px" 
                                bg="green.500" 
                                position="absolute" 
                                top="-2px" 
                                right="-2px"
                                borderWidth={2}
                                borderColor="white"
                              >
                                <Icon as={Ionicons} name="checkmark" size="xs" color="white" />
                              </Circle>
                            )}
                          </Box>
                          <VStack space={1} flex={1}>
                            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                              {trip.routeName}
                            </Text>
                            <Text fontSize="sm" color={COLORS.subtext}>
                              {trip.vehicleName} • {trip.driverName}
                            </Text>
                            <HStack alignItems="center" space={2}>
                              <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                                {trip.id}
                              </Text>
                              <Badge bg={getTripTypeColor(trip.tripType)} borderRadius="md" size="sm">
                                <Text color="white" fontSize="xs" fontWeight="600">
                                  {trip.tripType.toUpperCase()}
                                </Text>
                              </Badge>
                              <Badge bg={getScoreColor(trip.routeAnalysis.overallScore)} borderRadius="md" size="sm">
                                <Text color="white" fontSize="xs" fontWeight="600">
                                  {trip.routeAnalysis.overallScore}% SCORE
                                </Text>
                              </Badge>
                            </HStack>
                          </VStack>
                        </HStack>
                        
                        <VStack alignItems="flex-end" space={1}>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {trip.startTime.toLocaleDateString()}
                          </Text>
                          <Text fontSize="xs" color={COLORS.subtext}>
                            {trip.startTime.toLocaleTimeString()} - {trip.endTime.toLocaleTimeString()}
                          </Text>
                          <Text fontSize="xs" fontWeight="600" color={COLORS.text}>
                            {Math.floor(trip.duration / 60)}h {trip.duration % 60}m
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Trip Metrics */}
                      <VStack space={3}>
                        <HStack space={4} justifyContent="space-between">
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="speedometer" size="sm" color="blue.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Distance</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {trip.totalDistance.toFixed(1)} mi
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="leaf" size="sm" color="green.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Fuel Eff.</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {trip.obdMetrics.fuelEfficiency.toFixed(1)} mpg
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="car-sport" size="sm" color="purple.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Avg Speed</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {trip.obdMetrics.averageSpeed.toFixed(1)} mph
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="shield-checkmark" size="sm" color={getScoreColor(trip.driverBehavior.overallScore)} />
                            <Text fontSize="xs" color={COLORS.subtext}>Safety</Text>
                            <Text fontSize="sm" fontWeight="600" color={getScoreColor(trip.driverBehavior.overallScore)}>
                              {trip.driverBehavior.overallScore}%
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="card" size="sm" color="orange.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Cost</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              ${trip.costAnalysis.totalTripCost.toFixed(0)}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>

                      {/* Route Information */}
                      <Box bg="gray.50" p={3} borderRadius="lg">
                        <VStack space={2}>
                          <HStack justifyContent="space-between">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Route Details</Text>
                            <Text fontSize="xs" color={COLORS.subtext}>{trip.routeAnalysis.stops} stops</Text>
                          </HStack>
                          <VStack space={1}>
                            <HStack alignItems="center" space={2}>
                              <Icon as={Ionicons} name="play" size="xs" color="green.500" />
                              <Text fontSize="xs" color={COLORS.text} flex={1} numberOfLines={1}>
                                {trip.startLocation}
                              </Text>
                            </HStack>
                            <HStack alignItems="center" space={2}>
                              <Icon as={Ionicons} name="stop" size="xs" color="red.500" />
                              <Text fontSize="xs" color={COLORS.text} flex={1} numberOfLines={1}>
                                {trip.endLocation}
                              </Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Box>

                      {/* Performance Indicators */}
                      {showAnalytics && (
                        <VStack space={3}>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            Performance Analysis
                          </Text>
                          
                          <HStack space={4} justifyContent="space-between">
                            <VStack alignItems="center" space={1}>
                              <Text fontSize="xs" color={COLORS.subtext}>Route Opt.</Text>
                              <Progress 
                                value={trip.routeAnalysis.fuelOptimizationScore} 
                                bg="gray.200" 
                                _filledTrack={{ bg: getScoreColor(trip.routeAnalysis.fuelOptimizationScore) }}
                                size="sm"
                                w="50px"
                              />
                              <Text fontSize="xs" color={getScoreColor(trip.routeAnalysis.fuelOptimizationScore)}>
                                {trip.routeAnalysis.fuelOptimizationScore}%
                              </Text>
                            </VStack>
                            
                            <VStack alignItems="center" space={1}>
                              <Text fontSize="xs" color={COLORS.subtext}>Time Eff.</Text>
                              <Progress 
                                value={trip.routeAnalysis.timeEfficiencyScore} 
                                bg="gray.200" 
                                _filledTrack={{ bg: getScoreColor(trip.routeAnalysis.timeEfficiencyScore) }}
                                size="sm"
                                w="50px"
                              />
                              <Text fontSize="xs" color={getScoreColor(trip.routeAnalysis.timeEfficiencyScore)}>
                                {trip.routeAnalysis.timeEfficiencyScore}%
                              </Text>
                            </VStack>
                            
                            <VStack alignItems="center" space={1}>
                              <Text fontSize="xs" color={COLORS.subtext}>Vehicle Health</Text>
                              <Progress 
                                value={trip.vehicleHealth.engineHealth} 
                                bg="gray.200" 
                                _filledTrack={{ bg: getScoreColor(trip.vehicleHealth.engineHealth) }}
                                size="sm"
                                w="50px"
                              />
                              <Text fontSize="xs" color={getScoreColor(trip.vehicleHealth.engineHealth)}>
                                {trip.vehicleHealth.engineHealth}%
                              </Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      )}

                      {/* Alerts & Issues */}
                      {trip.vehicleHealth.alertsGenerated.length > 0 && (
                        <Box bg="orange.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="orange.500">
                          <VStack space={2}>
                            <Text fontSize="sm" fontWeight="600" color="orange.700">
                              Trip Alerts ({trip.vehicleHealth.alertsGenerated.length})
                            </Text>
                            {trip.vehicleHealth.alertsGenerated.slice(0, 2).map((alert, index) => (
                              <HStack key={index} space={2} alignItems="center">
                                <Icon as={Ionicons} name="warning" size="xs" color="orange.500" />
                                <Text fontSize="xs" color="orange.600" flex={1}>
                                  {alert.message}
                                </Text>
                                <Text fontSize="xs" color="orange.500">
                                  {alert.time.toLocaleTimeString()}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {/* Driver Improvements */}
                      {trip.driverBehavior.improvements.length > 0 && trip.driverBehavior.overallScore < 85 && (
                        <Box bg="blue.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="blue.500">
                          <VStack space={2}>
                            <Text fontSize="sm" fontWeight="600" color="blue.700">
                              Driver Coaching Opportunities
                            </Text>
                            {trip.driverBehavior.improvements.slice(0, 2).map((improvement, index) => (
                              <HStack key={index} space={2} alignItems="center">
                                <Icon as={Ionicons} name="school" size="xs" color="blue.500" />
                                <Text fontSize="xs" color="blue.600">
                                  {improvement}
                                </Text>
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
                            <Text fontSize="xs" color="blue.600" fontWeight="600">Route</Text>
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
                            <Icon as={Ionicons} name="analytics" size="xs" color="green.600" />
                            <Text fontSize="xs" color="green.600" fontWeight="600">Analytics</Text>
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
                          onPress={() => handleTripDetails(trip)}
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
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Trip Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedTrip ? `${selectedTrip.routeName} - Details` : 'Trip Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedTrip && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Trip Overview */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Trip Overview
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Trip ID</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedTrip.id}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Duration</Text>
                      <Text fontSize="sm" color={COLORS.text}>
                        {Math.floor(selectedTrip.duration / 60)}h {selectedTrip.duration % 60}m
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Total Distance</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedTrip.totalDistance} miles</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Weather</Text>
                      <Text fontSize="sm" color={COLORS.text}>
                        {selectedTrip.conditions.weather}, {selectedTrip.conditions.temperature}°F
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Detailed OBD Metrics */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      OBD Performance Data
                    </Text>
                    {Object.entries(selectedTrip.obdMetrics).map(([key, value]) => {
                      if (typeof value === 'object') return null;
                      return (
                        <HStack key={key} justifyContent="space-between">
                          <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                          <Text fontSize="sm" color={COLORS.text}>
                            {typeof value === 'number' ? 
                              (key.includes('Speed') ? `${value.toFixed(1)} mph` :
                               key.includes('Time') ? `${value} min` :
                               key.includes('Fuel') && key.includes('Consumed') ? `${value.toFixed(1)} gal` :
                               key.includes('Efficiency') ? `${value.toFixed(1)} mpg` :
                               key.includes('Braking') || key.includes('Acceleration') || key.includes('Corners') || key.includes('Idling') || key.includes('Violations') ? `${value} events` :
                               value
                              ) : value
                            }
                          </Text>
                        </HStack>
                      );
                    })}
                  </VStack>

                  <Divider />

                  {/* Cost Analysis */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Cost Analysis
                    </Text>
                    {Object.entries(selectedTrip.costAnalysis).map(([key, value]) => (
                      <HStack key={key} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text fontSize="sm" color={typeof value === 'number' && key.includes('Cost') ? 'green.500' : COLORS.text}>
                          {typeof value === 'number' ? 
                            (key.includes('Cost') || key.includes('Revenue') || key.includes('Margin') ? `$${value.toFixed(2)}` :
                             key.includes('Rank') ? `#${value}` :
                             key.includes('Emissions') ? `${value} tons` :
                             value
                            ) : value
                          }
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Driver Behavior Analysis */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Driver Behavior Analysis
                    </Text>
                    {Object.entries(selectedTrip.driverBehavior)
                      .filter(([key]) => key !== 'improvements')
                      .map(([key, value]) => (
                      <HStack key={key} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text fontSize="sm" color={typeof value === 'number' && value < 70 ? 'red.500' : COLORS.text}>
                          {typeof value === 'number' ? 
                            (key.includes('Score') ? `${value}%` :
                             key.includes('Usage') ? `${value}%` :
                             key.includes('Alerts') ? `${value} alerts` :
                             value
                            ) : value
                          }
                        </Text>
                      </HStack>
                    ))}
                    
                    {selectedTrip.driverBehavior.improvements.length > 0 && (
                      <>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text} mt={3}>
                          Improvement Opportunities
                        </Text>
                        {selectedTrip.driverBehavior.improvements.map((improvement, index) => (
                          <HStack key={index} space={2} alignItems="flex-start">
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="600">
                              {index + 1}.
                            </Text>
                            <Text fontSize="sm" color={COLORS.text} flex={1}>
                              {improvement}
                            </Text>
                          </HStack>
                        ))}
                      </>
                    )}
                  </VStack>

                  <Divider />

                  {/* Service/Delivery Metrics */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      {selectedTrip.tripType === 'service' ? 'Service Metrics' : 'Delivery Metrics'}
                    </Text>
                    {Object.entries(selectedTrip.serviceMetrics).map(([key, value]) => (
                      <HStack key={key} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text fontSize="sm" color={COLORS.text}>
                          {typeof value === 'number' ? 
                            (key.includes('Satisfaction') ? `${value}/5 ⭐` :
                             key.includes('Efficiency') ? `${value}%` :
                             value
                            ) : value
                          }
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
                onAnalyticsOpen();
              }}>
                View Analytics
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Analytics Modal */}
      <Modal isOpen={isAnalyticsOpen} onClose={onAnalyticsClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Trip Analytics & Insights</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Comprehensive fleet performance analysis and trends
              </Text>
              
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Fleet Performance Summary
                </Text>
                <Box bg="gray.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Total Trips</Text>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>{totalTrips}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Total Distance</Text>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        {Math.round(totalDistance)} miles
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Average Efficiency</Text>
                      <Text fontSize="sm" fontWeight="600" color={getScoreColor(avgEfficiency * 10)}>
                        {avgEfficiency.toFixed(1)} mpg
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Safety Score</Text>
                      <Text fontSize="sm" fontWeight="600" color={getScoreColor(avgSafetyScore)}>
                        {Math.round(avgSafetyScore)}%
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Best Performer</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">
                        Mike Wilson (96% avg)
                      </Text>
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
                Generate Report
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Trip Comparison Modal */}
      <Modal isOpen={isCompareOpen} onClose={onCompareClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Compare Trips</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Select trips to compare performance metrics
              </Text>
              <Text fontSize="sm" color={COLORS.text}>
                Trip comparison feature coming soon...
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onCompareClose}>
                Close
              </Button>
              <Button bg={COLORS.primary} onPress={onCompareClose}>
                Compare Selected
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}