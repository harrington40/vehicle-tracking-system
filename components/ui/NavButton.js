import React from "react";
import { Pressable, Text } from "react-native";
import { Link } from "expo-router";
import { COLORS } from "../../lib/theme";

export default function NavButton({ href, label }) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: COLORS.primary,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
          ...(pressed ? { opacity: 0.85 } : null),
        })}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>{label}</Text>
      </Pressable>
    </Link>
  );
}
