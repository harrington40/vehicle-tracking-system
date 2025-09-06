import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Skeleton, Image,
  Calendar, AlertDialog
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function MaintenancePage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [maintenanceFilter, setMaintenanceFilter] = useState('all'); // all, overdue, upcoming, completed, critical
  const [timeFilter, setTimeFilter] = useState('month'); // week, month, quarter, year
  const [typeFilter, setTypeFilter] = useState('all'); // all, preventive, corrective, inspection, emergency
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, critical, high, medium, low
  const [predictiveMode, setPredictiveMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclose();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclose();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclose();

  // Comprehensive maintenance data with OBD telematic integration
  const [maintenanceData, setMaintenanceData] = useState([
    {
      id: 'VH-001',
      vehicleName: 'Fleet Truck 001',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2022,
      vin: '1FUJGLDR5NLBC1234',
      mileage: 45680,
      engineHours: 2840,
      
      // Maintenance Status Overview
      maintenanceStatus: {
        overallHealth: 87, // out of 100
        riskLevel: 'medium', // low, medium, high, critical
        nextServiceDue: 1320, // miles
        daysUntilService: 12,
        activeAlerts: 2,
        criticalIssues: 0,
        openWorkOrders: 1,
        upcomingInspections: 2
      },
      
      // Real-time OBD Health Monitoring
      obdHealthData: {
        engineHealth: {
          score: 92,
          status: 'good', // excellent, good, fair, poor, critical
          temperature: 89, // °C
          oilPressure: 45, // PSI
          coolantLevel: 85, // %
          airFilterRestriction: 15, // %
          fuelFilterPressure: 58, // PSI
          nextOilChange: 1500, // miles
          nextFilterChange: 2200, // miles
          diagnosticCodes: []
        },
        transmissionHealth: {
          score: 89,
          status: 'good',
          fluidTemp: 76, // °C
          fluidLevel: 92, // %
          clutchWear: 23, // %
          nextFluidChange: 8500, // miles
          nextInspection: 5000, // miles
          diagnosticCodes: []
        },
        brakeHealth: {
          score: 78,
          status: 'fair',
          frontPadThickness: 6.2, // mm
          rearPadThickness: 7.8, // mm
          fluidLevel: 88, // %
          systemPressure: 142, // PSI
          nextInspection: 2500, // miles
          replacementNeeded: 3500, // miles
          diagnosticCodes: ['B1342'] // Brake pad wear sensor
        },
        suspensionHealth: {
          score: 85,
          status: 'good',
          shockCondition: 'good',
          springCondition: 'excellent',
          alignmentStatus: 'good',
          nextInspection: 4000, // miles
          diagnosticCodes: []
        },
        tiresHealth: {
          score: 91,
          status: 'good',
          frontLeftTread: 8.2, // mm
          frontRightTread: 8.0, // mm
          rearLeftTread: 9.1, // mm
          rearRightTread: 9.3, // mm
          pressure: [110, 108, 112, 111], // PSI per tire
          nextRotation: 1800, // miles
          replacementPredicted: 15000, // miles
          diagnosticCodes: []
        },
        batteryHealth: {
          score: 94,
          status: 'excellent',
          voltage: 12.6, // V
          capacity: 87, // %
          temperature: 23, // °C
          chargingSystemHealth: 96, // %
          nextInspection: 6000, // miles
          replacementPredicted: 24000, // miles
          diagnosticCodes: []
        },
        emissionsHealth: {
          score: 88,
          status: 'good',
          dpfRegenStatus: 'normal',
          noxSensorStatus: 'good',
          egrlValveStatus: 'good',
          nextInspection: 3000, // miles
          diagnosticCodes: []
        }
      },
      
      // Maintenance Schedule & History
      maintenanceSchedule: [
        {
          id: 'MAINT-001',
          type: 'preventive',
          category: 'Engine Service',
          description: 'Oil Change & Filter Replacement',
          priority: 'high',
          status: 'overdue',
          scheduledDate: new Date('2024-01-10'),
          dueMileage: 44500,
          currentMileage: 45680,
          estimatedCost: 185.50,
          estimatedDuration: 2, // hours
          assignedTechnician: 'Mike Rodriguez',
          location: 'Main Service Bay',
          parts: [
            { name: 'Engine Oil (15W-40)', quantity: 12, cost: 89.50 },
            { name: 'Oil Filter', quantity: 1, cost: 24.99 },
            { name: 'Labor', quantity: 2, cost: 71.01 }
          ],
          predictiveNotes: 'OBD indicates oil life at 5%. Immediate service required.',
          workOrderNumber: 'WO-2024-001'
        },
        {
          id: 'MAINT-002',
          type: 'inspection',
          category: 'Brake System',
          description: 'Brake Pad Inspection & Measurement',
          priority: 'medium',
          status: 'upcoming',
          scheduledDate: new Date('2024-01-25'),
          dueMileage: 47000,
          currentMileage: 45680,
          estimatedCost: 125.00,
          estimatedDuration: 1.5,
          assignedTechnician: 'Sarah Chen',
          location: 'Inspection Bay 2',
          predictiveNotes: 'Front brake pads at 62% thickness. Monitor closely.',
          workOrderNumber: 'WO-2024-002'
        },
        {
          id: 'MAINT-003',
          type: 'preventive',
          category: 'Transmission',
          description: 'Transmission Fluid & Filter Service',
          priority: 'medium',
          status: 'scheduled',
          scheduledDate: new Date('2024-02-15'),
          dueMileage: 50000,
          currentMileage: 45680,
          estimatedCost: 385.75,
          estimatedDuration: 3,
          assignedTechnician: 'John Martinez',
          location: 'Service Bay 1',
          parts: [
            { name: 'Transmission Fluid', quantity: 8, cost: 156.00 },
            { name: 'Transmission Filter', quantity: 1, cost: 89.50 },
            { name: 'Gasket Kit', quantity: 1, cost: 45.25 },
            { name: 'Labor', quantity: 3, cost: 95.00 }
          ],
          predictiveNotes: 'Fluid temperature slightly elevated. Service recommended.',
          workOrderNumber: 'WO-2024-003'
        }
      ],
      
      // Maintenance History
      maintenanceHistory: [
        {
          id: 'HIST-001',
          date: new Date('2023-12-15'),
          type: 'preventive',
          category: 'General Service',
          description: 'DOT Annual Inspection',
          cost: 275.00,
          mileage: 42180,
          technician: 'Mike Rodriguez',
          location: 'Inspection Bay 1',
          duration: 4, // hours
          status: 'completed',
          findings: 'All systems within specifications',
          nextDue: 365, // days
          workOrderNumber: 'WO-2023-156'
        },
        {
          id: 'HIST-002',
          date: new Date('2023-11-28'),
          type: 'corrective',
          category: 'Electrical',
          description: 'Alternator Replacement',
          cost: 485.50,
          mileage: 41250,
          technician: 'Sarah Chen',
          location: 'Service Bay 2',
          duration: 3.5,
          status: 'completed',
          findings: 'Alternator failed - charging system restored',
          parts: [
            { name: 'Alternator Assembly', quantity: 1, cost: 325.00 },
            { name: 'Drive Belt', quantity: 1, cost: 45.50 },
            { name: 'Labor', quantity: 3.5, cost: 115.00 }
          ],
          workOrderNumber: 'WO-2023-134'
        }
      ],
      
      // Predictive Maintenance AI Analysis
      predictiveAnalysis: {
        riskAssessment: {
          engineRisk: 'low',
          transmissionRisk: 'medium',
          brakeRisk: 'medium',
          tiresRisk: 'low',
          overallRisk: 'medium'
        },
        predictions: [
          {
            component: 'Brake Pads (Front)',
            predictedFailure: 3500, // miles
            confidence: 87, // %
            recommendation: 'Schedule replacement within 30 days',
            costImpact: 'medium',
            safetyImpact: 'high'
          },
          {
            component: 'Air Filter',
            predictedFailure: 2200, // miles
            confidence: 92,
            recommendation: 'Replace during next service',
            costImpact: 'low',
            safetyImpact: 'low'
          },
          {
            component: 'Battery',
            predictedFailure: 24000, // miles
            confidence: 78,
            recommendation: 'Monitor performance closely',
            costImpact: 'medium',
            safetyImpact: 'medium'
          }
        ],
        costOptimization: {
          bundledServices: [
            'Combine brake inspection with tire rotation',
            'Schedule transmission service with engine service'
          ],
          preventiveSavings: 1250.00, // $ saved vs reactive maintenance
          downtimeReduction: 15, // % reduction in downtime
          efficiencyImprovement: 8 // % improvement in efficiency
        }
      },
      
      // Compliance & Certifications
      compliance: {
        dotInspection: {
          status: 'current',
          lastInspection: new Date('2023-12-15'),
          nextDue: new Date('2024-12-15'),
          inspector: 'Mike Rodriguez',
          result: 'passed'
        },
        emissionsTest: {
          status: 'current',
          lastTest: new Date('2023-10-20'),
          nextDue: new Date('2024-10-20'),
          result: 'passed',
          certificationNumber: 'EMI-2023-4521'
        },
        safetyInspection: {
          status: 'current',
          lastInspection: new Date('2023-11-10'),
          nextDue: new Date('2024-11-10'),
          result: 'passed'
        }
      },
      
      // Cost Analysis
      costAnalysis: {
        ytdMaintenanceCost: 2485.75,
        budgetedCost: 3200.00,
        varianceFromBudget: -714.25, // under budget
        costPerMile: 0.054,
        preventiveCost: 1890.50,
        correctiveCost: 595.25,
        emergencyCost: 0.00,
        projectedAnnualCost: 3100.00,
        costTrend: 'decreasing' // increasing, stable, decreasing
      },
      
      // Vehicle Downtime
      downtimeAnalysis: {
        ytdDowntimeHours: 18.5,
        plannedDowntime: 16.0,
        unplannedDowntime: 2.5,
        targetDowntime: 24.0,
        downtimeVariance: -5.5, // better than target
        revenueImpact: -425.00, // $ lost revenue
        availabilityPercentage: 97.8
      }
    },
    {
      id: 'VH-002',
      vehicleName: 'Delivery Van 002',
      make: 'Ford',
      model: 'Transit 350',
      year: 2021,
      vin: '1FTBW2CM5MKA1234',
      mileage: 28450,
      engineHours: 1890,
      
      maintenanceStatus: {
        overallHealth: 72,
        riskLevel: 'high',
        nextServiceDue: 550,
        daysUntilService: 5,
        activeAlerts: 4,
        criticalIssues: 1,
        openWorkOrders: 2,
        upcomingInspections: 1
      },
      
      obdHealthData: {
        engineHealth: {
          score: 68,
          status: 'fair',
          temperature: 95,
          oilPressure: 38,
          coolantLevel: 78,
          airFilterRestriction: 35,
          fuelFilterPressure: 52,
          nextOilChange: 500,
          nextFilterChange: 800,
          diagnosticCodes: ['P0171', 'P0128'] // Lean condition, thermostat
        },
        transmissionHealth: {
          score: 75,
          status: 'fair',
          fluidTemp: 89,
          fluidLevel: 82,
          clutchWear: 45,
          nextFluidChange: 5500,
          nextInspection: 2000,
          diagnosticCodes: ['P0740'] // Torque converter clutch
        },
        brakeHealth: {
          score: 58,
          status: 'poor',
          frontPadThickness: 3.1,
          rearPadThickness: 4.2,
          fluidLevel: 76,
          systemPressure: 118,
          nextInspection: 0, // immediate
          replacementNeeded: 0, // immediate
          diagnosticCodes: ['B1342', 'B1354'] // Multiple brake warnings
        },
        suspensionHealth: {
          score: 79,
          status: 'fair',
          shockCondition: 'fair',
          springCondition: 'good',
          alignmentStatus: 'poor',
          nextInspection: 1500,
          diagnosticCodes: ['C1234'] // Alignment out of spec
        },
        tiresHealth: {
          score: 82,
          status: 'fair',
          frontLeftTread: 5.8,
          frontRightTread: 6.2,
          rearLeftTread: 7.1,
          rearRightTread: 6.9,
          pressure: [85, 87, 89, 88],
          nextRotation: 500,
          replacementPredicted: 8000,
          diagnosticCodes: []
        },
        batteryHealth: {
          score: 78,
          status: 'fair',
          voltage: 12.2,
          capacity: 72,
          temperature: 28,
          chargingSystemHealth: 82,
          nextInspection: 2000,
          replacementPredicted: 8000,
          diagnosticCodes: []
        },
        emissionsHealth: {
          score: 71,
          status: 'fair',
          dpfRegenStatus: 'needs_regen',
          noxSensorStatus: 'fair',
          egrlValveStatus: 'poor',
          nextInspection: 1000,
          diagnosticCodes: ['P2002', 'P0401'] // DPF efficiency, EGR flow
        }
      },
      
      maintenanceSchedule: [
        {
          id: 'MAINT-004',
          type: 'emergency',
          category: 'Brake System',
          description: 'CRITICAL: Brake Pad Replacement',
          priority: 'critical',
          status: 'critical',
          scheduledDate: new Date('2024-01-16'), // tomorrow
          dueMileage: 28000,
          currentMileage: 28450,
          estimatedCost: 485.00,
          estimatedDuration: 3,
          assignedTechnician: 'Emergency Team',
          location: 'Emergency Bay',
          predictiveNotes: 'CRITICAL: Brake pads below minimum thickness. Vehicle unsafe to operate.',
          workOrderNumber: 'WO-2024-004-CRITICAL'
        },
        {
          id: 'MAINT-005',
          type: 'corrective',
          category: 'Engine',
          description: 'Engine Diagnostic & Repair',
          priority: 'high',
          status: 'scheduled',
          scheduledDate: new Date('2024-01-18'),
          dueMileage: 28500,
          currentMileage: 28450,
          estimatedCost: 675.00,
          estimatedDuration: 4,
          assignedTechnician: 'John Martinez',
          location: 'Diagnostic Bay',
          predictiveNotes: 'Multiple engine codes detected. Comprehensive diagnosis required.',
          workOrderNumber: 'WO-2024-005'
        }
      ],
      
      predictiveAnalysis: {
        riskAssessment: {
          engineRisk: 'high',
          transmissionRisk: 'medium',
          brakeRisk: 'critical',
          tiresRisk: 'medium',
          overallRisk: 'critical'
        },
        predictions: [
          {
            component: 'Brake System',
            predictedFailure: 0, // immediate
            confidence: 98,
            recommendation: 'IMMEDIATE SERVICE REQUIRED - SAFETY CRITICAL',
            costImpact: 'high',
            safetyImpact: 'critical'
          },
          {
            component: 'Thermostat',
            predictedFailure: 1200,
            confidence: 89,
            recommendation: 'Replace within 2 weeks',
            costImpact: 'medium',
            safetyImpact: 'medium'
          },
          {
            component: 'EGR Valve',
            predictedFailure: 2500,
            confidence: 82,
            recommendation: 'Schedule during next major service',
            costImpact: 'high',
            safetyImpact: 'low'
          }
        ]
      },
      
      costAnalysis: {
        ytdMaintenanceCost: 3240.85,
        budgetedCost: 2800.00,
        varianceFromBudget: 440.85, // over budget
        costPerMile: 0.114,
        preventiveCost: 1820.50,
        correctiveCost: 1420.35,
        emergencyCost: 0.00,
        projectedAnnualCost: 4200.00,
        costTrend: 'increasing'
      },
      
      downtimeAnalysis: {
        ytdDowntimeHours: 32.5,
        plannedDowntime: 18.0,
        unplannedDowntime: 14.5,
        targetDowntime: 20.0,
        downtimeVariance: 12.5, // worse than target
        revenueImpact: -1580.00,
        availabilityPercentage: 94.2
      }
    },
    {
      id: 'VH-003',
      vehicleName: 'Service Truck 003',
      make: 'Chevrolet',
      model: 'Silverado 3500HD',
      year: 2023,
      vin: '1GC4K0CY8PF1234',
      mileage: 12890,
      engineHours: 890,
      
      maintenanceStatus: {
        overallHealth: 96,
        riskLevel: 'low',
        nextServiceDue: 2110,
        daysUntilService: 28,
        activeAlerts: 0,
        criticalIssues: 0,
        openWorkOrders: 0,
        upcomingInspections: 1
      },
      
      obdHealthData: {
        engineHealth: {
          score: 98,
          status: 'excellent',
          temperature: 84,
          oilPressure: 52,
          coolantLevel: 95,
          airFilterRestriction: 8,
          fuelFilterPressure: 65,
          nextOilChange: 2100,
          nextFilterChange: 4200,
          diagnosticCodes: []
        },
        transmissionHealth: {
          score: 97,
          status: 'excellent',
          fluidTemp: 71,
          fluidLevel: 98,
          clutchWear: 5,
          nextFluidChange: 12000,
          nextInspection: 8000,
          diagnosticCodes: []
        },
        brakeHealth: {
          score: 95,
          status: 'excellent',
          frontPadThickness: 11.2,
          rearPadThickness: 12.1,
          fluidLevel: 96,
          systemPressure: 155,
          nextInspection: 8000,
          replacementNeeded: 25000,
          diagnosticCodes: []
        },
        suspensionHealth: {
          score: 98,
          status: 'excellent',
          shockCondition: 'excellent',
          springCondition: 'excellent',
          alignmentStatus: 'excellent',
          nextInspection: 10000,
          diagnosticCodes: []
        },
        tiresHealth: {
          score: 94,
          status: 'excellent',
          frontLeftTread: 12.8,
          frontRightTread: 12.9,
          rearLeftTread: 13.1,
          rearRightTread: 13.0,
          pressure: [125, 124, 127, 126],
          nextRotation: 2500,
          replacementPredicted: 35000,
          diagnosticCodes: []
        },
        batteryHealth: {
          score: 97,
          status: 'excellent',
          voltage: 12.8,
          capacity: 94,
          temperature: 21,
          chargingSystemHealth: 98,
          nextInspection: 10000,
          replacementPredicted: 40000,
          diagnosticCodes: []
        },
        emissionsHealth: {
          score: 96,
          status: 'excellent',
          dpfRegenStatus: 'normal',
          noxSensorStatus: 'excellent',
          egrlValveStatus: 'excellent',
          nextInspection: 8000,
          diagnosticCodes: []
        }
      },
      
      maintenanceSchedule: [
        {
          id: 'MAINT-006',
          type: 'preventive',
          category: 'General Service',
          description: 'First Service - 15K Mile Service',
          priority: 'medium',
          status: 'scheduled',
          scheduledDate: new Date('2024-02-10'),
          dueMileage: 15000,
          currentMileage: 12890,
          estimatedCost: 285.00,
          estimatedDuration: 2.5,
          assignedTechnician: 'Mike Rodriguez',
          location: 'Service Bay 3',
          predictiveNotes: 'Vehicle performing excellently. Standard service schedule.',
          workOrderNumber: 'WO-2024-006'
        }
      ],
      
      predictiveAnalysis: {
        riskAssessment: {
          engineRisk: 'low',
          transmissionRisk: 'low',
          brakeRisk: 'low',
          tiresRisk: 'low',
          overallRisk: 'low'
        },
        predictions: [
          {
            component: 'All Systems',
            predictedFailure: 50000,
            confidence: 95,
            recommendation: 'Continue current maintenance schedule',
            costImpact: 'low',
            safetyImpact: 'low'
          }
        ]
      },
      
      costAnalysis: {
        ytdMaintenanceCost: 580.25,
        budgetedCost: 1200.00,
        varianceFromBudget: -619.75, // well under budget
        costPerMile: 0.045,
        preventiveCost: 580.25,
        correctiveCost: 0.00,
        emergencyCost: 0.00,
        projectedAnnualCost: 1800.00,
        costTrend: 'stable'
      },
      
      downtimeAnalysis: {
        ytdDowntimeHours: 4.5,
        plannedDowntime: 4.5,
        unplannedDowntime: 0.0,
        targetDowntime: 16.0,
        downtimeVariance: -11.5, // excellent performance
        revenueImpact: 0.00,
        availabilityPercentage: 99.7
      }
    }
  ]);

  // Auto-refresh effect for real-time data
  useEffect(() => {
    let interval;
    if (predictiveMode) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate real-time OBD data updates
        setMaintenanceData(prev => prev.map(vehicle => ({
          ...vehicle,
          obdHealthData: {
            ...vehicle.obdHealthData,
            engineHealth: {
              ...vehicle.obdHealthData.engineHealth,
              temperature: vehicle.obdHealthData.engineHealth.temperature + (Math.random() - 0.5) * 2,
              oilPressure: vehicle.obdHealthData.engineHealth.oilPressure + (Math.random() - 0.5) * 2
            }
          }
        })));
      }, 30000); // Update every 30 seconds
    }
    return () => clearInterval(interval);
  }, [predictiveMode]);

  const getHealthColor = (score) => {
    if (score >= 90) return 'green.500';
    if (score >= 75) return 'yellow.500';
    if (score >= 60) return 'orange.500';
    return 'red.500';
  };

  const getRiskColor = (risk) => ({
    low: 'green.500',
    medium: 'yellow.500',
    high: 'orange.500',
    critical: 'red.500'
  }[risk]);

  const getPriorityColor = (priority) => ({
    low: 'green.500',
    medium: 'yellow.500',
    high: 'orange.500',
    critical: 'red.500'
  }[priority]);

  const getStatusIcon = (status) => ({
    excellent: 'checkmark-circle',
    good: 'checkmark',
    fair: 'warning',
    poor: 'close-circle',
    critical: 'alert-circle'
  }[status]);

  const filteredVehicles = maintenanceData.filter(vehicle => {
    if (maintenanceFilter === 'all') return true;
    if (maintenanceFilter === 'overdue') return vehicle.maintenanceStatus.nextServiceDue <= 0;
    if (maintenanceFilter === 'upcoming') return vehicle.maintenanceStatus.daysUntilService <= 7;
    if (maintenanceFilter === 'critical') return vehicle.maintenanceStatus.criticalIssues > 0;
    return true;
  });

  const handleVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    onOpen();
  };

  const handleScheduleMaintenance = (vehicle) => {
    setSelectedVehicle(vehicle);
    onScheduleOpen();
  };

  // Calculate fleet maintenance statistics
  const totalVehicles = maintenanceData.length;
  const criticalVehicles = maintenanceData.filter(v => v.maintenanceStatus.riskLevel === 'critical').length;
  const overdueVehicles = maintenanceData.filter(v => v.maintenanceStatus.nextServiceDue <= 0).length;
  const avgHealth = Math.round(maintenanceData.reduce((sum, v) => sum + v.maintenanceStatus.overallHealth, 0) / maintenanceData.length);
  const totalYTDCost = maintenanceData.reduce((sum, v) => sum + v.costAnalysis.ytdMaintenanceCost, 0);

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={6} p={4}>
          {/* Header with Predictive Mode Indicator */}
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space={3}>
              <Pressable onPress={() => router.back()}>
                <Icon as={Ionicons} name="arrow-back" size="lg" color={COLORS.text} />
              </Pressable>
              <VStack space={1}>
                <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
                  Maintenance Management
                </Text>
                <HStack alignItems="center" space={2}>
                  <Circle size="8px" bg={predictiveMode ? "green.500" : "gray.400"} />
                  <Text fontSize="xs" color={COLORS.subtext}>
                    {predictiveMode ? 'AI Predictive Mode' : 'Standard Mode'} • Updated: {lastUpdated.toLocaleTimeString()}
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
                leftIcon={<Icon as={Ionicons} name="calendar" size="sm" color="white" />}
                onPress={onScheduleOpen}
              >
                Schedule
              </Button>
            </HStack>
          </HStack>

          {/* Maintenance Overview Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="construct" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Fleet</Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={criticalVehicles > 0 ? "red.500" : "green.500"} shadow={1}>
              <VStack space={2}>
                <HStack alignItems="center" space={1}>
                  <Icon as={Ionicons} name="alert-circle" size="lg" color={criticalVehicles > 0 ? "red.500" : "green.500"} />
                  {criticalVehicles > 0 && <Circle size="6px" bg="red.500" />}
                </HStack>
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{criticalVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Critical Issues</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={overdueVehicles > 0 ? "orange.500" : "green.500"} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="time" size="lg" color={overdueVehicles > 0 ? "orange.500" : "green.500"} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{overdueVehicles}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Overdue</Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor={getHealthColor(avgHealth)} shadow={1}>
              <VStack space={2}>
                <Icon as={Ionicons} name="fitness" size="lg" color={getHealthColor(avgHealth)} />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{avgHealth}%</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Avg Health</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Maintenance Controls */}
          <Box bg="white" p={4} borderRadius="xl" shadow={1}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                  Maintenance Controls
                </Text>
                <Switch 
                  isChecked={predictiveMode} 
                  onToggle={setPredictiveMode}
                  colorScheme="green"
                />
              </HStack>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space={3}>
                  {['all', 'critical', 'overdue', 'upcoming'].map((filter) => (
                    <Pressable
                      key={filter}
                      px={4}
                      py={2}
                      borderRadius="full"
                      bg={maintenanceFilter === filter ? COLORS.primary : 'gray.100'}
                      onPress={() => setMaintenanceFilter(filter)}
                      _pressed={{ opacity: 0.8 }}
                    >
                      <Text
                        color={maintenanceFilter === filter ? 'white' : COLORS.text}
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
                <Text fontSize="sm" color={COLORS.subtext}>Priority:</Text>
                <Select 
                  selectedValue={priorityFilter} 
                  onValueChange={setPriorityFilter}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  flex={1}
                >
                  <Select.Item label="All Priorities" value="all" />
                  <Select.Item label="Critical" value="critical" />
                  <Select.Item label="High" value="high" />
                  <Select.Item label="Medium" value="medium" />
                  <Select.Item label="Low" value="low" />
                </Select>
              </HStack>
            </VStack>
          </Box>

          {/* Vehicle Maintenance Status List */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Vehicle Maintenance Status ({filteredVehicles.length})
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
                  borderLeftColor={getRiskColor(vehicle.maintenanceStatus.riskLevel)}
                >
                  <VStack space={4}>
                    {/* Vehicle Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box 
                          w="50px" 
                          h="50px" 
                          bg={`${getRiskColor(vehicle.maintenanceStatus.riskLevel)}.100`}
                          borderRadius="xl" 
                          alignItems="center" 
                          justifyContent="center"
                          position="relative"
                        >
                          <Icon 
                            as={Ionicons} 
                            name="construct" 
                            color={getRiskColor(vehicle.maintenanceStatus.riskLevel)} 
                            size="lg" 
                          />
                          {vehicle.maintenanceStatus.criticalIssues > 0 && (
                            <Circle 
                              size="12px" 
                              bg="red.500" 
                              position="absolute" 
                              top="-2px" 
                              right="-2px"
                              borderWidth={2}
                              borderColor="white"
                            >
                              <Text color="white" fontSize="xs" fontWeight="700">
                                {vehicle.maintenanceStatus.criticalIssues}
                              </Text>
                            </Circle>
                          )}
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                            {vehicle.vehicleName}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Text>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="sm" color={COLORS.primary} fontWeight="500">
                              {vehicle.id}
                            </Text>
                            <Badge bg={getRiskColor(vehicle.maintenanceStatus.riskLevel)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {vehicle.maintenanceStatus.riskLevel.toUpperCase()} RISK
                              </Text>
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={2}>
                        <Text fontSize="2xl" fontWeight="700" color={getHealthColor(vehicle.maintenanceStatus.overallHealth)}>
                          {vehicle.maintenanceStatus.overallHealth}%
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          Health Score
                        </Text>
                        {vehicle.maintenanceStatus.activeAlerts > 0 && (
                          <Badge bg="orange.500" borderRadius="full">
                            <Text color="white" fontSize="xs">{vehicle.maintenanceStatus.activeAlerts} alerts</Text>
                          </Badge>
                        )}
                      </VStack>
                    </HStack>

                    {/* Vehicle Metrics */}
                    <VStack space={3}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Vehicle Status
                        </Text>
                        <Text fontSize="sm" color={COLORS.text}>
                          {vehicle.mileage.toLocaleString()} miles • {vehicle.engineHours}h
                        </Text>
                      </HStack>
                      
                      <HStack space={4} justifyContent="space-between">
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="car-sport" size="sm" color="blue.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>Next Service</Text>
                          <Text fontSize="sm" fontWeight="600" color={vehicle.maintenanceStatus.nextServiceDue <= 0 ? 'red.500' : COLORS.text}>
                            {vehicle.maintenanceStatus.nextServiceDue <= 0 ? 'OVERDUE' : `${vehicle.maintenanceStatus.nextServiceDue} mi`}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="calendar" size="sm" color="purple.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>Days Until</Text>
                          <Text fontSize="sm" fontWeight="600" color={vehicle.maintenanceStatus.daysUntilService <= 5 ? 'orange.500' : COLORS.text}>
                            {vehicle.maintenanceStatus.daysUntilService <= 0 ? 'OVERDUE' : `${vehicle.maintenanceStatus.daysUntilService} days`}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="card" size="sm" color="green.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>YTD Cost</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            ${vehicle.costAnalysis.ytdMaintenanceCost.toFixed(0)}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="center" space={1}>
                          <Icon as={Ionicons} name="time" size="sm" color="orange.500" />
                          <Text fontSize="xs" color={COLORS.subtext}>Downtime</Text>
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {vehicle.downtimeAnalysis.ytdDowntimeHours.toFixed(1)}h
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* OBD Health Indicators */}
                    {predictiveMode && (
                      <VStack space={3}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Real-time OBD Health Monitoring
                        </Text>
                        
                        <HStack space={4} justifyContent="space-between">
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name={getStatusIcon(vehicle.obdHealthData.engineHealth.status)} size="sm" color={getHealthColor(vehicle.obdHealthData.engineHealth.score)} />
                            <Text fontSize="xs" color={COLORS.subtext}>Engine</Text>
                            <Text fontSize="sm" fontWeight="600" color={getHealthColor(vehicle.obdHealthData.engineHealth.score)}>
                              {vehicle.obdHealthData.engineHealth.score}%
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name={getStatusIcon(vehicle.obdHealthData.transmissionHealth.status)} size="sm" color={getHealthColor(vehicle.obdHealthData.transmissionHealth.score)} />
                            <Text fontSize="xs" color={COLORS.subtext}>Trans</Text>
                            <Text fontSize="sm" fontWeight="600" color={getHealthColor(vehicle.obdHealthData.transmissionHealth.score)}>
                              {vehicle.obdHealthData.transmissionHealth.score}%
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name={getStatusIcon(vehicle.obdHealthData.brakeHealth.status)} size="sm" color={getHealthColor(vehicle.obdHealthData.brakeHealth.score)} />
                            <Text fontSize="xs" color={COLORS.subtext}>Brakes</Text>
                            <Text fontSize="sm" fontWeight="600" color={getHealthColor(vehicle.obdHealthData.brakeHealth.score)}>
                              {vehicle.obdHealthData.brakeHealth.score}%
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name={getStatusIcon(vehicle.obdHealthData.tiresHealth.status)} size="sm" color={getHealthColor(vehicle.obdHealthData.tiresHealth.score)} />
                            <Text fontSize="xs" color={COLORS.subtext}>Tires</Text>
                            <Text fontSize="sm" fontWeight="600" color={getHealthColor(vehicle.obdHealthData.tiresHealth.score)}>
                              {vehicle.obdHealthData.tiresHealth.score}%
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name={getStatusIcon(vehicle.obdHealthData.batteryHealth.status)} size="sm" color={getHealthColor(vehicle.obdHealthData.batteryHealth.score)} />
                            <Text fontSize="xs" color={COLORS.subtext}>Battery</Text>
                            <Text fontSize="sm" fontWeight="600" color={getHealthColor(vehicle.obdHealthData.batteryHealth.score)}>
                              {vehicle.obdHealthData.batteryHealth.score}%
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    )}

                    {/* Predictive Maintenance Alerts */}
                    {predictiveMode && vehicle.predictiveAnalysis.predictions.length > 0 && (
                      <VStack space={3}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          AI Predictive Analysis
                        </Text>
                        
                        {vehicle.predictiveAnalysis.predictions.slice(0, 2).map((prediction, index) => (
                          <Box key={index} bg={`${getPriorityColor(prediction.safetyImpact)}.50`} p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor={getPriorityColor(prediction.safetyImpact)}>
                            <VStack space={2}>
                              <HStack justifyContent="space-between" alignItems="center">
                                <Text fontSize="sm" fontWeight="600" color={`${getPriorityColor(prediction.safetyImpact)}.700`}>
                                  {prediction.component}
                                </Text>
                                <Text fontSize="xs" color={`${getPriorityColor(prediction.safetyImpact)}.600`}>
                                  {prediction.confidence}% confidence
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color={`${getPriorityColor(prediction.safetyImpact)}.600`}>
                                Predicted: {prediction.predictedFailure === 0 ? 'IMMEDIATE' : `${prediction.predictedFailure} miles`}
                              </Text>
                              <Text fontSize="xs" color={`${getPriorityColor(prediction.safetyImpact)}.600`}>
                                {prediction.recommendation}
                              </Text>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    )}

                    {/* Scheduled Maintenance */}
                    {vehicle.maintenanceSchedule.length > 0 && (
                      <VStack space={3}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Upcoming Maintenance
                        </Text>
                        
                        {vehicle.maintenanceSchedule.slice(0, 2).map((maintenance) => (
                          <Box key={maintenance.id} bg="blue.50" p={3} borderRadius="lg" borderLeftWidth={4} borderLeftColor={getPriorityColor(maintenance.priority)}>
                            <VStack space={2}>
                              <HStack justifyContent="space-between" alignItems="center">
                                <Text fontSize="sm" fontWeight="600" color="blue.700">
                                  {maintenance.description}
                                </Text>
                                <Badge bg={getPriorityColor(maintenance.priority)} borderRadius="md" size="sm">
                                  <Text color="white" fontSize="xs" fontWeight="600">
                                    {maintenance.priority.toUpperCase()}
                                  </Text>
                                </Badge>
                              </HStack>
                              <HStack justifyContent="space-between">
                                <Text fontSize="xs" color="blue.600">
                                  {maintenance.scheduledDate.toLocaleDateString()} • {maintenance.assignedTechnician}
                                </Text>
                                <Text fontSize="xs" color="blue.600">
                                  ${maintenance.estimatedCost} • {maintenance.estimatedDuration}h
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
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
                        onPress={() => handleScheduleMaintenance(vehicle)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="calendar" size="xs" color="blue.600" />
                          <Text fontSize="xs" color="blue.600" fontWeight="600">Schedule</Text>
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

      {/* Vehicle Maintenance Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="600px" maxHeight="85%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedVehicle ? `${selectedVehicle.vehicleName} - Maintenance Details` : 'Maintenance Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedVehicle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Vehicle Overview */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Vehicle Overview
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>VIN</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.vin}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Mileage</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.mileage.toLocaleString()}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Engine Hours</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedVehicle.engineHours}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Overall Health</Text>
                      <Text fontSize="sm" color={getHealthColor(selectedVehicle.maintenanceStatus.overallHealth)}>
                        {selectedVehicle.maintenanceStatus.overallHealth}%
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Detailed OBD Health Data */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Detailed OBD Health Analysis
                    </Text>
                    
                    {Object.entries(selectedVehicle.obdHealthData).map(([system, data]) => (
                      <Box key={system} bg="gray.50" p={3} borderRadius="lg">
                        <VStack space={2}>
                          <HStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text} textTransform="capitalize">
                              {system.replace('Health', '')} System
                            </Text>
                            <Badge bg={getHealthColor(data.score)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {data.score}% - {data.status.toUpperCase()}
                              </Text>
                            </Badge>
                          </HStack>
                          
                          {Object.entries(data)
                            .filter(([key]) => !['score', 'status', 'diagnosticCodes'].includes(key))
                            .map(([key, value]) => (
                            <HStack key={key} justifyContent="space-between">
                              <Text fontSize="xs" color={COLORS.subtext} textTransform="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Text>
                              <Text fontSize="xs" color={COLORS.text}>
                                {typeof value === 'number' ? 
                                  (key.includes('Temp') ? `${value}°C` :
                                   key.includes('Pressure') ? `${value} PSI` :
                                   key.includes('Level') || key.includes('Wear') || key.includes('Restriction') || key.includes('Health') || key.includes('Capacity') ? `${value}%` :
                                   key.includes('Thickness') || key.includes('Tread') ? `${value} mm` :
                                   key.includes('Voltage') ? `${value}V` :
                                   key.includes('Change') || key.includes('Inspection') || key.includes('Needed') || key.includes('Predicted') ? `${value} mi` :
                                   Array.isArray(value) ? value.join(', ') + ' PSI' :
                                   value
                                  ) : value
                                }
                              </Text>
                            </HStack>
                          ))}
                          
                          {data.diagnosticCodes && data.diagnosticCodes.length > 0 && (
                            <Box bg="red.50" p={2} borderRadius="md">
                              <Text fontSize="xs" color="red.600" fontWeight="600">
                                Diagnostic Codes: {data.diagnosticCodes.join(', ')}
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Maintenance Schedule */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Maintenance Schedule
                    </Text>
                    {selectedVehicle.maintenanceSchedule.map((maintenance) => (
                      <Box key={maintenance.id} bg="gray.50" p={3} borderRadius="lg">
                        <VStack space={2}>
                          <HStack justifyContent="space-between">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {maintenance.description}
                            </Text>
                            <Badge bg={getPriorityColor(maintenance.priority)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {maintenance.priority.toUpperCase()}
                              </Text>
                            </Badge>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>Due Date</Text>
                            <Text fontSize="xs" color={COLORS.text}>{maintenance.scheduledDate.toLocaleDateString()}</Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>Est. Cost</Text>
                            <Text fontSize="xs" color={COLORS.text}>${maintenance.estimatedCost}</Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>Duration</Text>
                            <Text fontSize="xs" color={COLORS.text}>{maintenance.estimatedDuration}h</Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>Technician</Text>
                            <Text fontSize="xs" color={COLORS.text}>{maintenance.assignedTechnician}</Text>
                          </HStack>
                          {maintenance.predictiveNotes && (
                            <Box bg="blue.50" p={2} borderRadius="md">
                              <Text fontSize="xs" color="blue.600">
                                AI Notes: {maintenance.predictiveNotes}
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Cost Analysis */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Cost Analysis
                    </Text>
                    {Object.entries(selectedVehicle.costAnalysis).map(([key, value]) => (
                      <HStack key={key} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text fontSize="sm" color={typeof value === 'number' && value < 0 ? 'green.500' : COLORS.text}>
                          {typeof value === 'number' ? 
                            (key.includes('Cost') || key.includes('Budget') || key.includes('Variance') || key.includes('Impact') ? `$${Math.abs(value).toFixed(2)}${value < 0 ? ' (under)' : ''}` :
                             key.includes('Mile') ? `$${value.toFixed(3)}` :
                             value
                            ) : value
                          }
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Downtime Analysis */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Downtime Analysis
                    </Text>
                    {Object.entries(selectedVehicle.downtimeAnalysis).map(([key, value]) => (
                      <HStack key={key} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.subtext} textTransform="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text fontSize="sm" color={COLORS.text}>
                          {typeof value === 'number' ? 
                            (key.includes('Hours') || key.includes('Downtime') ? `${value.toFixed(1)}h` :
                             key.includes('Percentage') || key.includes('Availability') ? `${value.toFixed(1)}%` :
                             key.includes('Impact') ? `$${Math.abs(value).toFixed(2)}${value < 0 ? ' (loss)' : ''}` :
                             key.includes('Variance') ? `${value.toFixed(1)}h${value < 0 ? ' (better)' : ' (worse)'}` :
                             value
                            ) : value
                          }
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Maintenance History */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Recent Maintenance History
                    </Text>
                    {selectedVehicle.maintenanceHistory.map((history) => (
                      <Box key={history.id} bg="gray.50" p={3} borderRadius="lg">
                        <VStack space={2}>
                          <HStack justifyContent="space-between">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {history.description}
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="green.500">
                              ${history.cost}
                            </Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {history.date.toLocaleDateString()} • {history.technician}
                            </Text>
                            <Text fontSize="xs" color={COLORS.subtext}>
                              {history.duration}h • {history.mileage.toLocaleString()} mi
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color={COLORS.text}>
                            {history.findings}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>

                  <Divider />

                  {/* Compliance Status */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Compliance & Certifications
                    </Text>
                    {Object.entries(selectedVehicle.compliance).map(([type, data]) => (
                      <Box key={type} bg="gray.50" p={3} borderRadius="lg">
                        <VStack space={2}>
                          <HStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text} textTransform="capitalize">
                              {type.replace(/([A-Z])/g, ' $1').trim()}
                            </Text>
                            <Badge bg={data.status === 'current' ? 'green.500' : 'red.500'} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {data.status.toUpperCase()}
                              </Text>
                            </Badge>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>Last</Text>
                            <Text fontSize="xs" color={COLORS.text}>
                              {(data.lastInspection || data.lastTest).toLocaleDateString()}
                            </Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={COLORS.subtext}>Next Due</Text>
                            <Text fontSize="xs" color={COLORS.text}>
                              {data.nextDue.toLocaleDateString()}
                            </Text>
                          </HStack>
                          {data.result && (
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color={COLORS.subtext}>Result</Text>
                              <Text fontSize="xs" color={data.result === 'passed' ? 'green.500' : 'red.500'}>
                                {data.result.toUpperCase()}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
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
                onScheduleOpen();
              }}>
                Schedule Maintenance
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal isOpen={isScheduleOpen} onClose={onScheduleClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Schedule Maintenance</Modal.Header>
          <Modal.Body>
            {selectedVehicle && (
              <VStack space={4}>
                <Text fontSize="sm" color={COLORS.subtext}>
                  Schedule maintenance for {selectedVehicle.vehicleName}
                </Text>
                
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                    Recommended Services
                  </Text>
                  
                  {selectedVehicle.maintenanceSchedule.map((service) => (
                    <Box key={service.id} bg="gray.50" p={3} borderRadius="lg">
                      <VStack space={2}>
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                            {service.description}
                          </Text>
                          <Badge bg={getPriorityColor(service.priority)} borderRadius="md" size="sm">
                            <Text color="white" fontSize="xs" fontWeight="600">
                              {service.priority.toUpperCase()}
                            </Text>
                          </Badge>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs" color={COLORS.subtext}>Est. Cost</Text>
                          <Text fontSize="xs" color={COLORS.text}>${service.estimatedCost}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs" color={COLORS.subtext}>Duration</Text>
                          <Text fontSize="xs" color={COLORS.text}>{service.estimatedDuration} hours</Text>
                        </HStack>
                        <Button size="sm" bg={COLORS.primary} borderRadius="md">
                          Schedule This Service
                        </Button>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onScheduleClose}>
                Cancel
              </Button>
              <Button bg={COLORS.primary} onPress={onScheduleClose}>
                Schedule All
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Analytics Modal */}
      <Modal isOpen={isAnalyticsOpen} onClose={onAnalyticsClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Maintenance Analytics</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text fontSize="sm" color={COLORS.subtext}>
                Fleet maintenance performance and cost analysis
              </Text>
              
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Fleet Summary
                </Text>
                <Box bg="gray.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Total Vehicles</Text>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>{totalVehicles}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Critical Issues</Text>
                      <Text fontSize="sm" fontWeight="600" color={criticalVehicles > 0 ? 'red.500' : 'green.500'}>
                        {criticalVehicles}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Overdue Maintenance</Text>
                      <Text fontSize="sm" fontWeight="600" color={overdueVehicles > 0 ? 'orange.500' : 'green.500'}>
                        {overdueVehicles}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Average Health Score</Text>
                      <Text fontSize="sm" fontWeight="600" color={getHealthColor(avgHealth)}>
                        {avgHealth}%
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>YTD Maintenance Cost</Text>
                      <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                        ${totalYTDCost.toFixed(0)}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Best Performer</Text>
                      <Text fontSize="sm" fontWeight="600" color="green.500">
                        Service Truck 003 (96%)
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
                Export Report
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}