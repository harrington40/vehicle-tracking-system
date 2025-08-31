// components/ui/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../../lib/theme';

export default function Card({ children, style, elevation = 'medium', radius = 'md' }) {
  return (
    <View 
      style={[
        styles.card, 
        styles[`${elevation}Elevation`],
        { borderRadius: RADIUS[radius] },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    overflow: 'hidden',
    borderRadius: RADIUS.md,
  },
  smallElevation: {
    ...SHADOWS.small,
  },
  mediumElevation: {
    ...SHADOWS.medium,
  },
  largeElevation: {
    ...SHADOWS.large,
  },
});