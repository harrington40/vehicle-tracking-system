import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton, Image
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function FuelPage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fuelFilter, setFuelFilter] = useState('all'); // all, low, normal, excellent
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month, year
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclose();
  const { isOpen: isStationOpen, onOpen: onStationOpen, onClose: onStationClose } = useDisclose();

  // Comprehensive fuel data with OBD telematic integration
  const [fuelData, setFuelData] = useState([
    {
      id: 'VH-001',
      vehicleName: 'Fleet Truck 001',
      driverId: 'DR-001',
      driverName: 'John Smith',
      
      // Real-time Fuel Status
      currentFuelLevel: 78, // %
      fuelCapacity: 80, // gallons
      currentFuelAmount: 62.4, // gallons
      rangeRemaining: 485, // miles
      lowFuelThreshold: 15, // %
      criticalFuelThreshold: 5, // %
      
      // OBD Telematic Data
      telematicData: {
        instantMPG: 8.4,
        averageMPG: 8.2,
        tripMPG: 7.9,
        fuelFlowRate: 2.1, // gallons/hour
        engineLoad: 45, // %
        throttlePosition: 23, // %
        fuelPressure: 58, // PSI
        fuelTemp: 85, // °F
        injectorPulseWidth: 3.2, // ms
        fuelTrimBank1: 2.1, // %
        fuelTrimBank2: 1.8, // %
        airFuelRatio: 14.7,
        oxygenSensorVoltage: 0.45 // V
      },
      
      // Fuel Performance Metrics
      performance: {
        efficiencyScore: 87, // out of 100
        efficiencyTrend: 'improving', // improving, stable, declining
        costPerMile: 0.42, // $
        monthlyFuelCost: 856.30, // $
        yearlyFuelCost: 10275.60, // $
        fuelSavings: 125.50, // $ saved this month vs target
        co2Emissions: 2.3, // tons this month
        idleFuelWaste: 8.5 // gallons this month
      },
      
      // Fuel History & Transactions
      fuelHistory: [
        {
          date: '2024-01-15 14:30',
          station: 'Shell Station Downtown',
          gallons: 65.2,
          pricePerGallon: 3.45,
          totalCost: 224.94,
          odometer: 45680,
          efficiency: 8.1,
          location: '123 Main St, Downtown',
          paymentMethod: 'Fleet Card'
        },
        {
          date: '2024-01-12 09:15',
          station: 'BP Express Highway',
          gallons: 58.7,
          pricePerGallon: 3.52,
          totalCost: 206.62,
          odometer: 45180,
          efficiency: 8.3,
          location: 'Highway 101 Mile 45',
          paymentMethod: 'Fleet Card'
        }
      ],
      
      // Fuel Consumption Analysis
      consumption: {
        dailyAverage: 12.5, // gallons
        weeklyTotal: 87.5, // gallons
        monthlyTotal: 348.2, // gallons
        milesPerGallon: 8.2,
        milesPerDollar: 2.38,
        fuelEfficiencyRank: 3, // out of fleet
        comparedToFleetAvg: '+12%', // better than average
        optimalFuelLevel: 85 // % for route efficiency
      },
      
      // Route & Location Data
      currentRoute: 'Downtown Delivery Circuit',
      nearestStations: [
        { name: 'Shell Downtown', distance: 0.8, price: 3.45, rating: 4.2 },
        { name: 'Exxon Center', distance: 1.2, price: 3.41, rating: 4.5 },
        { name: 'BP Express', distance: 1.5, price: 3.52, rating: 4.0 }
      ],
      
      // Maintenance & Alerts
      fuelSystemHealth: 'Good', // Excellent, Good, Fair, Poor
      nextFuelFilterChange: '3,500 miles',
      fuelPumpHealth: 98, // %
      alerts: [],
      recommendations: [
        'Consider refueling after current route',
        'Fuel efficiency 12% above fleet average',
        'Optimal performance range maintained'
      ]
    },
    {
      id: 'VH-002',
      vehicleName: 'Delivery Van 002',
      driverId: 'DR-002',
      driverName: 'Sarah Johnson',
      
      // Real-time Fuel Status
      currentFuelLevel: 23, // % - LOW
      fuelCapacity: 25, // gallons
      currentFuelAmount: 5.75, // gallons
      rangeRemaining: 48, // miles
      lowFuelThreshold: 25, // %
      criticalFuelThreshold: 10, // %
      
      // OBD Telematic Data
      telematicData: {
        instantMPG: 6.8,
        averageMPG: 7.1,
        tripMPG: 6.5,
        fuelFlowRate: 3.2,
        engineLoad: 62,
        throttlePosition: 35,
        fuelPressure: 55,
        fuelTemp: 92,
        injectorPulseWidth: 4.1,
        fuelTrimBank1: 3.8,
        fuelTrimBank2: 4.2,
        airFuelRatio: 14.2,
        oxygenSensorVoltage: 0.52
      },
      
      // Fuel Performance Metrics
      performance: {
        efficiencyScore: 72,
        efficiencyTrend: 'declining',
        costPerMile: 0.58,
        monthlyFuelCost: 1245.80,
        yearlyFuelCost: 14949.60,
        fuelSavings: -89.30, // over budget
        co2Emissions: 3.1,
        idleFuelWaste: 15.2
      },
      
      // Fuel History
      fuelHistory: [
        {
          date: '2024-01-14 16:45',
          station: 'Chevron Express',
          gallons: 22.8,
          pricePerGallon: 3.48,
          totalCost: 79.34,
          odometer: 28450,
          efficiency: 7.0,
          location: 'Industrial Blvd',
          paymentMethod: 'Fleet Card'
        }
      ],
      
      // Fuel Consumption Analysis
      consumption: {
        dailyAverage: 18.3,
        weeklyTotal: 128.1,
        monthlyTotal: 510.4,
        milesPerGallon: 7.1,
        milesPerDollar: 2.04,
        fuelEfficiencyRank: 8,
        comparedToFleetAvg: '-15%',
        optimalFuelLevel: 90
      },
      
      currentRoute: 'Express Delivery Run',
      nearestStations: [
        { name: 'QuickStop Fuel', distance: 0.3, price: 3.43, rating: 4.1 },
        { name: 'City Gas Plus', distance: 0.7, price: 3.39, rating: 4.3 },
        { name: 'Metro Fuel', distance: 1.1, price: 3.46, rating: 4.0 }
      ],
      
      fuelSystemHealth: 'Fair',
      nextFuelFilterChange: '1,200 miles',
      fuelPumpHealth: 89,
      alerts: [
        'Low fuel level - refuel required',
        'Fuel efficiency declining',
        'High idle fuel consumption detected'
      ],
      recommendations: [
        'Refuel immediately - nearest station 0.3 miles',
        'Schedule fuel system inspection',
        'Reduce idle time to improve efficiency'
      ]
    },
    {
      id: 'VH-003',
      vehicleName: 'Service Truck 003',
      driverId: 'DR-003',
      driverName: 'Mike Wilson',
      
      // Real-time Fuel Status
      currentFuelLevel: 89, // % - GOOD
      fuelCapacity: 35, // gallons
      currentFuelAmount: 31.15, // gallons
      rangeRemaining: 340, // miles
      lowFuelThreshold: 20, // %
      criticalFuelThreshold: 8, // %
      
      // OBD Telematic Data
      telematicData: {
        instantMPG: 9.8,
        averageMPG: 9.5,
        tripMPG: 9.7,
        fuelFlowRate: 1.8,
        engineLoad: 38,
        throttlePosition: 18,
        fuelPressure: 62,
        fuelTemp: 82,
        injectorPulseWidth: 2.8,
        fuelTrimBank1: 1.2,
        fuelTrimBank2: 0.9,
        airFuelRatio: 14.9,
        oxygenSensorVoltage: 0.42
      },
      
      // Fuel Performance Metrics
      performance: {
        efficiencyScore: 94,
        efficiencyTrend: 'improving',
        costPerMile: 0.38,
        monthlyFuelCost: 675.20,
        yearlyFuelCost: 8102.40,
        fuelSavings: 234.80,
        co2Emissions: 1.8,
        idleFuelWaste: 3.2
      },
      
      // Fuel History
      fuelHistory: [
        {
          date: '2024-01-13 11:20',
          station: 'Total Energy Plus',
          gallons: 32.5,
          pricePerGallon: 3.41,
          totalCost: 110.83,
          odometer: 67890,
          efficiency: 9.6,
          location: 'Service District',
          paymentMethod: 'Fleet Card'
        }
      ],
      
      // Fuel Consumption Analysis
      consumption: {
        dailyAverage: 10.2,
        weeklyTotal: 71.4,
        monthlyTotal: 285.6,
        milesPerGallon: 9.5,
        milesPerDollar: 2.78,
        fuelEfficiencyRank: 1,
        comparedToFleetAvg: '+28%',
        optimalFuelLevel: 75
      },
      
      currentRoute: 'Suburban Service Route',
      nearestStations: [
        { name: 'Premium Fuel Co', distance: 2.1, price: 3.38, rating: 4.7 },
        { name: 'Express Energy', distance: 2.8, price: 3.44, rating: 4.2 }
      ],
      
      fuelSystemHealth: 'Excellent',
      nextFuelFilterChange: '8,500 miles',
      fuelPumpHealth: 97,
      alerts: [],
      recommendations: [
        'Excellent fuel efficiency maintained',
        'Continue current driving patterns',
        'Optimal fuel level for route efficiency'
      ]
    }
  ]);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate real-time fuel level changes
        setFuelData(prev => prev.map(vehicle => ({
          ...vehicle,
          currentFuelLevel: Math.max(0, vehicle.currentFuelLevel - (Math.random() * 0.1)),
          telematicData: {
            ...vehicle.telematicData,
            instantMPG: vehicle.telematicData.instantMPG + (Math.random() - 0.5) * 0.2
          }
        })));
      }, 30000); // Update every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getFuelLevelColor = (level, lowThreshold, criticalThreshold) => {
    if (level <= criticalThreshold) return 'red.500';
    if (level <= lowThreshold) return 'orange.500';
    return 'green.500';
  };

  const getEfficiencyColor = (score) => {
    if (score >= 85) return 'green.500';
    if (score >= 70) return 'orange.500';
    return 'red.500';
  };

  const getTrendIcon = (trend) => ({
    improving: 'trending-up',
    stable: 'remove',
    declining: 'trending-down'
  }[trend]);

  const getTrendColor = (trend) => ({
    improving: 'green.500',
    stable: 'blue.500',
    declining: 'red.500'
  }[trend]);

  const filteredVehicles = fuelData.filter(vehicle => {
    if (fuelFilter === 'all') return true;
    if (fuelFilter === 'low') return vehicle.currentFuelLevel <= vehicle.lowFuelThreshold;
    if (fuelFilter === 'normal') return vehicle.performance.efficiencyScore >= 70 && vehicle.performance.efficiencyScore < 85;
    if (fuelFilter === 'excellent') return vehicle.performance.efficiencyScore >= 85;
    return true;
  });

  const handleVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    onOpen();
  };

  const handleFuelStations = (vehicle) => {
    setSelectedVehicle(vehicle);
    onStationOpen();
  };

  // Calculate fleet fuel statistics
  const totalVehicles = fuelData.length;
  const lowFuelVehicles = fuelData.filter(v => v.currentFuelLevel <= v.lowFuelThreshold).length;
  const avgEfficiency = Math.round(fuelData.reduce((sum, v) => sum + v.performance.efficiencyScore, 0) / fuelData.length);
  const totalMonthlyCost = fuelData.reduce((sum, v) => sum + v.performance.monthlyFuelCost, 0);

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
                  Fuel Management
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
                onPress={onAnalyticsOpen}
                leftIcon={<Icon as={Ionicons} name="analytics" size="sm" color={COLORS.primary} />}
              >
                Analytics
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

          {/* Fuel Analytics Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="car" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Vehicles</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={lowFuelVehicles > 0 ? "red.500" : "green.500"} shadow={1}>
              <VStack space={2}>
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="water" size="lg" color={lowFuelVehicles > 0 ? "red.500" : "green.500"} />
                  {lowFuelVehicles > 0 && <Circle size="6px" bg="red.500" />}
                </HStack>
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{lowFuelVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Low Fuel</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getEfficiencyColor(avgEfficiency)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="leaf" size="lg" color={getEfficiencyColor(avgEfficiency)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgEfficiency}%</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Efficiency</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="card" size="lg" color="purple.500" />
                <Text fontSize="xl" fontWeight="700" color={COLORS.text}>${Math.round(totalMonthlyCost).toLocaleString()}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Monthly Cost</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Fuel Filters and Controls */}
          <Box bg="white" p={4} borderRadius="xl" shadow={1}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                  Fuel Controls
                </Text>
                <Switch 
                  isChecked={autoRefresh} 
                  onToggle={setAutoRefresh}
                  colorScheme="green"
                />
              </HStack>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={3}>
                  {['all', 'low', 'normal', 'excellent'].map((filter) => (
                    <Pressable
                      key={filter}
                      px={4}
                      py={2}
                      borderRadius="full"
                      bg={fuelFilter === filter ? COLORS.primary : 'gray.100'}
                      onPress={() => setFuelFilter(filter)}
                      _pressed={{ opacity: 0.8 }}
                    >
                      <Text
                        color={fuelFilter === filter ? 'white' : COLORS.text}
                        fontSize="sm"
                        fontWeight="500"
                        textTransform="capitalize"
                      >
                        {filter === 'all' ? 'All Vehicles' : filter}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>

              <HStack space={3} alignItems="center">
                <Text fontSize="sm" color={COLORS.subtext}>Time Period:</Text>
                <Select 
                  selectedValue={timeFilter} 
                  onValueChange={setTimeFilter}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  flex={1}
                >
                  <Select.Item label="Today" value="today" />
                  <Select.Item label="This Week" value="week" />
                  <Select.Item label="This Month" value="month" />
                  <Select.Item label="This Year" value="year" />
                </Select>
              </HStack>
            </VStack>
          </Box>

          {/* Vehicle Fuel Status List */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Vehicle Fuel Status ({filteredVehicles.length})
            </Text>
            
            {filteredVehicles.map((vehicle) => (
              <Pressable
                key={vehicle.id}
                onPress={() => handleVehicleDetails(vehicle)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box 
                  bg="white" 
                  borderRadius="xl" 
                  p={4} 
                  shadow={2}
                  borderLeftWidth={6}
                  borderLeftColor={getFuelLevelColor(vehicle.currentFuelLevel, vehicle.lowFuelThreshold, vehicle.criticalFuelThreshold)}
                >
                  <VStack space={4}>
                    {/* Vehicle Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box 
                          w="50px" 
                          h="50px" 
                          bg={`${getFuelLevelColor(vehicle.currentFuelLevel, vehicle.lowFuelThreshold, vehicle.criticalFuelThreshold)}.100`}
                          borderRadius="xl" 
                          alignItems="center" 
                          justifyContent="center"
                          position="relative"
                        >
                          <Icon 
                            as={Ionicons} 
                            name="water" 
                            color={getFuelLevelColor(vehicle.currentFuelLevel, vehicle.lowFuelThreshold, vehicle.criticalFuelThreshold)} 
                            size="lg" 
                          />
                          {vehicle.currentFuelLevel <= vehicle.criticalFuelThreshold && (
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
                            {vehicle.vehicleName}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            Driver: {vehicle.driverName}
                          </Text>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                              {vehicle.id}
                            </Text>
                            <Badge bg={getEfficiencyColor(vehicle.performance.efficiencyScore)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {vehicle.performance.efficiencyScore}% EFFICIENCY
                              </Text>
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={2}>
                        <Text fontSize="2xl" fontWeight="700" color={getFuelLevelColor(vehicle.currentFuelLevel, vehicle.lowFuelThreshold, vehicle.criticalFuelThreshold)}>
                          {Math.round(vehicle.currentFuelLevel)}%
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {vehicle.rangeRemaining} miles
                        </Text>
                        {vehicle.alerts.length > 0 && (
                          <Badge bg="red.500" borderRadius="full">
                            <Text color="white" fontSize="xs">{vehicle.alerts.length}</Text>
                          </Badge>
                        )}
                      </VStack>
                    </HStack>

                    {/* Fuel Level Progress */}
                    <VStack space={3}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Fuel Level
                        </Text>
                        <Text fontSize="sm" color={COLORS.text}>
                          {vehicle.currentFuelAmount.toFixed(1)} / {vehicle.fuelCapacity} gal
                        </Text>
                      </HStack>
                      
                      <Progress 
                        value={vehicle.currentFuelLevel} 
                        bg="gray.200" 
                        _filledTrack={{ 
                          bg: getFuelLevelColor(vehicle.currentFuelLevel, vehicle.lowFuelThreshold, vehicle.criticalFuelThreshold) 
                        }}
                        h="4"
                        borderRadius="full"
                      />

                      <HStack justifyContent="space-between">
                        <Text fontSize="xs" color={COLORS.subtext}>
                          Critical: {vehicle.criticalFuelThreshold}%
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          Low: {vehicle.lowFuelThreshold}%
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          Full: 100%
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Real-time OBD Metrics */}
                    <VStack space={3}>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        Live OBD Telematic Data
                      </Text>
                      
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="speedometer" size="sm" color="blue.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>Current MPG</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.telematicData.instantMPG.toFixed(1)}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="analytics" size="sm" color="green.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>Average MPG</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.telematicData.averageMPG.toFixed(1)}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="water" size="sm" color="purple.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>Flow Rate</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.telematicData.fuelFlowRate.toFixed(1)} gph
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="leaf" size="sm" color={getEfficiencyColor(vehicle.performance.efficiencyScore)} />
                          <Text fontSize="xs" color={COLORS.subtext}>Efficiency</Text>
                          <HStack alignItems="center" space={1}>
                            <Text fontSize="sm" fontWeight="600" color={getEfficiencyColor(vehicle.performance.efficiencyScore)}>
                              {vehicle.performance.efficiencyScore}%
                            </Text>
                            <Icon 
                              as={Ionicons} 
                              name={getTrendIcon(vehicle.performance.efficiencyTrend)} 
                              size="xs" 
                              color={getTrendColor(vehicle.performance.efficiencyTrend)} 
                            />
                          </HStack>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Cost Analysis */}
                    <VStack space={3}>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        Cost Analysis
                      </Text>
                      
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Cost/Mile</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            ${vehicle.performance.costPerMile}
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Monthly</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            ${vehicle.performance.monthlyFuelCost.toFixed(0)}
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>Savings</Text>
                          <Text fontSize="sm" fontWeight="600" color={vehicle.performance.fuelSavings >= 0 ? 'green.500' : 'red.500'}>
                            {vehicle.performance.fuelSavings >= 0 ? '+' : ''}${vehicle.performance.fuelSavings.toFixed(0)}
                          </Text>
                        </VStack>
                        <VStack alignItems="center" space={1}>
                          <Text fontSize="xs" color={COLORS.subtext}>CO₂ (tons)</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.performance.co2Emissions}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Current Route Status */}
                    {vehicle.currentRoute && (
                      <Box bg="blue.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="blue.500">
                        <HStack justifyContent="space-between" alignItems="center">
                          <VStack space={1} flex={1}>
                            <Text fontSize="sm" fontWeight="600" color="blue.700">
                              Current Route: {vehicle.currentRoute}
                            </Text>
                            <Text fontSize="xs" color="blue.600">
                              Range remaining: {vehicle.rangeRemaining} miles
                            </Text>
                          </VStack>
                          <Icon as={Ionicons} name="navigate" color="blue.500" size="md" />
                        </HStack>
                      </Box>
                    )}

                    {/* Alerts */}
                    {vehicle.alerts.length > 0 && (
                      <Box bg="red.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="red.500">
                        <VStack space={2}>
                          <Text fontSize="sm" fontWeight="600" color="red.700">
                            Fuel Alerts ({vehicle.alerts.length})
                          </Text>
                          {vehicle.alerts.slice(0, 2).map((alert, index) => (
                            <HStack key={index} space={2} alignItems="center">
                              <Icon as={Ionicons} name="warning" size="xs" color="red.500" />
                              <Text fontSize="xs" color="red.600">{alert}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Recommendations */}
                    {vehicle.recommendations.length > 0 && vehicle.alerts.length === 0 && (
                      <Box bg="green.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor="green.500">
                        <VStack space={2}>
                          <Text fontSize="sm" fontWeight="600" color="green.700">
                            Recommendations
                          </Text>
                          {vehicle.recommendations.slice(0, 2).map((rec, index) => (
                            <HStack key={index} space={2} alignItems="center">
                              <Icon as={Ionicons} name="checkmark" size="xs" color="green.500" />
                              <Text fontSize="xs" color="green.600">{rec}</Text>
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
                        onPress={() => handleFuelStations(vehicle)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="location" size="xs" color="blue.600" />
                          <Text fontSize="xs" color="blue.600" fontWeight="600">Stations</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="green.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'green.200' }}
                        flex={1}
                        onPress={onAnalyticsOpen}
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
                          <Icon as={Ionicons} name="document-text" size="xs" color="purple.600" />
                          <Text fontSize="xs" color="purple.600" fontWeight="600">History</Text>
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

      {/* Vehicle Fuel Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedVehicle ? `${selectedVehicle.vehicleName} - Fuel Details` : 'Fuel Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedVehicle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Detailed OBD Data */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Detailed OBD Telematic Data
                    </Text>
                    {Object.entries(selectedVehicle.telematicData).map(([key, value]) => (
                      <HStack key={key} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text fontSize="sm" color={COLORS.text}>
                          {typeof value === 'number' ? 
                            (key.includes('MPG') ? `${value.toFixed(1)} mpg` :
                             key.includes('Temp') ? `${value}°F` :
                             key.includes('Pressure') ? `${value} PSI` :
                             key.includes('Load') || key.includes('Position') || key.includes('Trim') ? `${value}%` :
                             key.includes('FlowRate') ? `${value} gph` :
                             key.includes('PulseWidth') ? `${value} ms` :
                             key.includes('Ratio') ? `${value}:1` :
                             key.includes('Voltage') ? `${value}V` :
                             value
                            ) : value
                          }
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Fuel History */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Recent Fuel History
                    </Text>
                    {selectedVehicle.fuelHistory.map((transaction, index) => (
                      <Box key={index} bg="gray.50" p={3} borderRadius="lg">
                        <VStack space={2}>
                          <HStack justifyContent="space-between">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {transaction.station}
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="green.500">
                              ${transaction.totalCost}
                            </Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {transaction.gallons} gal @ ${transaction.pricePerGallon}/gal
                            </Text>
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {transaction.efficiency} mpg
                            </Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {transaction.location}
                            </Text>
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {transaction.date}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Consumption Analytics */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Consumption Analytics
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Daily Average</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.consumption.dailyAverage} gal</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Weekly Total</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.consumption.weeklyTotal} gal</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Monthly Total</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.consumption.monthlyTotal} gal</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Fleet Rank</Text>
                      <Text fontSize="sm" color={COLORS.text}>#{selectedVehicle.consumption.fuelEfficiencyRank}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>vs Fleet Average</Text>
                      <Text fontSize="sm" color={selectedVehicle.consumption.comparedToFleetAvg.includes('+') ? 'green.500' : 'red.500'}>
                        {selectedVehicle.consumption.comparedToFleetAvg}
                      </Text>
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
                onStationOpen();
              }}>
                Find Fuel Stations
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Fuel Stations Modal */}
      <Modal isOpen={isStationOpen} onClose={onStationClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Nearby Fuel Stations</Modal.Header>
          <Modal.Body>
            {selectedVehicle && (
              <VStack space={4}>
                <Text fontSize="sm" color={COLORS.subtext}>
                  Fuel stations near {selectedVehicle.vehicleName}
                </Text>
                
                {selectedVehicle.nearestStations.map((station, index) => (
                  <Box key={index} bg="gray.50" p={3} borderRadius="lg">
                    <VStack space={2}>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                          {station.name}
                        </Text>
                        <HStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="star" size="xs" color="orange.400" />
                          <Text fontSize="sm" color={COLORS.text}>{station.rating}</Text>
                        </HStack>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext}>
                          {station.distance} miles away
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="green.500">
                          ${station.price}/gal
                        </Text>
                      </HStack>
                      <Button size="sm" bg={COLORS.primary} borderRadius="md">
                        Navigate to Station
                      </Button>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onStationClose}>
                Close
              </Button>
              <Button bg={COLORS.primary} onPress={onStationClose}>
                View All Stations
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Fuel Analytics Modal */}
      <Modal isOpen={isAnalyticsOpen} onClose={onAnalyticsClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Fuel Analytics & Insights</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Fleet-wide fuel performance analysis and trends
              </Text>
              
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Fleet Performance Summary
                </Text>
                <Box bg="gray.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Total Monthly Cost</Text>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        ${totalMonthlyCost.toFixed(0)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Average Efficiency</Text>
                      <Text fontSize="sm" fontWeight="600" color={getEfficiencyColor(avgEfficiency)}>
                        {avgEfficiency}%
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Vehicles Needing Fuel</Text>
                      <Text fontSize="sm" fontWeight="600" color={lowFuelVehicles > 0 ? 'red.500' : 'green.500'}>
                        {lowFuelVehicles}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Best Performing Vehicle</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">
                        Service Truck 003
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
    </Box>
  );
}