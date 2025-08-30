import React from "react";
import { Platform } from "react-native";
import { Link } from "expo-router";
import { useLayout } from "./LayoutContext";
import {
  Box,
  HStack,
  IconButton,
  Input,
  Icon,
  Badge,
  Pressable,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

export default function Topbar() {
  const { toggle } = useLayout();

  return (
    <Box
      bg="white"
      borderBottomWidth={1}
      borderBottomColor="border.200"
      px={4}
      height={56}
      justifyContent="center"
    >
      <HStack alignItems="center" justifyContent="space-between" space={3}>
        {/* Left: Hamburger + Search */}
        <HStack alignItems="center" space={3} flex={1}>
          <IconButton
            onPress={toggle}
            icon={<Icon as={Ionicons} name="menu" />}
            _icon={{ color: "coolGray.900" }}
            bg="coolGray.100"
            borderRadius="md"
          />
          <Input
            flex={1}
            placeholder="Search"
            InputLeftElement={
              <Icon as={Ionicons} name="search" ml={3} color="coolGray.500" />
            }
            bg="coolGray.100"
            borderRadius="md"
            _focus={{ bg: "coolGray.100" }}
          />
        </HStack>

        {/* Right: Actions */}
        <HStack alignItems="center" space={2}>
          <IconButton
            icon={<Icon as={Ionicons} name="checkmark-done-outline" />}
            _icon={{ color: "coolGray.900" }}
            bg="coolGray.100"
            borderRadius="md"
          />
          <IconButton
            icon={<Icon as={Ionicons} name="grid-outline" />}
            _icon={{ color: "coolGray.900" }}
            bg="coolGray.100"
            borderRadius="md"
          />

          {/* Notifications with badge */}
          <Box position="relative">
            <IconButton
              icon={<Icon as={Ionicons} name="notifications-outline" />}
              _icon={{ color: "coolGray.900" }}
              bg="coolGray.100"
              borderRadius="md"
            />
            <Badge
              colorScheme="primary"
              rounded="full"
              position="absolute"
              top={-1}
              right={-1}
              _text={{ fontSize: 10, fontWeight: "bold" }}
            >
              5
            </Badge>
          </Box>

          {/* Settings links to /settings */}
          <Link href="/settings" asChild>
            <Pressable>
              <IconButton
                icon={<Icon as={Ionicons} name="settings-outline" />}
                _icon={{ color: "coolGray.900" }}
                bg="coolGray.100"
                borderRadius="md"
              />
            </Pressable>
          </Link>

          <IconButton
            icon={<Icon as={Ionicons} name="person-circle-outline" />}
            _icon={{ color: "coolGray.900" }}
            bg="coolGray.100"
            borderRadius="md"
          />
        </HStack>
      </HStack>
    </Box>
  );
}
