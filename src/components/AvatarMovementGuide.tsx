import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AvatarCoachOverlay } from './AvatarCoachOverlay';
import { ExerciseAvatar, resolveAvatarMotionKey } from './ExerciseAvatar';
import { colors, radius, spacing, typography } from '../constants/theme';
import { getAvatarMovement } from '../data/avatar/movementCatalog';
import { AvatarVariant, ExerciseDefinition } from '../types/program';

type Props = {
  variant: AvatarVariant;
  exercise: ExerciseDefinition;
  active?: boolean;
  compact?: boolean;
};

export function AvatarMovementGuide({ variant, exercise, active = true, compact = false }: Props) {
  const motionKey = resolveAvatarMotionKey(exercise);
  const movement = useMemo(() => getAvatarMovement(exercise, motionKey), [exercise, motionKey]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const cadenceProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPhaseIndex(0);
    if (!active) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const schedule = (index: number) => {
      timeout = setTimeout(() => {
        const next = (index + 1) % movement.phases.length;
        setPhaseIndex(next);
        schedule(next);
      }, movement.phases[index].durationMs);
    };
    schedule(0);
    return () => { if (timeout) clearTimeout(timeout); };
  }, [active, exercise.id, movement.phases]);

  const phase = movement.phases[phaseIndex];

  useEffect(() => {
    cadenceProgress.stopAnimation();
    cadenceProgress.setValue(0);
    if (!active) return;
    const animation = Animated.timing(cadenceProgress, {
      toValue: 1,
      duration: phase.durationMs,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [active, phase.key, phase.durationMs, cadenceProgress]);

  const cadenceSeconds = (phase.durationMs / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: phase.durationMs % 1000 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
  const cadenceWidth = cadenceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const activeCoachPoints = useMemo(
    () => movement.techniquePoints
      .filter((point) => !point.phases?.length || point.phases.includes(phase.key))
      .sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3))
      .slice(0, 3),
    [movement.techniquePoints, phase.key],
  );

  return (
    <View style={styles.wrapper}>
      <ExerciseAvatar variant={variant} exercise={exercise} active={active} compact phaseKey={phase.key} phaseDurationMs={phase.durationMs} coachPoints={activeCoachPoints} />

      <AvatarCoachOverlay movement={movement} phaseKey={phase.key} compact={compact} />

      <View style={styles.phaseRow}>
        {movement.phases.map((item, index) => (
          <View key={item.key} style={[styles.phaseChip, index === phaseIndex && styles.phaseChipActive]}>
            <Text style={[styles.phaseChipText, index === phaseIndex && styles.phaseChipTextActive]}>{index + 1}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cueCard}>
        <View style={styles.phaseTitleRow}>
          <Text style={styles.phaseTitle}>{phase.title}</Text>
          <Text style={styles.cadenceTime}>{cadenceSeconds}s</Text>
        </View>
        <Text style={styles.phaseCue}>{phase.cue}</Text>

        <View style={styles.cadenceTrack} accessibilityLabel={`Cadência orientativa da fase: ${cadenceSeconds} segundos`}>
          <Animated.View style={[styles.cadenceFill, { width: cadenceWidth }]} />
        </View>
        <View style={styles.cadenceLegend}>
          <Text style={styles.cadenceLegendText}>CADÊNCIA ORIENTATIVA</Text>
          <Text style={styles.cadenceLegendText}>controle, não velocidade</Text>
        </View>

        {movement.tempoLabel ? <Text style={styles.tempo}>{movement.tempoLabel}</Text> : null}
      </View>

      {!compact && (
        <>
          <Text style={styles.sectionTitle}>Pontos técnicos</Text>
          <View style={styles.techGrid}>
            {movement.techniquePoints.map((point) => (
              <View key={point.id} style={styles.techItem}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.techText}>{point.label}</Text>
              </View>
            ))}
          </View>
          {movement.commonMistakes.length > 0 && (
            <View style={styles.avoidCard}>
              <Text style={styles.avoidTitle}>Evite</Text>
              {movement.commonMistakes.slice(0, 2).map((item) => <Text key={item} style={styles.avoidText}>• {item}</Text>)}
            </View>
          )}
          <Text style={styles.disclaimer}>Use o avatar como referência visual. Respeite as instruções do exercício e pare se sentir dor ou desconforto importante.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: spacing.md },
  phaseRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: -spacing.sm, marginBottom: spacing.sm },
  phaseChip: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: '#2B3947' },
  phaseChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  phaseChipText: { ...typography.caption, fontWeight: '800', color: '#AAB5C0' },
  phaseChipTextActive: { color: '#07110B' },
  cueCard: { backgroundColor: '#0E151C', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: '#263440' },
  phaseTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cadenceTime: { ...typography.body, color: '#8CF0B2', fontWeight: '900' },
  cadenceTrack: {
    height: 5, overflow: 'hidden', borderRadius: 999,
    backgroundColor: '#24312B', marginTop: spacing.sm,
  },
  cadenceFill: { height: '100%', borderRadius: 999, backgroundColor: '#66E39C' },
  cadenceLegend: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginTop: 5 },
  cadenceLegendText: { ...typography.caption, color: '#75867C', fontSize: 9, fontWeight: '800', letterSpacing: 0.35 },
    phaseTitle: { ...typography.body, color: colors.primary, fontWeight: '800' },
  phaseCue: { ...typography.body, color: '#FFFFFF', fontWeight: '700', marginTop: spacing.xs, lineHeight: 22 },
  tempo: { ...typography.caption, color: '#AAB5C0', marginTop: spacing.sm },
  sectionTitle: { ...typography.body, fontWeight: '800', color: '#FFFFFF', marginTop: spacing.md, marginBottom: spacing.sm },
  techGrid: { gap: spacing.xs },
  techItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  check: { color: colors.primary, fontWeight: '900' },
  techText: { ...typography.bodyMuted, color: '#D6DEE6' },
  avoidCard: { marginTop: spacing.md, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#17191C', borderWidth: 1, borderColor: '#3A3230' },
  avoidTitle: { ...typography.caption, color: '#F2C66D', fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  avoidText: { ...typography.caption, color: '#D9D1C8', lineHeight: 18 },
  disclaimer: { ...typography.caption, color: '#8E9AA6', lineHeight: 17, marginTop: spacing.md },
});
