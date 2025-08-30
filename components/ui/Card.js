// components/ui/Card.js
import React from "react";
import { Box } from "native-base";

export default function Card({ children, style, ...props }) {
  return (
    <Box
      bg="white"
      rounded="x2"
      shadow={4}
      borderWidth={1}
      borderColor="border.00"
      p={4}
      style={style}
      {...props}   // let you pass flex props, etc.
    >
      {children}
    </Box>
  );
}
