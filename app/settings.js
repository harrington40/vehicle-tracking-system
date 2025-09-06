import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, ScrollView, Pressable, Badge,
  Icon, Divider, Button, Switch, Select, CheckIcon, Progress,
  Modal, useDisclose, Slider, FormControl, Input,
  AlertDialog, useToast, Avatar, Circle, Center
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();

  // Quick / misc settings
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isLocationTracking, setIsLocationTracking] = useState(true);
  const [isOBDAutoConnect, setIsOBDAutoConnect] = useState(true);
  const [isRealTimeAlerts, setIsRealTimeAlerts] = useState(true);
  const [isPredictiveMode, setIsPredictiveMode] = useState(false);
  const [batteryOptimization, setBatteryOptimization] = useState(true);
  const [dataRefreshRate, setDataRefreshRate] = useState(30);
  const [alertSensitivity, setAlertSensitivity] = useState(2);
  const [mapProvider, setMapProvider] = useState('google');
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [distanceUnit, setDistanceUnit] = useState('miles');
  const [fuelUnit, setFuelUnit] = useState('gallons');
  const [isLoading, setIsLoading] = useState(false);

  // Security settings local state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    biometricEnabled: false,
    autoLock: true,
    secureObd: true,
    deviceVerification: true
  });

  // Data & Privacy
  const [dataSettings, setDataSettings] = useState({
    dataRetention: 90,
    autoBackup: true,
    cloudSync: true,
    dataEncryption: true,
    anonymousAnalytics: false,
    locationHistory: true,
    dataExportFormat: 'csv'
  });

  // OBD
  const [obdSettings, setObdSettings] = useState({
    autoConnect: true,
    scanInterval: 5,
    dataCompression: true,
    diagnosticLevel: 'detailed',
    predictiveAnalysis: false,
    alertThresholds: {
      engineTemp: 220,
      oilPressure: 15,
      batteryVoltage: 11.5,
      fuelLevel: 10
    },
    supportedProtocols: ['ISO 9141-2', 'ISO 14230-4', 'SAE J1850', 'CAN Bus'],
    connectedDevices: 1,
    lastDiagnostic: new Date()
  });

  // GPS
  const [gpsSettings, setGpsSettings] = useState({
    trackingEnabled: true,
    accuracy: 'high',
    updateInterval: 10,
    geofencing: true,
    routeOptimization: true,
    offlineMapping: false,
    satelliteCount: 12,
    signalStrength: 'Excellent',
    lastFix: new Date(),
    coordinates: { lat: 40.7128, lng: -74.0060 }
  });

  // User profile
  const [userProfile] = useState({
    name: 'John Anderson',
    email: 'john.anderson@transtech.com',
    role: 'Fleet Manager',
    department: 'Operations',
    employeeId: 'TT-2024-001',
    avatar: null,
    lastLogin: new Date(),
    accountCreated: new Date('2023-06-15')
  });

  // System info
  const [systemInfo] = useState({
    appVersion: '2.1.4',
    buildNumber: '2024.1.15',
    obdFirmware: '3.2.1',
    gpsModule: 'Active',
    lastUpdate: new Date('2024-01-15'),
    deviceStorage: 45.2,
    totalStorage: 64,
    dataUsage: 2.8,
    batteryHealth: 94
  });

  // Modals / dialogs
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclose();
  const { isOpen: isOBDOpen, onOpen: onOBDOpen, onClose: onOBDClose } = useDisclose();
  const { isOpen: isGPSOpen, onOpen: onGPSOpen, onClose: onGPSClose } = useDisclose();
  const { isOpen: isDataOpen, onOpen: onDataOpen, onClose: onDataClose } = useDisclose();
  const { isOpen: isSecurityOpen, onOpen: onSecurityOpen, onClose: onSecurityClose } = useDisclose();
  const { isOpen: isAboutOpen, onOpen: onAboutOpen, onClose: onAboutClose } = useDisclose();
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclose();

  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.show({
        title: 'Settings Saved',
        description: 'All settings updated.',
        status: 'success'
      });
    }, 1200);
  };

  const handleResetSettings = () => {
    onResetClose();
    setDataRefreshRate(30);
    setAlertSensitivity(2);
    setMapProvider('google');
    setTemperatureUnit('celsius');
    setDistanceUnit('miles');
    setFuelUnit('gallons');
    toast.show({
      title: 'Settings Reset',
      description: 'Defaults restored.',
      status: 'info'
    });
  };

  const getStoragePercentage = () =>
    (systemInfo.deviceStorage / systemInfo.totalStorage) * 100;

  const getSignalStrengthColor = (s) => {
    switch (s) {
      case 'Excellent': return 'green.500';
      case 'Good': return 'blue.500';
      case 'Fair': return 'orange.500';
      case 'Poor': return 'red.500';
      default: return 'gray.500';
    }
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
                <VStack space={1}>
                  <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
                    Settings & Configuration
                  </Text>
                  <HStack alignItems="center" space={2}>
                    <Circle size="8px" bg="green.500" />
                    <Text fontSize="xs" color={COLORS.subtext}>
                      System Status: Online • OBD Connected • GPS Active
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
              <Button
                size="sm"
                bg={COLORS.primary}
                leftIcon={<Icon as={Ionicons} name="save" size="sm" color="white" />}
                onPress={handleSaveSettings}
                isLoading={isLoading}
              >
                Save All
              </Button>
            </HStack>

          {/* System Status */}
          <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor={COLORS.primary}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>System Status Overview</Text>
              <HStack space={4}>
                <VStack flex={1} alignItems="center" space={2}>
                  <Box p={3} bg="green.100" borderRadius="full">
                    <Icon as={Ionicons} name="speedometer" size="lg" color="green.500" />
                  </Box>
                  <Text fontSize="xs" color={COLORS.subtext}>OBD Status</Text>
                  <Text fontSize="sm" fontWeight="600" color="green.500">Connected</Text>
                  <Text fontSize="xs" color={COLORS.subtext}>{obdSettings.connectedDevices} Device(s)</Text>
                </VStack>
                <VStack flex={1} alignItems="center" space={2}>
                  <Box p={3} bg="blue.100" borderRadius="full">
                    <Icon as={Ionicons} name="location" size="lg" color="blue.500" />
                  </Box>
                  <Text fontSize="xs" color={COLORS.subtext}>GPS Status</Text>
                  <Text fontSize="sm" fontWeight="600" color="blue.500">Active</Text>
                  <Text fontSize="xs" color={COLORS.subtext}>{gpsSettings.satelliteCount} Satellites</Text>
                </VStack>
                <VStack flex={1} alignItems="center" space={2}>
                  <Box p={3} bg="purple.100" borderRadius="full">
                    <Icon as={Ionicons} name="cloud" size="lg" color="purple.500" />
                  </Box>
                  <Text fontSize="xs" color={COLORS.subtext}>Data Sync</Text>
                  <Text fontSize="sm" fontWeight="600" color="purple.500">Synced</Text>
                  <Text fontSize="xs" color={COLORS.subtext}>2 min ago</Text>
                </VStack>
                <VStack flex={1} alignItems="center" space={2}>
                  <Box p={3} bg="orange.100" borderRadius="full">
                    <Icon as={Ionicons} name="battery-half" size="lg" color="orange.500" />
                  </Box>
                  <Text fontSize="xs" color={COLORS.subtext}>Battery</Text>
                  <Text fontSize="sm" fontWeight="600" color="orange.500">{systemInfo.batteryHealth}%</Text>
                  <Text fontSize="xs" color={COLORS.subtext}>Health Good</Text>
                </VStack>
              </HStack>

              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Storage Usage</Text>
                  <Text fontSize="sm" color={COLORS.subtext}>
                    {systemInfo.deviceStorage}GB / {systemInfo.totalStorage}GB
                  </Text>
                </HStack>
                <Progress
                  value={getStoragePercentage()}
                  colorScheme={
                    getStoragePercentage() > 80
                      ? 'red'
                      : getStoragePercentage() > 60
                      ? 'orange'
                      : 'green'
                  }
                  size="sm"
                />
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Data Usage (This Month)</Text>
                  <Text fontSize="sm" color={COLORS.subtext}>{systemInfo.dataUsage}GB</Text>
                </HStack>
                <Progress value={46.7} colorScheme="blue" size="sm" />
              </VStack>
            </VStack>
          </Box>

          {/* Quick Settings */}
          <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="blue.500">
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>Quick Settings</Text>
              <VStack space={3}>
                {[
                  {
                    label: 'Push Notifications',
                    desc: 'Receive real-time alerts and updates',
                    icon: 'notifications',
                    state: isNotificationsEnabled,
                    setter: setIsNotificationsEnabled,
                    color: 'blue.500'
                  },
                  {
                    label: 'Location Tracking',
                    desc: 'Enable GPS tracking for vehicles',
                    icon: 'location-outline',
                    state: isLocationTracking,
                    setter: setIsLocationTracking,
                    color: 'green.500'
                  },
                  {
                    label: 'OBD Auto-Connect',
                    desc: 'Automatically connect to OBD devices',
                    icon: 'car-sport',
                    state: isOBDAutoConnect,
                    setter: setIsOBDAutoConnect,
                    color: 'purple.500'
                  },
                  {
                    label: 'Real-time Alerts',
                    desc: 'Critical event notifications',
                    icon: 'warning',
                    state: isRealTimeAlerts,
                    setter: setIsRealTimeAlerts,
                    color: 'orange.500'
                  },
                  {
                    label: 'Predictive Mode',
                    desc: 'AI predictive maintenance',
                    icon: 'analytics',
                    state: isPredictiveMode,
                    setter: setIsPredictiveMode,
                    color: 'red.500'
                  },
                  {
                    label: 'Battery Optimization',
                    desc: 'Longer battery life',
                    icon: 'battery-charging',
                    state: batteryOptimization,
                    setter: setBatteryOptimization,
                    color: 'yellow.500'
                  }
                ].map(item => (
                  <HStack key={item.label} justifyContent="space-between" alignItems="center">
                    <HStack alignItems="center" space={3}>
                      <Icon as={Ionicons} name={item.icon} size="sm" color={item.color} />
                      <VStack space={0}>
                        <Text fontSize="sm" fontWeight="500" color={COLORS.text}>{item.label}</Text>
                        <Text fontSize="xs" color={COLORS.subtext}>{item.desc}</Text>
                      </VStack>
                    </HStack>
                    <Switch
                      isChecked={item.state}
                      onToggle={item.setter}
                      colorScheme="green"
                    />
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Box>

          {/* Sections */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>Configuration & Management</Text>

            <Pressable onPress={onProfileOpen}>
              <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="green.500">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space={4} alignItems="center">
                    <Box p={3} bg="green.100" borderRadius="lg">
                      <Icon as={Ionicons} name="person" size="lg" color="green.500" />
                    </Box>
                    <VStack space={1}>
                      <Text fontSize="md" fontWeight="600" color={COLORS.text}>Profile & Account</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>Manage personal information</Text>
                      <HStack space={2} alignItems="center">
                        <Badge bg="green.500" borderRadius="md">
                          <Text fontSize="xs" color="white">{userProfile.role}</Text>
                        </Badge>
                        <Text fontSize="xs" color={COLORS.subtext}>
                          Last login: {userProfile.lastLogin.toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color={COLORS.subtext} />
                </HStack>
              </Box>
            </Pressable>

            <Pressable onPress={onOBDOpen}>
              <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="purple.500">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space={4} alignItems="center">
                    <Box p={3} bg="purple.100" borderRadius="lg">
                      <Icon as={Ionicons} name="speedometer" size="lg" color="purple.500" />
                    </Box>
                    <VStack space={1}>
                      <Text fontSize="md" fontWeight="600" color={COLORS.text}>OBD Configuration</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>Diagnostics & thresholds</Text>
                      <HStack space={2} alignItems="center">
                        <Circle size="6px" bg="green.500" />
                        <Text fontSize="xs" color="green.500" fontWeight="500">
                          {obdSettings.connectedDevices} Device Connected
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>Scan: {obdSettings.scanInterval}s</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color={COLORS.subtext} />
                </HStack>
              </Box>
            </Pressable>

            <Pressable onPress={onGPSOpen}>
              <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="blue.500">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space={4} alignItems="center">
                    <Box p={3} bg="blue.100" borderRadius="lg">
                      <Icon as={Ionicons} name="location" size="lg" color="blue.500" />
                    </Box>
                    <VStack space={1}>
                      <Text fontSize="md" fontWeight="600" color={COLORS.text}>GPS & Location Settings</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>Accuracy & tracking</Text>
                      <HStack space={2} alignItems="center">
                        <Circle size="6px" bg={getSignalStrengthColor(gpsSettings.signalStrength)} />
                        <Text fontSize="xs" color={getSignalStrengthColor(gpsSettings.signalStrength)} fontWeight="500">
                          {gpsSettings.signalStrength} Signal
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>{gpsSettings.satelliteCount} Satellites</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color={COLORS.subtext} />
                </HStack>
              </Box>
            </Pressable>

            <Pressable onPress={onDataOpen}>
              <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="orange.500">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space={4} alignItems="center">
                    <Box p={3} bg="orange.100" borderRadius="lg">
                      <Icon as={Ionicons} name="shield-checkmark" size="lg" color="orange.500" />
                    </Box>
                    <VStack space={1}>
                      <Text fontSize="md" fontWeight="600" color={COLORS.text}>Data & Privacy</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>Retention & encryption</Text>
                      <HStack space={2} alignItems="center">
                        <Circle size="6px" bg={dataSettings.dataEncryption ? 'green.500' : 'red.500'} />
                        <Text fontSize="xs" color={dataSettings.dataEncryption ? 'green.500' : 'red.500'} fontWeight="500">
                          {dataSettings.dataEncryption ? 'Encrypted' : 'Not Encrypted'}
                        </Text>
                        <Text fontSize="xs" color={COLORS.subtext}>{dataSettings.dataRetention} day retention</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color={COLORS.subtext} />
                </HStack>
              </Box>
            </Pressable>

            <Pressable onPress={onSecurityOpen}>
              <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="red.500">
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space={4} alignItems="center">
                    <Box p={3} bg="red.100" borderRadius="lg">
                      <Icon as={Ionicons} name="lock-closed" size="lg" color="red.500" />
                    </Box>
                    <VStack space={1}>
                      <Text fontSize="md" fontWeight="600" color={COLORS.text}>Security & Authentication</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>Access & protection</Text>
                      <HStack space={2} alignItems="center">
                        <Badge bg="green.500" borderRadius="md">
                          <Text fontSize="xs" color="white">Secured</Text>
                        </Badge>
                        <Text fontSize="xs" color={COLORS.subtext}>2FA Enabled</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Icon as={Ionicons} name="chevron-forward" size="sm" color={COLORS.subtext} />
                </HStack>
              </Box>
            </Pressable>
          </VStack>

          {/* App Preferences */}
          <Box bg="white" borderRadius="xl" p={4} shadow={2} borderLeftWidth={4} borderLeftColor="yellow.500">
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="600" color={COLORS.text}>App Preferences</Text>

              {/* Data Refresh */}
              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="500" color={COLORS.text}>Data Refresh Rate</Text>
                  <Text fontSize="sm" color={COLORS.subtext}>{dataRefreshRate} seconds</Text>
                </HStack>
                <Slider
                  value={dataRefreshRate}
                  onChange={setDataRefreshRate}
                  minValue={5}
                  maxValue={120}
                  step={5}
                  colorScheme="green"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
                <HStack justifyContent="space-between">
                  <Text fontSize="xs" color={COLORS.subtext}>5s (Fast)</Text>
                  <Text fontSize="xs" color={COLORS.subtext}>120s (Saver)</Text>
                </HStack>
              </VStack>

              {/* Alert Sensitivity */}
              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="500" color={COLORS.text}>Alert Sensitivity</Text>
                  <Text fontSize="sm" color={COLORS.subtext}>
                    {['Low', 'Medium', 'High', 'Critical Only'][alertSensitivity]}
                  </Text>
                </HStack>
                <Slider
                  value={alertSensitivity}
                  onChange={setAlertSensitivity}
                  minValue={0}
                  maxValue={3}
                  step={1}
                  colorScheme="orange"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
              </VStack>

              {/* Units */}
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Unit Preferences</Text>
                <HStack space={3}>
                  <VStack flex={1} space={2}>
                    <Text fontSize="xs" color={COLORS.subtext}>Temperature</Text>
                    <Select
                      selectedValue={temperatureUnit}
                      onValueChange={setTemperatureUnit}
                      _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                    >
                      <Select.Item label="Celsius" value="celsius" />
                      <Select.Item label="Fahrenheit" value="fahrenheit" />
                      <Select.Item label="Kelvin" value="kelvin" />
                    </Select>
                  </VStack>
                  <VStack flex={1} space={2}>
                    <Text fontSize="xs" color={COLORS.subtext}>Distance</Text>
                    <Select
                      selectedValue={distanceUnit}
                      onValueChange={setDistanceUnit}
                      _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                    >
                      <Select.Item label="Miles" value="miles" />
                      <Select.Item label="Kilometers" value="kilometers" />
                      <Select.Item label="Nautical Miles" value="nautical" />
                    </Select>
                  </VStack>
                </HStack>
                <HStack space={3}>
                  <VStack flex={1} space={2}>
                    <Text fontSize="xs" color={COLORS.subtext}>Fuel</Text>
                    <Select
                      selectedValue={fuelUnit}
                      onValueChange={setFuelUnit}
                      _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                    >
                      <Select.Item label="Gallons" value="gallons" />
                      <Select.Item label="Liters" value="liters" />
                      <Select.Item label="Imperial Gallons" value="imperial" />
                    </Select>
                  </VStack>
                  <VStack flex={1} space={2}>
                    <Text fontSize="xs" color={COLORS.subtext}>Map Provider</Text>
                    <Select
                      selectedValue={mapProvider}
                      onValueChange={setMapProvider}
                      _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                    >
                      <Select.Item label="Google Maps" value="google" />
                      <Select.Item label="Apple Maps" value="apple" />
                      <Select.Item label="OpenStreetMap" value="osm" />
                    </Select>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Support & About */}
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>Support & Information</Text>
            <HStack space={3}>
              <Pressable flex={1} onPress={onAboutOpen}>
                <Box bg="white" borderRadius="xl" p={4} shadow={2} alignItems="center">
                  <Icon as={Ionicons} name="information-circle" size="lg" color="blue.500" mb={2} />
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>About</Text>
                  <Text fontSize="xs" color={COLORS.subtext} textAlign="center">App info & version</Text>
                </Box>
              </Pressable>
              <Box flex={1} bg="white" borderRadius="xl" p={4} shadow={2} alignItems="center">
                <Icon as={Ionicons} name="help-circle" size="lg" color="green.500" mb={2} />
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Help</Text>
                <Text fontSize="xs" color={COLORS.subtext} textAlign="center">Documentation</Text>
              </Box>
              <Box flex={1} bg="white" borderRadius="xl" p={4} shadow={2} alignItems="center">
                <Icon as={Ionicons} name="chatbubble" size="lg" color="purple.500" mb={2} />
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Support</Text>
                <Text fontSize="xs" color={COLORS.subtext} textAlign="center">Contact us</Text>
              </Box>
            </HStack>
          </VStack>

          {/* Danger Zone */}
          <Box bg="red.50" borderRadius="xl" p={4} shadow={2} borderWidth={1} borderColor="red.200">
            <VStack space={4}>
              <HStack alignItems="center" space={2}>
                <Icon as={Ionicons} name="warning" size="sm" color="red.500" />
                <Text fontSize="lg" fontWeight="600" color="red.700">Danger Zone</Text>
              </HStack>
              <VStack space={3}>
                <Button
                  variant="outline"
                  borderColor="red.500"
                  _text={{ color: 'red.500' }}
                  leftIcon={<Icon as={Ionicons} name="refresh" size="sm" color="red.500" />}
                  onPress={onResetOpen}
                >
                  Reset All Settings
                </Button>
                <Button
                  variant="outline"
                  borderColor="orange.500"
                  _text={{ color: 'orange.500' }}
                  leftIcon={<Icon as={Ionicons} name="trash" size="sm" color="orange.500" />}
                >
                  Clear All Data
                </Button>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Profile Modal */}
      <Modal isOpen={isProfileOpen} onClose={onProfileClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Profile & Account Settings</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Center>
                <Avatar size="xl" bg={COLORS.primary} source={userProfile.avatar ? { uri: userProfile.avatar } : null}>
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Button size="sm" variant="outline" mt={2}>Change Photo</Button>
              </Center>
              <FormControl>
                <FormControl.Label>Full Name</FormControl.Label>
                <Input defaultValue={userProfile.name} />
              </FormControl>
              <FormControl>
                <FormControl.Label>Email Address</FormControl.Label>
                <Input defaultValue={userProfile.email} />
              </FormControl>
              <FormControl>
                <FormControl.Label>Employee ID</FormControl.Label>
                <Input defaultValue={userProfile.employeeId} isReadOnly />
              </FormControl>
              <FormControl>
                <FormControl.Label>Role</FormControl.Label>
                <Input defaultValue={userProfile.role} isReadOnly />
              </FormControl>
              <FormControl>
                <FormControl.Label>Department</FormControl.Label>
                <Input defaultValue={userProfile.department} isReadOnly />
              </FormControl>
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Account Information</Text>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={COLORS.subtext}>Account Created</Text>
                  <Text fontSize="sm" color={COLORS.text}>{userProfile.accountCreated.toLocaleDateString()}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={COLORS.subtext}>Last Login</Text>
                  <Text fontSize="sm" color={COLORS.text}>{userProfile.lastLogin.toLocaleString()}</Text>
                </HStack>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={onProfileClose}>Cancel</Button>
              <Button bg={COLORS.primary} onPress={onProfileClose}>Save Changes</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* OBD Modal */}
      <Modal isOpen={isOBDOpen} onClose={onOBDClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>OBD Configuration</Modal.Header>
          <Modal.Body>
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space={4}>
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Connection Settings</Text>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={COLORS.text}>Auto-Connect</Text>
                    <Switch
                      isChecked={obdSettings.autoConnect}
                      onToggle={(v) => setObdSettings({ ...obdSettings, autoConnect: v })}
                      colorScheme="green"
                    />
                  </HStack>
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.text}>Scan Interval</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>{obdSettings.scanInterval} s</Text>
                    </HStack>
                    <Slider
                      value={obdSettings.scanInterval}
                      onChange={(v) => setObdSettings({ ...obdSettings, scanInterval: v })}
                      minValue={1}
                      maxValue={30}
                      step={1}
                      colorScheme="purple"
                    >
                      <Slider.Track><Slider.FilledTrack /></Slider.Track>
                      <Slider.Thumb />
                    </Slider>
                  </VStack>
                  <FormControl>
                    <FormControl.Label>Diagnostic Level</FormControl.Label>
                    <Select
                      selectedValue={obdSettings.diagnosticLevel}
                      onValueChange={(v) => setObdSettings({ ...obdSettings, diagnosticLevel: v })}
                      _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                    >
                      <Select.Item label="Basic" value="basic" />
                      <Select.Item label="Standard" value="standard" />
                      <Select.Item label="Detailed" value="detailed" />
                      <Select.Item label="Expert" value="expert" />
                    </Select>
                  </FormControl>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={COLORS.text}>Data Compression</Text>
                    <Switch
                      isChecked={obdSettings.dataCompression}
                      onToggle={(v) => setObdSettings({ ...obdSettings, dataCompression: v })}
                      colorScheme="green"
                    />
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={COLORS.text}>Predictive Analysis</Text>
                    <Switch
                      isChecked={obdSettings.predictiveAnalysis}
                      onToggle={(v) => setObdSettings({ ...obdSettings, predictiveAnalysis: v })}
                      colorScheme="green"
                    />
                  </HStack>
                </VStack>

                <Divider />

                {/* Thresholds */}
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Alert Thresholds</Text>
                  {[
                    {
                      key: 'engineTemp',
                      label: 'Engine Temperature',
                      min: 180, max: 250, step: 5, unit: '°F', color: 'red'
                    },
                    {
                      key: 'oilPressure',
                      label: 'Oil Pressure',
                      min: 5, max: 50, step: 1, unit: ' PSI', color: 'orange'
                    },
                    {
                      key: 'batteryVoltage',
                      label: 'Battery Voltage',
                      min: 10, max: 15, step: 0.1, unit: 'V', color: 'blue'
                    },
                    {
                      key: 'fuelLevel',
                      label: 'Fuel Level',
                      min: 5, max: 25, step: 1, unit: '%', color: 'yellow'
                    }
                  ].map(t => (
                    <VStack key={t.key} space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.text}>{t.label}</Text>
                        <Text fontSize="sm" color={COLORS.subtext}>
                          {obdSettings.alertThresholds[t.key]}{t.unit}
                        </Text>
                      </HStack>
                      <Slider
                        value={obdSettings.alertThresholds[t.key]}
                        minValue={t.min}
                        maxValue={t.max}
                        step={t.step}
                        colorScheme={t.color}
                        onChange={(v) =>
                          setObdSettings({
                            ...obdSettings,
                            alertThresholds: { ...obdSettings.alertThresholds, [t.key]: v }
                          })
                        }
                      >
                        <Slider.Track><Slider.FilledTrack /></Slider.Track>
                        <Slider.Thumb />
                      </Slider>
                    </VStack>
                  ))}
                </VStack>

                <Divider />

                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Supported Protocols</Text>
                  <VStack space={2}>
                    {obdSettings.supportedProtocols.map(p => (
                      <HStack key={p} justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.text}>{p}</Text>
                        <Icon as={Ionicons} name="checkmark-circle" size="sm" color="green.500" />
                      </HStack>
                    ))}
                  </VStack>
                </VStack>

                <Box bg="blue.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <Text fontSize="sm" fontWeight="600" color="blue.700">Connection Status</Text>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color="blue.600">Connected Devices</Text>
                      <Text fontSize="sm" color="blue.600" fontWeight="600">{obdSettings.connectedDevices}</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color="blue.600">Last Diagnostic</Text>
                      <Text fontSize="sm" color="blue.600">{obdSettings.lastDiagnostic.toLocaleString()}</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={onOBDClose}>Cancel</Button>
              <Button bg={COLORS.primary} onPress={onOBDClose}>Save Settings</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* GPS Modal */}
      <Modal isOpen={isGPSOpen} onClose={onGPSClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>GPS & Location Settings</Modal.Header>
          <Modal.Body>
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space={4}>
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Tracking Configuration</Text>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={COLORS.text}>GPS Tracking</Text>
                    <Switch
                      isChecked={gpsSettings.trackingEnabled}
                      onToggle={(v) => setGpsSettings({ ...gpsSettings, trackingEnabled: v })}
                      colorScheme="green"
                    />
                  </HStack>
                  <FormControl>
                    <FormControl.Label>Accuracy Level</FormControl.Label>
                    <Select
                      selectedValue={gpsSettings.accuracy}
                      onValueChange={(v) => setGpsSettings({ ...gpsSettings, accuracy: v })}
                      _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                    >
                      <Select.Item label="Low (Battery Saver)" value="low" />
                      <Select.Item label="Medium (Balanced)" value="medium" />
                      <Select.Item label="High (Best Accuracy)" value="high" />
                      <Select.Item label="Very High (GPS Only)" value="very_high" />
                    </Select>
                  </FormControl>
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.text}>Update Interval</Text>
                      <Text fontSize="sm" color={COLORS.subtext}>{gpsSettings.updateInterval} s</Text>
                    </HStack>
                    <Slider
                      value={gpsSettings.updateInterval}
                      minValue={1}
                      maxValue={60}
                      step={1}
                      colorScheme="blue"
                      onChange={(v) => setGpsSettings({ ...gpsSettings, updateInterval: v })}
                    >
                      <Slider.Track><Slider.FilledTrack /></Slider.Track>
                      <Slider.Thumb />
                    </Slider>
                  </VStack>
                  {[
                    { key: 'geofencing', label: 'Geofencing' },
                    { key: 'routeOptimization', label: 'Route Optimization' },
                    { key: 'offlineMapping', label: 'Offline Mapping' }
                  ].map(opt => (
                    <HStack key={opt.key} justifyContent="space-between">
                      <Text fontSize="sm" color={COLORS.text}>{opt.label}</Text>
                      <Switch
                        isChecked={gpsSettings[opt.key]}
                        onToggle={(v) => setGpsSettings({ ...gpsSettings, [opt.key]: v })}
                        colorScheme="green"
                      />
                    </HStack>
                  ))}
                </VStack>

                <Divider />

                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="600" color={COLORS.text}>GPS Status & Performance</Text>
                  <Box bg="green.50" p={3} borderRadius="lg">
                    <VStack space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="green.700">Signal Strength</Text>
                        <HStack alignItems="center" space={2}>
                          <Circle size="6px" bg={getSignalStrengthColor(gpsSettings.signalStrength)} />
                          <Text fontSize="sm" color="green.700" fontWeight="600">
                            {gpsSettings.signalStrength}
                          </Text>
                        </HStack>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="green.700">Satellites in View</Text>
                        <Text fontSize="sm" color="green.700" fontWeight="600">{gpsSettings.satelliteCount}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="green.700">Last GPS Fix</Text>
                        <Text fontSize="sm" color="green.700">{gpsSettings.lastFix.toLocaleTimeString()}</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="green.700">Current Location</Text>
                        <Text fontSize="sm" color="green.700">
                          {gpsSettings.coordinates.lat.toFixed(4)}, {gpsSettings.coordinates.lng.toFixed(4)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                  <Progress value={85} colorScheme="green" size="sm" />
                  <Text fontSize="xs" color="green.600" textAlign="center">
                    GPS performance excellent with {gpsSettings.satelliteCount} satellites
                  </Text>
                </VStack>
              </VStack>
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={onGPSClose}>Cancel</Button>
              <Button bg={COLORS.primary} onPress={onGPSClose}>Save Settings</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Data & Privacy */}
      <Modal isOpen={isDataOpen} onClose={onDataClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
            <Modal.Header>Data & Privacy Settings</Modal.Header>
            <Modal.Body>
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack space={4}>
                  <VStack space={3}>
                    <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Data Management</Text>
                    <VStack space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color={COLORS.text}>Data Retention Period</Text>
                        <Text fontSize="sm" color={COLORS.subtext}>{dataSettings.dataRetention} days</Text>
                      </HStack>
                      <Slider
                        value={dataSettings.dataRetention}
                        onChange={(v) => setDataSettings({ ...dataSettings, dataRetention: v })}
                        minValue={30}
                        maxValue={365}
                        step={30}
                        colorScheme="orange"
                      >
                        <Slider.Track><Slider.FilledTrack /></Slider.Track>
                        <Slider.Thumb />
                      </Slider>
                    </VStack>
                    {[
                      {
                        key: 'autoBackup',
                        label: 'Auto Backup',
                        desc: 'Automatically backup OBD and GPS data'
                      },
                      {
                        key: 'cloudSync',
                        label: 'Cloud Sync',
                        desc: 'Sync data across devices'
                      },
                      {
                        key: 'dataEncryption',
                        label: 'Data Encryption',
                        desc: 'Encrypt all stored data'
                      }
                    ].map(item => (
                      <HStack key={item.key} justifyContent="space-between" alignItems="center">
                        <VStack flex={1}>
                          <Text fontSize="sm" color={COLORS.text}>{item.label}</Text>
                          <Text fontSize="xs" color={COLORS.subtext}>{item.desc}</Text>
                        </VStack>
                        <Switch
                          isChecked={dataSettings[item.key]}
                          onToggle={(v) => setDataSettings({ ...dataSettings, [item.key]: v })}
                          colorScheme="green"
                        />
                      </HStack>
                    ))}
                  </VStack>

                  <Divider />

                  <VStack space={3}>
                    <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Privacy Controls</Text>
                    {[
                      {
                        key: 'anonymousAnalytics',
                        label: 'Anonymous Analytics',
                        desc: 'Help improve app with usage data'
                      },
                      {
                        key: 'locationHistory',
                        label: 'Location History',
                        desc: 'Store GPS location history'
                      }
                    ].map(item => (
                      <HStack key={item.key} justifyContent="space-between" alignItems="center">
                        <VStack flex={1}>
                          <Text fontSize="sm" color={COLORS.text}>{item.label}</Text>
                          <Text fontSize="xs" color={COLORS.subtext}>{item.desc}</Text>
                        </VStack>
                        <Switch
                          isChecked={dataSettings[item.key]}
                          onToggle={(v) => setDataSettings({ ...dataSettings, [item.key]: v })}
                          colorScheme="green"
                        />
                      </HStack>
                    ))}
                    <FormControl>
                      <FormControl.Label>Data Export Format</FormControl.Label>
                      <Select
                        selectedValue={dataSettings.dataExportFormat}
                        onValueChange={(v) => setDataSettings({ ...dataSettings, dataExportFormat: v })}
                        _selectedItem={{ bg: COLORS.primary, endIcon: <CheckIcon size="4" /> }}
                      >
                        <Select.Item label="CSV" value="csv" />
                        <Select.Item label="Excel" value="excel" />
                        <Select.Item label="JSON" value="json" />
                        <Select.Item label="PDF" value="pdf" />
                      </Select>
                    </FormControl>
                  </VStack>

                  <Box bg="blue.50" p={3} borderRadius="lg">
                    <VStack space={2}>
                      <Text fontSize="sm" fontWeight="600" color="blue.700">Storage Usage Summary</Text>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="blue.600">OBD Data</Text>
                        <Text fontSize="sm" color="blue.600">1.2GB</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="blue.600">GPS Tracks</Text>
                        <Text fontSize="sm" color="blue.600">0.8GB</Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" color="blue.600">App Data</Text>
                        <Text fontSize="sm" color="blue.600">0.3GB</Text>
                      </HStack>
                      <Progress value={getStoragePercentage()} colorScheme="blue" size="sm" />
                    </VStack>
                  </Box>
                </VStack>
              </ScrollView>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" onPress={onDataClose}>Cancel</Button>
                <Button bg={COLORS.primary} onPress={onDataClose}>Save Settings</Button>
              </Button.Group>
            </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Security Modal */}
      <Modal isOpen={isSecurityOpen} onClose={onSecurityClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>Security & Authentication</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Authentication Methods</Text>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color={COLORS.text}>Two-Factor Authentication</Text>
                    <Text fontSize="xs" color={securitySettings.twoFactorEnabled ? 'green.500' : 'red.500'} fontWeight="500">
                      {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={securitySettings.twoFactorEnabled}
                    onToggle={(v) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: v })}
                    colorScheme="green"
                  />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color={COLORS.text}>Biometric Login</Text>
                    <Text fontSize="xs" color={COLORS.subtext}>Fingerprint or Face ID</Text>
                  </VStack>
                  <Switch
                    isChecked={securitySettings.biometricEnabled}
                    onToggle={(v) => setSecuritySettings({ ...securitySettings, biometricEnabled: v })}
                    colorScheme="green"
                  />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color={COLORS.text}>Auto-Lock</Text>
                    <Text fontSize="xs" color={COLORS.subtext}>Lock app when inactive</Text>
                  </VStack>
                  <Switch
                    isChecked={securitySettings.autoLock}
                    onToggle={(v) => setSecuritySettings({ ...securitySettings, autoLock: v })}
                    colorScheme="green"
                  />
                </HStack>
              </VStack>

              <Divider />

              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>Device Security</Text>
                <Box bg="green.50" p={3} borderRadius="lg">
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color="green.700">Security Status</Text>
                      <Badge bg="green.500" borderRadius="md"><Text fontSize="xs" color="white">Secured</Text></Badge>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color="green.700">Last Security Scan</Text>
                      <Text fontSize="sm" color="green.700">2 hours ago</Text>
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="sm" color="green.700">Threats Detected</Text>
                      <Text fontSize="sm" color="green.700">0</Text>
                    </HStack>
                  </VStack>
                </Box>
                <Button variant="outline" colorScheme="blue" leftIcon={<Icon as={Ionicons} name="scan" size="sm" color="blue.500" />}>
                  Run Security Scan
                </Button>
              </VStack>

              <Divider />

              <VStack space={3}>
                <Text fontSize="sm" fontWeight="600" color={COLORS.text}>OBD Security Settings</Text>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color={COLORS.text}>Secure OBD Connection</Text>
                    <Text fontSize="xs" color={COLORS.subtext}>Encrypt OBD communication</Text>
                  </VStack>
                  <Switch
                    isChecked={securitySettings.secureObd}
                    onToggle={(v) => setSecuritySettings({ ...securitySettings, secureObd: v })}
                    colorScheme="green"
                  />
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" color={COLORS.text}>Device Verification</Text>
                    <Text fontSize="xs" color={COLORS.subtext}>Verify OBD device identity</Text>
                  </VStack>
                  <Switch
                    isChecked={securitySettings.deviceVerification}
                    onToggle={(v) => setSecuritySettings({ ...securitySettings, deviceVerification: v })}
                    colorScheme="green"
                  />
                </HStack>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={onSecurityClose}>Cancel</Button>
              <Button bg={COLORS.primary} onPress={onSecurityClose}>Save Settings</Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* About Modal */}
      <Modal isOpen={isAboutOpen} onClose={onAboutClose} size="lg">
        <Modal.Content maxWidth="500px">
          <Modal.CloseButton />
          <Modal.Header>About TransTech VTracking</Modal.Header>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <Box p={4} bg={COLORS.primary + '.100'} borderRadius="full">
                <Icon as={Ionicons} name="car-sport" size="2xl" color={COLORS.primary} />
              </Box>
              <VStack space={2} alignItems="center">
                <Text fontSize="xl" fontWeight="700" color={COLORS.text}>TransTech VTracking</Text>
                <Text fontSize="sm" color={COLORS.subtext} textAlign="center">
                  Professional Fleet Management & OBD Diagnostics
                </Text>
              </VStack>
              <VStack space={2} w="100%">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={COLORS.subtext}>Version</Text>
                  <Text fontSize="sm" color={COLORS.text}>{systemInfo.appVersion}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={COLORS.subtext}>Build</Text>
                  <Text fontSize="sm" color={COLORS.text}>{systemInfo.buildNumber}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={COLORS.subtext}>OBD Firmware</Text>
                  <Text fontSize="sm" color={COLORS.text}>{systemInfo.obdFirmware}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={COLORS.subtext}>Last Update</Text>
                  <Text fontSize="sm" color={COLORS.text}>{systemInfo.lastUpdate.toLocaleDateString()}</Text>
                </HStack>
              </VStack>
              <VStack space={1} w="100%">
                {[
                  'Real-time OBD diagnostics',
                  'GPS tracking & geofencing',
                  'Predictive maintenance',
                  'Fleet performance analytics'
                ].map(f => (
                  <HStack key={f} alignItems="center" space={2}>
                    <Icon as={Ionicons} name="checkmark-circle" size="sm" color="green.500" />
                    <Text fontSize="sm" color={COLORS.text}>{f}</Text>
                  </HStack>
                ))}
              </VStack>
              <Button variant="outline" colorScheme="blue" leftIcon={<Icon as={Ionicons} name="download" size="sm" color="blue.500" />}>
                Check for Updates
              </Button>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button bg={COLORS.primary} onPress={onAboutClose}>Close</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Reset Dialog */}
      <AlertDialog isOpen={isResetOpen} onClose={onResetClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Reset Settings</AlertDialog.Header>
          <AlertDialog.Body>
            This will reset all settings to their default values. This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" onPress={onResetClose}>Cancel</Button>
              <Button colorScheme="danger" onPress={handleResetSettings}>Reset</Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
}