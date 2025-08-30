import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeBaseProvider, Box } from "native-base";
import { nbTheme } from "../lib/nb-theme";
import { COLORS } from "../lib/theme";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { LayoutProvider } from "../components/layout/LayoutContext";

export default function RootLayout() {
  return (
    <LayoutProvider>
      <NativeBaseProvider theme={nbTheme}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
          <Box flex={1} flexDirection="row" bg="bg.50">
            <Box w="240px" bg="white" borderRightWidth={1} borderRightColor="border.200">
              <Sidebar />
            </Box>
            <Box flex={1}>
              <Topbar />
              <Stack screenOptions={{ headerShown: false }} />
            </Box>
          </Box>
        </SafeAreaView>
      </NativeBaseProvider>
    </LayoutProvider>
  );
}
