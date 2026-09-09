import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

export function QuizProgress({ current, estimatedTotal }: { current: number; estimatedTotal: number }) {
  const safeTotal = Math.max(estimatedTotal, current, 1);
  const progress = Math.min(current / safeTotal, 1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Avaliação adaptativa</Text>
        <Text style={styles.counter}>{current} de ~{safeTotal}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(progress * 100, 4)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.caption, fontWeight: '700', color: colors.primaryDark },
  counter: { ...typography.caption },
  track: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
});
