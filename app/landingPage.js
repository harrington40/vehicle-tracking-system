import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/authContext';
import { Box, VStack, HStack, Text, Button, Icon, Image, ScrollView, Badge } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

export default function LandingPage() {
  const router = useRouter();
  const { session } = useAuth();

//  useEffect(() => {
//    if (session) router.replace('/dashboard');
//  }, [session]);

  return (
    <ScrollView bg="gray.50">
      <VStack space={10} px={6} py={10}>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={2} alignItems="center">
            <Icon as={Ionicons} name="car-sport" size="lg" color="blue.600" />
            <Text fontSize="xl" fontWeight="700" color="blue.700">VTrack Telematics</Text>
          </HStack>
          <HStack space={3}>
            <Button variant="ghost" onPress={() => router.push('/loginPage')}>Login</Button>
            <Button onPress={() => router.push('/loginPage')}>Get Started</Button>
          </HStack>
        </HStack>

        <VStack space={6}>
          <Text fontSize="3xl" fontWeight="800" color="gray.800">
            Real-time Fleet Intelligence & OBD Diagnostics
          </Text>
          <Text fontSize="md" color="gray.600">
            Monitor vehicles, predict maintenance, optimize routes, and secure assets with a unified telematics platform.
          </Text>
          <HStack space={4}>
            <Button flex={1} onPress={() => router.push('/ ')} leftIcon={<Icon as={Ionicons} name="log-in" size="sm" />}>
              Access Dashboard
            </Button>
            <Button flex={1} variant="outline" onPress={() => router.push('/loginPage')} leftIcon={<Icon as={Ionicons} name="analytics" size="sm" />}>
              Start Trial
            </Button>
          </HStack>
        </VStack>

        <HStack space={4} flexWrap="wrap">
          {[
            { icon: 'speedometer', label: 'Live OBD Data' },
            { icon: 'location', label: 'GPS Tracking' },
            { icon: 'construct', label: 'Predictive Maintenance' },
            { icon: 'shield-checkmark', label: 'Security & 2FA' }
          ].map(f => (
            <HStack key={f.label} bg="white" px={4} py={3} borderRadius="lg" space={3} alignItems="center" shadow={1}>
              <Icon as={Ionicons} name={f.icon} size="sm" color="blue.500" />
              <Text fontSize="xs" fontWeight="600" color="gray.700">{f.label}</Text>
            </HStack>
          ))}
        </HStack>

        <Box bg="white" p={5} borderRadius="2xl" shadow={2}>
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="700" color="gray.800">Why VTrack?</Text>
            <HStack space={6}>
              <VStack flex={1} space={4}>
                {[
                  { t: 'Unified Telemetry', d: 'OBD + GPS + diagnostics stream in one pane.' },
                  { t: 'Fleet Health Scoring', d: 'Proactive alerts on engine, battery, fuel anomalies.' },
                  { t: 'Route Optimization', d: 'Reduce fuel & time with smart routing.' },
                  { t: 'Secure Architecture', d: 'Encrypted channels & device verification.' }
                ].map(x => (
                  <VStack key={x.t} space={1}>
                    <HStack space={2} alignItems="center">
                      <Icon as={Ionicons} name="checkmark-circle" size="sm" color="green.500" />
                      <Text fontSize="sm" fontWeight="600" color="gray.700">{x.t}</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">{x.d}</Text>
                  </VStack>
                ))}
              </VStack>
              <VStack flex={1} space={3} alignItems="center">
                <Image
                  alt="OBD + GPS Visualization"
                  source={{ uri: 'https://via.placeholder.com/360x220.png?text=OBD+GPS+Dashboard' }}
                  borderRadius="lg"
                  resizeMode="cover"
                  w="100%"
                  h={40}
                />
                <Badge colorScheme="blue" borderRadius="md">Live Demo Snapshot</Badge>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        <Box alignItems="center">
          <Text fontSize="xs" color="gray.500">© {new Date().getFullYear()} VTrack Telematics</Text>
        </Box>
      </VStack>
    </ScrollView>
  );
}