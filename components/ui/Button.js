import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function Button({
  title,
  onPress,
  variant = 'filled', // 'filled', 'outlined', 'text'
  size = 'medium', // 'small', 'medium', 'large'
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  gradient = false,
  style,
  textStyle,
}) {
  // Determine styles based on props
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => (
    <>
      {iconLeft && !loading && (
        <Ionicons 
          name={iconLeft} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'filled' ? 'white' : COLORS.primary}
          style={styles.leftIcon} 
        />
      )}
      
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'filled' ? 'white' : COLORS.primary} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      
      {iconRight && !loading && (
        <Ionicons 
          name={iconRight} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'filled' ? 'white' : COLORS.primary}
          style={styles.rightIcon} 
        />
      )}
    </>
  );

  // Use a gradient background if requested and is a filled button
  if (gradient && variant === 'filled' && !disabled) {
    return (
      <Pressable 
        onPress={disabled || loading ? null : onPress}
        style={({ pressed }) => [
          buttonStyles,
          pressed && styles.pressed,
          { backgroundColor: 'transparent' }, // Remove background color
        ]}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={COLORS.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          borderRadius={RADIUS.md}
        />
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={disabled || loading ? null : onPress}
      style={({ pressed }) => [
        buttonStyles,
        pressed && styles.pressed,
      ]}
      disabled={disabled || loading}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  
  // Variant styles
  filledButton: {
    backgroundColor: COLORS.primary,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  
  // Size styles
  smallButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  mediumButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  largeButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  
  // Text styles
  buttonText: {
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },
  filledText: {
    color: 'white',
  },
  outlinedText: {
    color: COLORS.primary,
  },
  textText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: FONTS.sizes.sm,
  },
  mediumText: {
    fontSize: FONTS.sizes.md,
  },
  largeText: {
    fontSize: FONTS.sizes.lg,
  },
  
  // Other styles
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
    opacity: 0.7,
  },
  disabledText: {
    color: COLORS.lightText,
  },
  pressed: {
    opacity: 0.8,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
});