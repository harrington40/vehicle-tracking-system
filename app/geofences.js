import React from 'react';
import { Box, Text, VStack, HStack, Icon, Pressable } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';

export default function GeofencesPage() {
  const router = useRouter();
  
  return (
    <Box flex={1} bg="gray.50" p={4}>
      <VStack space={4}>
        <HStack alignItems="center" space={3}>
          <Pressable onPress={() => router.back()}>
            <Icon as={Ionicons} name="arrow-back" size="lg" color={COLORS.text} />
          </Pressable>
          <Text fontSize="2xl" fontWeight="600" color={COLORS.text}>
            Geofences
          </Text>
        </HStack>
        
        <Box bg="white" p={6} borderRadius="xl" shadow={1}>
          <VStack space={3} alignItems="center">
            <Icon as={Ionicons} name="radio-button-on" size="6xl" color={COLORS.primary} />
            <Text fontSize="lg" fontWeight="600" color={COLORS.text}>
              Geofence Management
            </Text>
            <Text fontSize="sm" color={COLORS.subtext} textAlign="center">
              Create and manage virtual boundaries for your fleet.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}