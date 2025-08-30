// components/ui/ProgressBar.js
import React from "react";
import { Progress } from "native-base";

export default function ProgressBar({ value = 0, colorScheme = "primary" }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <Progress
      value={safe}
      colorScheme={colorScheme}
      rounded="full"
      bg="coolGray.100"
      _filledTrack={{ rounded: "full" }}
    />
  );
}
