import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { Box, VStack, HStack, Text, Icon, Badge, Button } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/authContext';

export default function Dashboard() {
  const { session, logout,loading } = useAuth();
  const router = useRouter();
  

  useEffect(() => {
    if (!loading && !session) router.replace("/loginPage");
  }, [loading, session, router]);


    if (loading || !session) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor:"#f5f7fa" }}>
        <Text style={{ color:"#64748b" }}>Authenticating...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fa' }} contentContainerStyle={{ padding: 16 }}>
      <VStack space={6}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <HStack space={2} alignItems="center">
              <Icon as={Ionicons} name="speedometer-outline" size="md" color="blue.600" />
              <Text fontSize="2xl" fontWeight="700" color="gray.800">Fleet Dashboard</Text>
              <Badge colorScheme="blue" ml={2}>Live</Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500">
              {session.user.email} • {session.user.role}
            </Text>
          </VStack>
          <Button
            variant="outline"
            size="sm"
            onPress={logout}
            leftIcon={<Icon as={Ionicons} name="log-out-outline" size="xs" />}
          >
            Logout
          </Button>
        </HStack>

        <HStack space={4} flexWrap="wrap">
          {[
            { label: 'Active Vehicles', value: 42, icon: 'car-outline', color: 'emerald.500' },
            { label: 'Alerts (24h)', value: 5, icon: 'alert-circle-outline', color: 'red.500' },
            { label: 'Open Maint.', value: 3, icon: 'build-outline', color: 'amber.500' },
            { label: 'Avg Fuel Eff.', value: '24.1 MPG', icon: 'speedometer-outline', color: 'blue.500' }
          ].map(k => (
            <Box
              key={k.label}
              bg="white"
              p={4}
              borderRadius="xl"
              shadow={1}
              flex={1}
              minW="45%"
              maxW="48%"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack space={1}>
                  <Text fontSize="xs" color="gray.500">{k.label}</Text>
                  <Text fontSize="lg" fontWeight="700" color="gray.800">{k.value}</Text>
                </VStack>
                <Box
                  bg="gray.100"
                  w={10}
                  h={10}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={Ionicons} name={k.icon} size="sm" color={k.color} />
                </Box>
              </HStack>
            </Box>
          ))}
        </HStack>

        <Box bg="white" p={5} borderRadius="xl" shadow={1}>
          <HStack mb={3} alignItems="center" space={2}>
            <Icon as={Ionicons} name="map-outline" size="sm" color="blue.500" />
            <Text fontSize="md" fontWeight="600">Live Vehicle Map (Placeholder)</Text>
          </HStack>
          <Box
            bg="gray.100"
            borderRadius="lg"
            h={180}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" color="gray.500">
              Map placeholder – integrate MapView later
            </Text>
          </Box>
        </Box>
      </VStack>
    </ScrollView>
  );
}