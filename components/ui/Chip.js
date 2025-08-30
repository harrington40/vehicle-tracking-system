// components/ui/Chip.js
import React from "react";
import { Badge } from "native-base";

/**
 * tone: "success" | "danger" | "warn" | "primary"
 */
export default function Chip({ text, tone = "success" }) {
  const map = {
    success: "emerald",
    danger: "red",
    warn: "amber",
    primary: "primary",
  };
  const scheme = map[tone] || "primary";

  return (
    <Badge
      colorScheme={scheme}
      variant="outline"
      rounded="full"
      px={2}
      _text={{ fontWeight: "700" }}
      bg="coolGray.50"
    >
      {text}
    </Badge>
  );
}
