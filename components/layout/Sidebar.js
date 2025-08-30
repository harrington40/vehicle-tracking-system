import React from "react";
import { Link, usePathname } from "expo-router";
import { Box, VStack, HStack, Text, Icon, Pressable, Badge, Divider } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useLayout } from "./LayoutContext";

// Updated navigation structure to match image
const NAV_SECTIONS = [
  {
    title: null, // Main navigation (no title)
    items: [
      { href: "/", label: "Dashboard", icon: "home-outline" },
      { href: "/ecommerce", label: "eCommerce", icon: "cart-outline" },
    ]
  },
  {
    title: "UI ELEMENTS",
    items: [
      { href: "/cards", label: "Cards", icon: "card-outline" },
      { href: "/ecommerce", label: "eCommerce", icon: "cart-outline" },
      { href: "/components", label: "Components", icon: "cube-outline" },
      { href: "/icons", label: "Icons", icon: "color-palette-outline" },
    ]
  },
  {
    title: "FORMS & TABLES",
    items: [
      { href: "/forms", label: "Forms", icon: "document-text-outline" },
      { href: "/tables", label: "Tables", icon: "grid-outline" },
      { href: "/apps", label: "Apps", icon: "apps-outline" },
    ]
  },
  {
    title: "PAGES",
    items: [
      { href: "/authentication", label: "Authentication", icon: "lock-closed-outline" },
      { href: "/user-profile", label: "User Profile", icon: "person-outline" },
      { href: "/timeline", label: "Timeline", icon: "time-outline" },
      { href: "/pages", label: "Pages", icon: "document-outline" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useLayout?.() || { collapsed: false };

  const W = collapsed ? "80px" : "240px";

  return (
    <Box 
      w={W} 
      bg="#262932" // Dark background to match image
      safeAreaBottom 
      h="100%"
    >
      {/* Brand */}
      <Box px={collapsed ? 2 : 4} py={4}>
        <HStack alignItems="center" space={3}>
          <Icon as={Ionicons} name="analytics" color="#7366ff" size="lg" />
          {!collapsed && (
            <Text fontSize="lg" fontWeight="bold" color="white">
              Metoxi
            </Text>
          )}
        </HStack>
      </Box>

      {/* Nav Sections */}
      <Box 
        flex={1}
        overflow="auto" // Enable scrolling for long menus
        py={2}
      >
        {NAV_SECTIONS.map((section, sIndex) => (
          <VStack key={sIndex} mt={sIndex > 0 ? 6 : 2} space={1} px={collapsed ? 2 : 2}>
            {/* Section Title */}
            {section.title && !collapsed && (
              <Text 
                fontSize="xs" 
                fontWeight="medium" 
                color="gray.500"
                px={3}
                py={1}
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
                    py={2.5}
                    borderRadius="lg"
                    bg={active ? "rgba(115, 102, 255, 0.1)" : "transparent"}
                    _pressed={{ bg: active ? "rgba(115, 102, 255, 0.2)" : "rgba(255, 255, 255, 0.05)" }}
                  >
                    <HStack alignItems="center" space={collapsed ? 0 : 3} justifyContent={collapsed ? "center" : "flex-start"}>
                      <Icon 
                        as={Ionicons} 
                        name={item.icon} 
                        size="sm" 
                        color={active ? "#7366ff" : "#adb5bd"} 
                      />
                      {!collapsed && (
                        <Text 
                          fontWeight={active ? "semibold" : "normal"} 
                          color={active ? "#7366ff" : "#adb5bd"}
                        >
                          {item.label}
                        </Text>
                      )}
                      {item.badge && !collapsed && (
                        <Badge ml="auto" bg="#7366ff" rounded="full" _text={{ fontSize: 10, fontWeight: "bold" }}>
                          {item.badge}
                        </Badge>
                      )}
                    </HStack>
                  </Pressable>
                </Link>
              );
            })}
          </VStack>
        ))}
      </Box>

      {/* Bottom theme toggle */}
      <Box px={collapsed ? 2 : 3} py={4} borderTopWidth={1} borderTopColor="rgba(255,255,255,0.1)">
        <HStack justifyContent="space-between" px={collapsed ? 0 : 2}>
          <Pressable p={2} borderRadius="full">
            <Icon as={Ionicons} name="moon-outline" color="#adb5bd" size="sm" />
          </Pressable>
          
          {!collapsed && (
            <HStack space={3}>
              <Pressable p={2} borderRadius="full">
                <Icon as={Ionicons} name="flag-outline" color="#adb5bd" size="sm" />
              </Pressable>
              <Pressable p={2} borderRadius="full">
                <Icon as={Ionicons} name="help-circle-outline" color="#adb5bd" size="sm" />
              </Pressable>
            </HStack>
          )}
        </HStack>
      </Box>
    </Box>
  );
}