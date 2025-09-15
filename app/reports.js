import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Input, Select, CheckIcon, Progress,
  Modal, useDisclose, Switch, Circle, Avatar, Spinner,
  Center, useToast, FormControl, TextArea, FlatList,
  AlertDialog, Slider, Radio, Checkbox
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function ReportsPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_7_days');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedReport, setSelectedReport] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    includeOBDData: true,
    includeCostAnalysis: true,
    includePerformanceMetrics: true,
    includeComplianceData: true
  });

  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclose();
  const { isOpen: isGenerateOpen, onOpen: onGenerateOpen, onClose: onGenerateClose } = useDisclose();
  const { isOpen: isAnalyticsOpen, onOpen: onAnalyticsOpen, onClose: onAnalyticsClose } = useDisclose();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclose();

  // Comprehensive reports data with OBD telematic integration
  const [reports, setReports] = useState([
    {
      id: 'RPT-001',
      title: 'Fleet Performance Analytics',
      category: 'performance',
      description: 'Comprehensive fleet performance analysis with OBD data integration',
      type: 'automated',
      generatedDate: new Date('2024-01-15T09:00:00'),
      reportPeriod: 'Weekly',
      status: 'completed',
      priority: 'high',
      size: '2.4 MB',
      format: 'PDF',
      
      // OBD & Telematic Data Integration
      obdMetrics: {
        dataPoints: 245680,
        vehiclesCovered: 15,
        diagnosticCodes: 23,
        fuelEfficiencyAvg: 8.7,
        engineHealthScore: 87,
        emissionCompliance: 94.2,
        maintenancePredictions: 8
      },

      // Performance Insights
      performanceData: {
        overallFleetScore: 85,
        topPerformingVehicle: 'VH-003',
        worstPerformingVehicle: 'VH-007',
        avgMPG: 8.7,
        totalMilesDriven: 12450,
        idleTimeReduction: 12.5,
        harshEventReduction: 18.3,
        speedComplianceRate: 94.7
      },

      // Cost Analysis
      costAnalysis: {
        totalFuelCost: 5240.50,
        maintenanceCost: 2890.00,
        costPerMile: 0.67,
        savingsFromPredictive: 1250.00,
        budgetVariance: -450.00, // Under budget
        projectedMonthlyCost: 22500.00
      },

      // Safety & Compliance
      safetyMetrics: {
        safetyScore: 92,
        accidents: 0,
        nearMisses: 3,
        complianceViolations: 2,
        driverTrainingCompleted: 95.8,
        vehicleInspectionRate: 100,
        dotComplianceScore: 96.5
      },

      // Key Insights & Recommendations
      insights: [
        'Fuel efficiency improved by 8.5% compared to last period',
        'Vehicle VH-007 requires immediate attention - multiple diagnostic codes',
        'Predictive maintenance saved $1,250 in potential repairs',
        '3 vehicles approaching DOT inspection deadlines',
        'Driver performance training recommended for 2 drivers'
      ],

      downloadCount: 12,
      sharedWith: ['Fleet Manager', 'Operations Director', 'CFO'],
      scheduledReports: true,
      nextGeneration: new Date('2024-01-22T09:00:00')
    },
    {
      id: 'RPT-002',
      title: 'OBD Diagnostic & Health Report',
      category: 'maintenance',
      description: 'Detailed OBD diagnostic analysis with predictive maintenance insights',
      type: 'on_demand',
      generatedDate: new Date('2024-01-14T14:30:00'),
      reportPeriod: 'Daily',
      status: 'completed',
      priority: 'critical',
      size: '5.8 MB',
      format: 'Excel',

      obdMetrics: {
        dataPoints: 89340,
        vehiclesCovered: 15,
        criticalAlerts: 5,
        warningAlerts: 12,
        predictiveFailures: 3,
        systemHealthAvg: 84.5,
        engineTempAvg: 195.2,
        batteryHealthAvg: 89.3
      },

      diagnosticSummary: {
        engineIssues: 8,
        transmissionIssues: 3,
        brakeSystemAlerts: 2,
        emissionProblems: 4,
        batteryIssues: 1,
        totalDTCodes: 18,
        resolvedIssues: 13,
        pendingIssues: 5
      },

      predictiveAnalysis: {
        highRiskVehicles: ['VH-007', 'VH-012'],
        predictedFailures: [
          {
            vehicle: 'VH-007',
            component: 'Transmission',
            probability: 87,
            estimatedMiles: 1250,
            costImpact: 3500
          },
          {
            vehicle: 'VH-012', 
            component: 'Brake Pads',
            probability: 92,
            estimatedMiles: 800,
            costImpact: 450
          }
        ],
        maintenanceRecommendations: 8,
        costAvoidance: 12500
      },

      insights: [
        'Transmission failure predicted for VH-007 within 1,250 miles',
        'Battery health declining across 40% of fleet',
        'Emission system issues detected in 4 vehicles',
        'Preventive maintenance could save $12,500 in repairs',
        'Engine temperature trending higher in summer vehicles'
      ],

      downloadCount: 8,
      sharedWith: ['Maintenance Manager', 'Fleet Technicians'],
      scheduledReports: false
    },
    {
      id: 'RPT-003',
      title: 'Driver Performance & Safety Analysis',
      category: 'driver_performance',
      description: 'Individual driver performance metrics with safety scoring',
      type: 'automated',
      generatedDate: new Date('2024-01-13T08:00:00'),
      reportPeriod: 'Monthly',
      status: 'completed',
      priority: 'medium',
      size: '1.9 MB',
      format: 'PDF',

      driverMetrics: {
        totalDrivers: 12,
        avgPerformanceScore: 84.5,
        topPerformer: 'Mike Wilson (96%)',
        needsImprovement: 2,
        safetyTrainingCompleted: 95,
        complianceRate: 97.5,
        avgDrivingHours: 8.2
      },

      safetyAnalysis: {
        harshBrakingEvents: 45,
        harshAcceleration: 38,
        speedingViolations: 12,
        rapidTurns: 23,
        phoneUsageDetected: 3,
        seatbeltViolations: 1,
        fatigueEvents: 7,
        overallSafetyScore: 89.5
      },

      efficiencyMetrics: {
        avgFuelEfficiency: 8.9,
        idleTimePercentage: 11.2,
        routeDeviation: 5.8,
        onTimePerformance: 94.2,
        customerRatings: 4.6,
        completionRate: 98.1
      },

      insights: [
        'Mike Wilson consistently top performer with 96% score',
        'Harsh braking events decreased by 15% this month',
        '2 drivers require additional safety training',
        'Phone usage violations dropped to lowest level',
        'Overall fleet efficiency improved by 7.3%'
      ],

      downloadCount: 15,
      sharedWith: ['HR Manager', 'Safety Officer', 'Operations Manager'],
      scheduledReports: true,
      nextGeneration: new Date('2024-02-13T08:00:00')
    },
    {
      id: 'RPT-004',
      title: 'Cost Analysis & ROI Report',
      category: 'financial',
      description: 'Comprehensive financial analysis with ROI calculations',
      type: 'on_demand',
      generatedDate: new Date('2024-01-12T16:45:00'),
      reportPeriod: 'Quarterly',
      status: 'completed',
      priority: 'high',
      size: '3.2 MB',
      format: 'Excel',

      financialSummary: {
        totalOperatingCost: 45620.50,
        fuelExpenses: 18450.00,
        maintenanceExpenses: 12340.00,
        insuranceCosts: 8950.00,
        driverCosts: 28450.00,
        costPerMile: 0.73,
        budgetVariance: -2340.00,
        projectedYearlyTotal: 182500.00
      },

      roiAnalysis: {
        systemROI: 245,
        fuelSavings: 8450.00,
        maintenanceSavings: 12600.00,
        insuranceSavings: 2400.00,
        productivityGains: 15600.00,
        paybackPeriod: 14.5,
        netBenefit: 39050.00
      },

      costOptimization: {
        identifiedSavings: 8750.00,
        routeOptimization: 3200.00,
        fuelOptimization: 2800.00,
        maintenanceOptimization: 2750.00,
        implementationCost: 1250.00,
        netSavings: 7500.00
      },

      insights: [
        'System ROI of 245% exceeds industry average',
        'Predictive maintenance saved $12,600 this quarter',
        'Route optimization potential savings: $3,200/month',
        'Fuel efficiency improvements yielding $2,800/month',
        'Overall cost per mile decreased by 12%'
      ],

      downloadCount: 6,
      sharedWith: ['CFO', 'Finance Manager', 'Operations Director'],
      scheduledReports: true,
      nextGeneration: new Date('2024-04-12T16:45:00')
    },
    {
      id: 'RPT-005',
      title: 'Environmental & Emissions Compliance',
      category: 'compliance',
      description: 'Environmental impact analysis and emissions compliance tracking',
      type: 'automated',
      generatedDate: new Date('2024-01-11T10:15:00'),
      reportPeriod: 'Monthly',
      status: 'in_progress',
      priority: 'medium',
      size: '1.5 MB',
      format: 'PDF',

      emissionsData: {
        totalCO2Emissions: 45.6, // tons
        NOxEmissions: 234.5, // lbs
        particulateEmissions: 12.3, // lbs
        complianceRate: 94.2,
        violationCount: 2,
        improvementRate: 8.5,
        targetReduction: 15.0
      },

      environmentalImpact: {
        fuelConsumption: 2145.5, // gallons
        carbonFootprint: 'Reduced by 12%',
        ecoFriendlyRoutes: 78.5, // percentage
        idleReduction: 23.4, // percentage
        greenScore: 87.2,
        sustainabilityRating: 'B+'
      },

      complianceStatus: {
        epaCompliance: 96.5,
        stateCompliance: 94.8,
        localCompliance: 98.2,
        pendingInspections: 3,
        violationsResolved: 12,
        upcomingDeadlines: 5
      },

      insights: [
        'CO2 emissions reduced by 12% compared to last period',
        '2 vehicles require immediate emissions testing',
        'Eco-friendly routing increased by 15%',
        'Idle time reduction saving 450 gallons/month',
        'On track to meet yearly reduction targets'
      ],

      downloadCount: 4,
      sharedWith: ['Environmental Officer', 'Compliance Manager'],
      scheduledReports: true,
      nextGeneration: new Date('2024-02-11T10:15:00')
    }
  ]);

  // Helper functions
  const getCategoryColor = (category) => ({
    'performance': 'green.500',
    'maintenance': 'orange.500', 
    'driver_performance': 'blue.500',
    'financial': 'purple.500',
    'compliance': 'red.500',
    'safety': 'yellow.500'
  }[category] || 'gray.500');

  const getCategoryIcon = (category) => ({
    'performance': 'analytics',
    'maintenance': 'construct',
    'driver_performance': 'person',
    'financial': 'card',
    'compliance': 'shield-checkmark',
    'safety': 'warning'
  }[category] || 'document');

  const getStatusColor = (status) => ({
    'completed': 'green.500',
    'in_progress': 'blue.500',
    'scheduled': 'orange.500',
    'failed': 'red.500'
  }[status] || 'gray.500');

  const getPriorityColor = (priority) => ({
    'critical': 'red.500',
    'high': 'orange.500',
    'medium': 'blue.500',
    'low': 'green.500'
  }[priority] || 'gray.500');

  // Filter reports
  const filteredReports = reports.filter(report => {
    const timeframeMatch = selectedTimeframe === 'all' || 
      (selectedTimeframe === 'last_7_days' && 
       new Date() - report.generatedDate <= 7 * 24 * 60 * 60 * 1000);
    
    const typeMatch = selectedReportType === 'all' || report.category === selectedReportType;
    
    return timeframeMatch && typeMatch;
  });

  // Calculate statistics
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const scheduledReports = reports.filter(r => r.scheduledReports).length;
  const totalDownloads = reports.reduce((sum, r) => sum + r.downloadCount, 0);
  const avgGenerationTime = 4.2; // minutes
  const dataAccuracy = 98.7; // percentage

  // Handler functions
  const handleReportDetails = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleGenerateReport = () => {
    onGenerateOpen();
  };

  const handleDownloadReport = (report) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.show({
        title: "Download Started",
        description: `${report.title} is being downloaded.`,
        status: "success"
      });
    }, 2000);
  };

  const handleScheduleReport = (report) => {
    setSelectedReport(report);
    onScheduleOpen();
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
                  Reports & Analytics
                </Text>
                <HStack alignItems="center" space={2}>
                  <Circle size="8px" bg="green.500" />
                  <Text fontSize="xs" color={COLORS.subtext}>
                    Live Data • Auto-Generated • Updated: {lastUpdated.toLocaleTimeString()}
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
                leftIcon={<Icon as={Ionicons} name="bar-chart" size="sm" color={COLORS.primary} />}
              >
                Analytics
              </Button>
              <Button 
                size="sm" 
                bg={COLORS.primary}
                leftIcon={<Icon as={Ionicons} name="add" size="sm" color="white" />}
                onPress={handleGenerateReport}
              >
                Generate
              </Button>
            </HStack>
          </HStack>

          {/* Report Statistics Dashboard */}
          <HStack space={3}>
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="green.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="document-text" size="lg" color="green.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalReports}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Total Reports</Text>
                <Text fontSize="xs" color="green.500" fontWeight="600">
                  {completedReports} Completed
                </Text>
              </VStack>
            </Box>
            
            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="blue.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="time" size="lg" color="blue.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{scheduledReports}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Scheduled</Text>
                <Text fontSize="xs" color="blue.500" fontWeight="600">
                  Auto-Generated
                </Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="purple.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="download" size="lg" color="purple.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{totalDownloads}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Downloads</Text>
                <Text fontSize="xs" color="purple.500" fontWeight="600">
                  This Month
                </Text>
              </VStack>
            </Box>

            <Box flex={1} bg="white" p={4} borderRadius="xl" borderLeftWidth={4} borderLeftColor="orange.500" shadow={2}>
              <VStack space={2}>
                <Icon as={Ionicons} name="checkmark-circle" size="lg" color="orange.500" />
                <Text fontSize="2xl" fontWeight="700" color={COLORS.text}>{dataAccuracy}</Text>
                <Text fontSize="xs" color={COLORS.subtext}>Data Accuracy</Text>
                <Text fontSize="xs" color="orange.500" fontWeight="600">
                  {avgGenerationTime}m Avg Gen
                </Text>
              </VStack>
            </Box>
          </HStack>

          {/* Filters and Controls */}
          <Box bg="white" p={4} borderRadius="xl" shadow={2}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                  Report Management & Filters
                </Text>
                <HStack alignItems="center" space={2}>
                  <Text fontSize="sm" color={COLORS.subtext}>Real-time Data</Text>
                  <Switch 
                    isChecked={true} 
                    colorScheme="green"
                    size="sm"
                  />
                </HStack>
              </HStack>

              {/* Filter Controls */}
              <HStack space={3} alignItems="center">
                <Text fontSize="sm" color={COLORS.subtext}>Filters:</Text>
                <Select 
                  selectedValue={selectedTimeframe} 
                  onValueChange={setSelectedTimeframe}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  minWidth="140px"
                >
                  <Select.Item label="Last 7 Days" value="last_7_days" />
                  <Select.Item label="Last 30 Days" value="last_30_days" />
                  <Select.Item label="Last 90 Days" value="last_90_days" />
                  <Select.Item label="All Time" value="all" />
                </Select>

                <Select 
                  selectedValue={selectedReportType} 
                  onValueChange={setSelectedReportType}
                  _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="5" /> }}
                  minWidth="160px"
                >
                  <Select.Item label="All Categories" value="all" />
                  <Select.Item label="Performance" value="performance" />
                  <Select.Item label="Maintenance" value="maintenance" />
                  <Select.Item label="Driver Performance" value="driver_performance" />
                  <Select.Item label="Financial" value="financial" />
                  <Select.Item label="Compliance" value="compliance" />
                </Select>
              </HStack>

              {/* Advanced Filters */}
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                  Advanced Report Options
                </Text>
                <HStack space={4} flexWrap="wrap">
                  <HStack alignItems="center" space={2}>
                    <Checkbox 
                      isChecked={advancedFilters.includeOBDData}
                      onChange={(checked) => setAdvancedFilters({...advancedFilters, includeOBDData: checked})}
                      colorScheme="green"
                      size="sm"
                    />
                    <Text fontSize="sm" color={COLORS.text}>Include OBD Data</Text>
                  </HStack>
                  
                  <HStack alignItems="center" space={2}>
                    <Checkbox 
                      isChecked={advancedFilters.includeCostAnalysis}
                      onChange={(checked) => setAdvancedFilters({...advancedFilters, includeCostAnalysis: checked})}
                      colorScheme="green"
                      size="sm"
                    />
                    <Text fontSize="sm" color={COLORS.text}>Cost Analysis</Text>
                  </HStack>
                  
                  <HStack alignItems="center" space={2}>
                    <Checkbox 
                      isChecked={advancedFilters.includePerformanceMetrics}
                      onChange={(checked) => setAdvancedFilters({...advancedFilters, includePerformanceMetrics: checked})}
                      colorScheme="green"
                      size="sm"
                    />
                    <Text fontSize="sm" color={COLORS.text}>Performance Metrics</Text>
                  </HStack>
                  
                  <HStack alignItems="center" space={2}>
                    <Checkbox 
                      isChecked={advancedFilters.includeComplianceData}
                      onChange={(checked) => setAdvancedFilters({...advancedFilters, includeComplianceData: checked})}
                      colorScheme="green"
                      size="sm"
                    />
                    <Text fontSize="sm" color={COLORS.text}>Compliance Data</Text>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Reports List */}
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                Available Reports ({filteredReports.length})
              </Text>
              <HStack space={2}>
                <Pressable>
                  <HStack alignItems="center" space={1}>
                    <Icon as={Ionicons} name="refresh" size="sm" color={COLORS.primary} />
                    <Text fontSize="sm" color={COLORS.primary} fontWeight="500">Refresh</Text>
                  </HStack>
                </Pressable>
              </HStack>
            </HStack>
            
            {isGenerating && (
              <Center py={8}>
                <Spinner size="lg" color={COLORS.primary} />
                <Text mt={2} color={COLORS.subtext}>Generating report...</Text>
              </Center>
            )}
            
            {filteredReports.map((report) => (
              <Pressable
                key={report.id}
                onPress={() => handleReportDetails(report)}
                _pressed={{ opacity: 0.8 }}
              >
                <Box 
                  bg="white" 
                  borderRadius="xl" 
                  p={4} 
                  shadow={2}
                  borderLeftWidth={6}
                  borderLeftColor={getCategoryColor(report.category)}
                >
                  <VStack space={4}>
                    {/* Report Header */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <HStack space={3} flex={1}>
                        <Box p={3} bg={getCategoryColor(report.category) + '.100'} borderRadius="lg">
                          <Icon 
                            as={Ionicons} 
                            name={getCategoryIcon(report.category)} 
                            color={getCategoryColor(report.category)} 
                            size="lg" 
                          />
                        </Box>
                        <VStack space={1} flex={1}>
                          <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
                            {report.title}
                          </Text>
                          <Text fontSize="sm" color={COLORS.subtext}>
                            {report.description}
                          </Text>
                          <HStack alignItems="center" space={2} flexWrap="wrap">
                            <Badge bg={getCategoryColor(report.category)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {report.category.replace('_', ' ').toUpperCase()}
                              </Text>
                            </Badge>
                            <Badge bg={getStatusColor(report.status)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {report.status.toUpperCase()}
                              </Text>
                            </Badge>
                            <Badge bg={getPriorityColor(report.priority)} borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {report.priority.toUpperCase()}
                              </Text>
                            </Badge>
                            <Badge bg="gray.500" borderRadius="md" size="sm">
                              <Text color="white" fontSize="xs" fontWeight="600">
                                {report.format}
                              </Text>
                            </Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      
                      <VStack alignItems="flex-end" space={1}>
                        <Text fontSize="sm" color={COLORS.subtext}>
                          Generated: {report.generatedDate.toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          Size: {report.size}
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          {report.downloadCount} downloads
                        </Text>
                        {report.scheduledReports && (
                          <HStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="time" size="xs" color="blue.500" />
                            <Text fontSize="xs" color="blue.500" fontWeight="600">
                              Scheduled
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </HStack>

                    {/* OBD & Performance Metrics Preview */}
                    {report.obdMetrics && (
                      <VStack space={3}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          OBD & Telematic Data Overview
                        </Text>
                        <HStack space={4} justifyContent="space-between">
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="speedometer" size="sm" color="green.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Data Points</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {report.obdMetrics.dataPoints?.toLocaleString() || 'N/A'}
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="car" size="sm" color="blue.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Vehicles</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {report.obdMetrics.vehiclesCovered || 'N/A'}
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="warning" size="sm" color="orange.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Alerts</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {(report.obdMetrics.criticalAlerts || 0) + (report.obdMetrics.warningAlerts || 0) || report.obdMetrics.diagnosticCodes || 'N/A'}
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="leaf" size="sm" color="green.600" />
                            <Text fontSize="xs" color={COLORS.subtext}>Efficiency</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {report.obdMetrics.fuelEfficiencyAvg || report.performanceData?.avgMPG || 'N/A'} {report.obdMetrics.fuelEfficiencyAvg ? 'mpg' : ''}
                            </Text>
                          </VStack>
                          
                          <VStack alignItems="center" space={1}>
                            <Icon as={Ionicons} name="checkmark-circle" size="sm" color="purple.500" />
                            <Text fontSize="xs" color={COLORS.subtext}>Health Score</Text>
                            <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                              {report.obdMetrics.engineHealthScore || report.performanceData?.overallFleetScore || 'N/A'}{report.obdMetrics.engineHealthScore ? '%' : ''}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    )}

                    {/* Key Insights Preview */}
                    {report.insights && report.insights.length > 0 && (
                      <VStack space={2}>
                        <Text fontSize="sm" fontWeight="600" color={COLORS.text}>
                          Key Insights
                        </Text>
                        <VStack space={1}>
                          {report.insights.slice(0, 3).map((insight, index) => (
                            <HStack key={index} alignItems="flex-start" space={2}>
                              <Circle size="4px" bg={COLORS.primary} mt={2} />
                              <Text fontSize="xs" color={COLORS.text} flex={1}>
                                {insight}
                              </Text>
                            </HStack>
                          ))}
                          {report.insights.length > 3 && (
                            <Text fontSize="xs" color={COLORS.subtext} fontStyle="italic">
                              +{report.insights.length - 3} more insights...
                            </Text>
                          )}
                        </VStack>
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
                        onPress={() => handleReportDetails(report)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="eye" size="xs" color="blue.600" />
                          <Text fontSize="xs" color="blue.600" fontWeight="600">View</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="green.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'green.200' }}
                        flex={1}
                        onPress={() => handleDownloadReport(report)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="download" size="xs" color="green.600" />
                          <Text fontSize="xs" color="green.600" fontWeight="600">Download</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="purple.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'purple.200' }}
                        flex={1}
                        onPress={() => handleScheduleReport(report)}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="time" size="xs" color="purple.600" />
                          <Text fontSize="xs" color="purple.600" fontWeight="600">Schedule</Text>
                        </HStack>
                      </Pressable>
                      
                      <Pressable 
                        px={3} 
                        py={2} 
                        bg="orange.100" 
                        borderRadius="md" 
                        _pressed={{ bg: 'orange.200' }}
                        flex={1}
                      >
                        <HStack alignItems="center" justifyContent="center" space={1}>
                          <Icon as={Ionicons} name="share" size="xs" color="orange.600" />
                          <Text fontSize="xs" color="orange.600" fontWeight="600">Share</Text>
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

      {/* Report Details Modal - I'll continue with the rest of the modals in the next part */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="700px" maxHeight="90%">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedReport ? selectedReport.title : 'Report Details'}
          </Modal.Header>
          <Modal.Body>
            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  {/* Report Overview */}
                  <VStack space={3}>
                    <Text fontSize="md" fontWeight="600" color={COLORS.text}>
                      Report Overview
                    </Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Report ID</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedReport.id}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Category</Text>
                      <Text fontSize="sm" color={COLORS.text} textTransform="capitalize">
                        {selectedReport.category.replace('_', ' ')}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Generated</Text>
                      <Text fontSize="sm" color={COLORS.text}>
                        {selectedReport.generatedDate.toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Report Period</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedReport.reportPeriod}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>File Size</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedReport.size}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.subtext}>Downloads</Text>
                      <Text fontSize="sm" color={COLORS.text}>{selectedReport.downloadCount}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Comprehensive report details would continue here... */}
                  {/* This is where the detailed modal content would go */}
                  
                </VStack>
              </ScrollView>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
                Close
              </Button>
              <Button bg={COLORS.primary} onPress={() => handleDownloadReport(selectedReport)}>
                Download Report
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* The rest of the modals would continue here... */}
    </Box>
  );
}