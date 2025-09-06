import React from "react";
import { Link, usePathname } from "expo-router";
import { Box, VStack, HStack, Text, Icon, Pressable, Badge, Divider } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useLayout } from "./LayoutContext";
import { COLORS } from "../../lib/theme";

// Updated navigation for vehicle tracking app
function buildSections(session) {
  if (!session) {
    return [
      {
        title: null,
        items: [
          { href: "/", label: "Landing", icon: "home-outline" },
          { href: "/login", label: "Login", icon: "log-in-outline" }
        ]
      }
    ];
  }
  return [
    {
      title: null,
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "speedometer-outline" },
        { href: "/vehicles", label: "Vehicles", icon: "car-outline", badge: "12" }
      ]
    },
    {
      title: "TRACKING",
      items: [
        { href: "/live-tracking", label: "Live Tracking", icon: "location-outline" },
        { href: "/routes", label: "Routes", icon: "map-outline" },
        { href: "/geofences", label: "Geofences", icon: "radio-button-on-outline" },
        { href: "/history", label: "Trip History", icon: "time-outline" }
      ]
    },
    {
      title: "FLEET MANAGEMENT",
      items: [
        { href: "/drivers", label: "Drivers", icon: "people-outline" },
        { href: "/maintenance", label: "Maintenance", icon: "build-outline" },
        { href: "/fuel", label: "Fuel Management", icon: "water-outline" },
        { href: "/reports", label: "Reports", icon: "document-text-outline" }
      ]
    },
    {
      title: "ALERTS & SETTINGS",
      items: [
        { href: "/alerts", label: "Alerts", icon: "notifications-outline", badge: "3" },
        { href: "/settings", label: "Settings", icon: "settings-outline" },
        { href: "/profilePage", label: "Manager", icon: "person-outline" },
        { href: "/user-management", label: "User Management", icon: "person-outline" },
        { href: "/billing", label: "Billing", icon: "card-outline" }
      ]
    }
  ];
}


