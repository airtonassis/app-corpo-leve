import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { AvatarMovementDefinition, AvatarMovementPhaseKey, AvatarTechniquePoint } from '../types/program';

type Props = {
  movement: AvatarMovementDefinition;
  phaseKey: AvatarMovementPhaseKey;
  compact?: boolean;
};

function applies(point: AvatarTechniquePoint, phaseKey: AvatarMovementPhaseKey) {
  return !point.phases?.length || point.phases.includes(phaseKey);
}

export function AvatarCoachOverlay({ movement, phaseKey, compact = false }: Props) {
  const points = useMemo(
    () => movement.techniquePoints
      .filter((point) => applies(point, phaseKey))
      .sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3))
      .slice(0, compact ? 2 : 3),
    [movement, phaseKey, compact],
  );

  if (!points.length) return null;

  const main = points[0];
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.liveDot} />
        <Text style={styles.title}>AVATAR COACH</Text>
        <Text style={styles.phase}>{phaseKey.toUpperCase()}</Text>
      </View>

      <Text style={styles.mainCue}>{main.cue ?? main.label}</Text>

      <View style={styles.tags}>
        {points.map((point) => (
          <View key={point.id} style={styles.tag}>
            <View style={styles.marker} />
            <Text style={styles.tagText}>{point.label}</Text>
            <Text style={styles.region}>{point.region}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#101B16',
    borderWidth: 1,
    borderColor: '#284C3B',
  },
  cardCompact: { paddingVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#66E39C' },
  title: { ...typography.caption, color: '#8CF0B2', fontWeight: '900', letterSpacing: 0.7 },
  phase: { ...typography.caption, color: '#7D9187', marginLeft: 'auto', fontWeight: '800' },
  mainCue: { ...typography.body, color: '#F4F7F5', fontWeight: '700', lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#16241D',
  },
  marker: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#66E39C' },
  tagText: { ...typography.caption, color: '#DDE8E1', fontWeight: '700' },
  region: { ...typography.caption, color: '#73857B', fontSize: 10 },
});
