import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, onPress, variant = 'primary', style }: PrimaryButtonProps) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.filled,
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
    >
      <Text style={[typography.button, isOutline && styles.outlineText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // área de toque grande e confortável
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