export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useLayout?.() || { collapsed: false };
   const { session, logout } = useAuth();
  const sections = buildSections(session);

  const W = collapsed ? "80px" : "240px";

  // Convert hex colors to rgba for transparency effects
  const primaryWithOpacity = (opacity) => `rgba(139, 195, 74, ${opacity})`;
  const primaryDarkWithOpacity = (opacity) => `rgba(76, 175, 80, ${opacity})`;

  return (
    <Box 
      w={W} 
      bg="white" // Clean white background
      safeAreaBottom 
      h="100%"
      borderRightWidth={1}
      borderRightColor={COLORS.border}
    >
      {/* Brand */}
      <Box px={collapsed ? 2 : 4} py={6} borderBottomWidth={1} borderBottomColor={COLORS.border}>
        <HStack alignItems="center" space={3}>
          <Icon as={Ionicons} name="car-sport" color={COLORS.primary} size="lg" />
          {!collapsed && (
            <VStack space={0}>
              <Text fontSize="lg" fontWeight="bold" color={COLORS.text}>
                VTrack Pro
              </Text>
              <Text fontSize="xs" color={COLORS.subtext}>
                Fleet Management
              </Text>
            </VStack>
          )}
        </HStack>
      </Box>

      {/* Nav Sections */}
      <Box 
        flex={1}
        overflow="auto"
        py={4}
      >
        {NAV_SECTIONS.map((section, sIndex) => (
          <VStack key={sIndex} mt={sIndex > 0 ? 6 : 2} space={1} px={collapsed ? 2 : 2}>
            {/* Section Title */}
            {section.title && !collapsed && (
              <Text 
                fontSize="xs" 
                fontWeight="semibold" 
                color={COLORS.subtext}
                px={3}
                py={2}
                letterSpacing="0.5px"
              >
                {section.title}
              </Text>
            )}
            
            {/* Section Items */}
            {section.items.map((item) => {
              const active = pathname === item.href || (item.href === "/" && pathname === "/");
              return (
                <Link key={item.href} href={item.href} asChild>
                  <Pressable
                    mx={collapsed ? 1 : 2}
                    px={collapsed ? 0 : 3}
                    py={3}
                    borderRadius="xl"
                    bg={active ? primaryWithOpacity(0.1) : "transparent"}
                    _pressed={{ bg: active ? primaryWithOpacity(0.15) : COLORS.hover }}
                    _hover={{ bg: active ? primaryWithOpacity(0.15) : COLORS.hover }}
                    borderLeftWidth={active ? 3 : 0}
                    borderLeftColor={active ? COLORS.primary : "transparent"}
                  >
                    <HStack alignItems="center" space={collapsed ? 0 : 3} justifyContent={collapsed ? "center" : "flex-start"}>
                      <Icon 
                        as={Ionicons} 
                        name={item.icon} 
                        size="md" 
                        color={active ? COLORS.primary : COLORS.subtext} 
                      />
                      {!collapsed && (
                        <>
                          <Text 
                            fontWeight={active ? "semibold" : "medium"} 
                            color={active ? COLORS.primary : COLORS.text}
                            fontSize="sm"
                            flex={1}
                          >
                            {item.label}
                          </Text>
                          {item.badge && (
                            <Badge 
                              ml="auto" 
                              bg={COLORS.primary} 
                              rounded="full" 
                              _text={{ fontSize: 10, fontWeight: "bold", color: "white" }}
                              minW="20px"
                              h="20px"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </HStack>
                  </Pressable>
                </Link>
              );
            })}
          </VStack>
        ))}
      </Box>

      {/* Bottom User Section */}
      <Box px={collapsed ? 2 : 4} py={4} borderTopWidth={1} borderTopColor={COLORS.border}>
        {!collapsed ? (
          <VStack space={3}>
            {/* User Info */}
            <HStack alignItems="center" space={3}>
              <Box 
                w="36px" 
                h="36px" 
                bg={primaryWithOpacity(0.1)} 
                borderRadius="full" 
                alignItems="center" 
                justifyContent="center"
              >
                <Icon as={Ionicons} name="person" color={COLORS.primary} size="sm" />
              </Box>
              <VStack space={0} flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color={COLORS.text}>
                  Fleet Manager
                </Text>
                <Text fontSize="xs" color={COLORS.subtext}>
                  john.doe@company.com
                </Text>
              </VStack>
            </HStack>
            
            {/* Action Buttons */}
            <HStack justifyContent="space-between">
              <Pressable 
                p={2} 
                borderRadius="lg"
                _pressed={{ bg: COLORS.hover }}
              >
                <Icon as={Ionicons} name="moon-outline" color={COLORS.subtext} size="sm" />
              </Pressable>
              
              <Pressable 
                p={2} 
                borderRadius="lg"
                _pressed={{ bg: COLORS.hover }}
              >
                <Icon as={Ionicons} name="help-circle-outline" color={COLORS.subtext} size="sm" />
              </Pressable>
              
              <Pressable 
                p={2} 
                borderRadius="lg"
                _pressed={{ bg: COLORS.hover }}
              >
                <Icon as={Ionicons} name="log-out-outline" color={COLORS.subtext} size="sm" />
              </Pressable>
            </HStack>
          </VStack>
        ) : (
          // Collapsed view - just show user icon
          <Pressable 
            alignItems="center" 
            p={2}
            borderRadius="lg"
            _pressed={{ bg: COLORS.hover }}
          >
            <Box 
              w="32px" 
              h="32px" 
              bg={primaryWithOpacity(0.1)} 
              borderRadius="full" 
              alignItems="center" 
              justifyContent="center"
            >
              <Icon as={Ionicons} name="person" color={COLORS.primary} size="sm" />
            </Box>
          </Pressable>
        )}
      </Box>
    </Box>
  );
}