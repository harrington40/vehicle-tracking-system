import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider, Box, Spinner, Center } from "native-base";
import { nbTheme } from "../lib/nb-theme";
import { COLORS } from "../lib/theme";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { LayoutProvider } from "../components/layout/LayoutContext";
import { AuthProvider, useAuth } from "../lib/authContext";

// Inner layout that can use auth context
function AppShell() {
  const { loading, session } = useAuth(); // optional usage
  if (loading) {
    return (
      <Center flex={1} bg={COLORS.bg}>
        <Spinner size="lg" />
      </Center>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <Box flex={1} flexDirection="row" bg="bg.50">
        {/* Show sidebar only after auth load (can also hide when !session if desired) */}
        <Box w="240px" bg="white" borderRightWidth={1} borderRightColor="border.200">
          <Sidebar />
        </Box>
        <Box flex={1}>
          <Topbar />
          <Stack screenOptions={{ headerShown: false }} />
        </Box>
      </Box>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <NativeBaseProvider theme={nbTheme}>
          <StatusBar style="dark" backgroundColor={COLORS.background} />
          <AppShell />
        </NativeBaseProvider>
      </LayoutProvider>
    </AuthProvider>
  );
}