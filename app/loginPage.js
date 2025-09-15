import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/authContext';
import {
  Box, VStack, HStack, Text, Input, Button, Icon,
  Pressable, KeyboardAvoidingView, ScrollView, Image
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local date/time (updates every minute)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const city = tz.split('/').pop()?.replace(/_/g, ' ') || 'Local';

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email.trim(), form.password);
      } else {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      }
      router.replace('/index.js');
    } catch (e) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Palette (green & white)
  const PRIMARY = 'green.600';
  const PRIMARY_LIGHT = 'green.100';
  const PRIMARY_DARK = 'green.900';
  const PRIMARY_BORDER = 'green.500';

  return (
    <KeyboardAvoidingView flex={1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <HStack flex={1}>
        {/* Left: Form (White) */}
        <Box flex={1} bg="white" px={8} py={10}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={8}>
              <VStack space={2}>
                <HStack space={2} alignItems="center" justifyContent="space-between">
                  <HStack space={2} alignItems="center">
                    <Icon as={Ionicons} name="car-sport" size="lg" color={PRIMARY} />
                    <Text fontSize="2xl" fontWeight="800" color={PRIMARY}>VTrack Access</Text>
                  </HStack>
                  <HStack space={2} alignItems="center">
                    <Icon as={Ionicons} name="time-outline" size="sm" color="gray.500" />
                    <Text fontSize="2xs" color="gray.500">
                      {city}: {timeStr} • {dateStr}
                    </Text>
                  </HStack>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Secure telematics portal. OBD + GPS + Fleet Intelligence.
                </Text>
              </VStack>

              <HStack space={4}>
                {['login', 'register'].map(tab => {
                  const active = mode === tab;
                  return (
                    <Pressable key={tab} onPress={() => setMode(tab)} flex={1}>
                      <VStack
                        py={3}
                        borderBottomWidth={3}
                        borderColor={active ? PRIMARY_BORDER : 'gray.200'}
                        alignItems="center"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color={active ? PRIMARY : 'gray.500'}
                        >
                          {tab === 'login' ? 'Login' : 'Register'}
                        </Text>
                      </VStack>
                    </Pressable>
                  );
                })}
              </HStack>

              <VStack space={4}>
                {mode === 'register' && (
                  <VStack space={2}>
                    <Text fontSize="xs" fontWeight="600" color="gray.600">Full Name</Text>
                    <Input
                      value={form.name}
                      onChangeText={(v) => setForm({ ...form, name: v })}
                      placeholder="Jane Doe"
                      borderColor="gray.200"
                      _focus={{ borderColor: PRIMARY_BORDER }}
                    />
                  </VStack>
                )}
                <VStack space={2}>
                  <Text fontSize="xs" fontWeight="600" color="gray.600">Email</Text>
                  <Input
                    value={form.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(v) => setForm({ ...form, email: v })}
                    placeholder="fleet@company.com"
                    borderColor="gray.200"
                    _focus={{ borderColor: PRIMARY_BORDER }}
                  />
                </VStack>
                <VStack space={2}>
                  <Text fontSize="xs" fontWeight="600" color="gray.600">Password</Text>
                  <Input
                    value={form.password}
                    secureTextEntry
                    onChangeText={(v) => setForm({ ...form, password: v })}
                    placeholder="********"
                    borderColor="gray.200"
                    _focus={{ borderColor: PRIMARY_BORDER }}
                  />
                </VStack>

                {error ? (
                  <HStack bg="red.50" borderWidth={1} borderColor="red.200" p={3} borderRadius="md" space={2} alignItems="center">
                    <Icon as={Ionicons} name="alert-circle" size="sm" color="red.500" />
                    <Text fontSize="xs" color="red.600">{error}</Text>
                  </HStack>
                ) : null}

                <Button
                  mt={2}
                  isLoading={loading}
                  onPress={submit}
                  colorScheme="green"
                  leftIcon={<Icon as={Ionicons} name={mode === 'login' ? 'log-in' : 'person-add'} size="sm" />}
                >
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </Button>

                {mode === 'login' && (
                  <Pressable onPress={() => {}}>
                    <Text fontSize="xs" color={PRIMARY} textAlign="right">Forgot password?</Text>
                  </Pressable>
                )}
              </VStack>

              <VStack space={5}>
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="shield-checkmark" size="sm" color="green.500" />
                  <Text fontSize="xs" color="gray.500">
                    Encrypted device & session validation enabled.
                  </Text>
                </HStack>
                <Pressable onPress={() => router.replace('/')}>
                  <Text fontSize="xs" color="gray.500">Back to landing</Text>
                </Pressable>
              </VStack>
            </VStack>
          </ScrollView>
        </Box>

        {/* Right: Visual Panel (Green) */}
        <Box flex={1} bg={PRIMARY_DARK} px={8} py={10} display={{ base: 'none', md: 'flex' }}>
          <VStack space={8}>
            <VStack space={2}>
              <Text fontSize="xl" fontWeight="700" color="white">
                Unified Telematics Control
              </Text>
              <Text fontSize="xs" color={PRIMARY_LIGHT}>
                Real-time CAN bus diagnostics, live GPS telemetry, predictive events, and security posture at a glance.
              </Text>
            </VStack>
            <Image
              alt="Dashboard Preview"
              source={{ uri: 'https://via.placeholder.com/520x300.png?text=Fleet+Telemetry+Preview' }}
              borderRadius="lg"
              resizeMode="cover"
              w="100%"
              h={56}
            />
            <VStack space={4}>
              {[
                'Live engine metrics & DTC decoding',
                'Geofencing & route optimization',
                'Predictive maintenance AI',
                'Secure device verification & 2FA'
              ].map(i => (
                <HStack key={i} space={2}>
                  <Icon as={Ionicons} name="checkmark-circle" size="sm" color="green.400" />
                  <Text fontSize="xs" color={PRIMARY_LIGHT}>{i}</Text>
                </HStack>
              ))}
            </VStack>
            <Text fontSize="2xs" color="green.300">© {new Date().getFullYear()} VTrack Telematics</Text>
          </VStack>
        </Box>
      </HStack>
    </KeyboardAvoidingView>
  );
}