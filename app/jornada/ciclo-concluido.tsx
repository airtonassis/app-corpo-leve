import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { cycleDefinition } from '../../src/services/program/cycleCatalog';
import { buildJourneyProgramState } from '../../src/services/program/journeyProgramEngine';
import { loadProgramExecutions } from '../../src/services/workout/executionStorage';
import { refreshLongitudinalJourneyMemory } from '../../src/services/journey/journeyMemoryStorage';
import { buildCycleTransitionContext } from '../../src/services/journey/longitudinalJourneyMemoryEngine';
import { CycleTransitionContext, JourneyProgramState } from '../../src/types/program';

export default function CycleCompletedScreen() {
  const params = useLocalSearchParams<{ cycle?: string }>();
  const cycle = Math.max(1, Number(params.cycle ?? '1'));
  const definition = cycleDefinition(cycle);
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<JourneyProgramState | null>(null);
  const [transition, setTransition] = useState<CycleTransitionContext | null>(null);

  useEffect(() => {
    Promise.all([
      loadProgramExecutions(),
      refreshLongitudinalJourneyMemory(),
    ])
      .then(([executions, memory]) => {
        setJourney(buildJourneyProgramState(executions));
        setTransition(buildCycleTransitionContext(memory, cycle, cycle + 1));
      })
      .finally(() => setLoading(false));
  }, [cycle]);

  const progress = useMemo(
    () => journey?.cycles.find((item) => item.definition.cycle === cycle),
    [journey, cycle],
  );

  const next = useMemo(
    () => journey?.cycles.find((item) => item.definition.cycle === cycle + 1)?.definition,
    [journey, cycle],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, shadow.card]}>
        <Ionicons name="checkmark-circle-outline" size={42} color={colors.primaryDark} />
        <Text style={styles.eyebrow}>CICLO {definition.cycle}</Text>
        <Text style={typography.h1}>{definition.name}</Text>
        <Text style={styles.quote}>{definition.userMessage}</Text>

        <Text style={styles.body}>
          {progress?.completed
            ? 'Este ciclo foi concluído e agora passa a fazer parte do seu histórico de jornada.'
            : 'Você chegou ao fechamento desta etapa. O Corpo Leve usa os registros realizados para organizar a continuidade.'}
        </Text>

        {progress?.definition.durationDays ? (
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {progress.completedDays}/{progress.definition.durationDays}
            </Text>
            <Text style={styles.statLabel}>dias registrados neste ciclo</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.reflectionCard, shadow.card]}>
        <Text style={styles.sectionEyebrow}>FECHAMENTO DA ETAPA</Text>
        <Text style={styles.sectionTitle}>Conquista → reflexão → próximo objetivo</Text>
        <Text style={styles.body}>
          O encerramento do ciclo não declara que um hábito foi formado. Ele marca uma etapa da jornada e cria contexto para a próxima decisão.
        </Text>

        <View style={styles.point}>
          <Ionicons name="repeat-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.pointText}>Retomar depois de interrupções continua sendo parte da consistência.</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="time-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.pointText}>Sessões adaptadas ao tempo disponível continuam contando como prática real.</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="compass-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.pointText}>Mais autonomia significa mais capacidade de escolher com coerência, não obrigação de fazer mais.</Text>
        </View>
      </View>

      {transition ? (
        <View style={[styles.transitionCard, shadow.card]}>
          <Text style={styles.sectionEyebrow}>HISTÓRICO HERDADO</Text>
          <Text style={styles.sectionTitle}>A próxima etapa não começa do zero</Text>
          <Text style={styles.body}>
            O Corpo Leve levará referências da sua jornada para interpretar o próximo ciclo.
          </Text>

          {transition.inheritedSignals.slice(0, 4).map((signal) => (
            <View key={signal} style={styles.inheritedRow}>
              <Ionicons name="checkmark-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.inheritedText}>{signal}</Text>
            </View>
          ))}

          {transition.familyPriorities.slice(0, 3).map((item) => (
            <View key={item.progressionGroup} style={styles.familyMemoryRow}>
              <Text style={styles.familyMemoryTitle}>{item.progressionGroup}</Text>
              <Text style={styles.familyMemoryText}>{item.reason}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {next ? (
        <View style={[styles.nextCard, shadow.card]}>
          <Text style={styles.sectionEyebrow}>PRÓXIMA ETAPA</Text>
          <Text style={styles.sectionTitle}>{next.name}</Text>
          <Text style={styles.quote}>{next.userMessage}</Text>
          <Text style={styles.body}>{next.purpose}</Text>

          {!next.generatorReady ? (
            <View style={styles.notReadyBox}>
              <Text style={styles.notReadyTitle}>Gerador específico ainda não liberado</Text>
              <Text style={styles.notReadyText}>
                A etapa já existe na arquitetura, mas receberá seu próprio motor adaptativo antes de ser executada. O Corpo Leve não repete simplesmente o ciclo anterior.
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <PrimaryButton
        label="Ver Minha Jornada"
        onPress={() => router.replace('/(tabs)/jornada')}
      />
      <PrimaryButton
        label="Voltar ao início"
        variant="outline"
        onPress={() => router.replace('/(tabs)')}
        style={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  eyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 1.1, marginTop: spacing.sm },
  quote: { ...typography.body, color: colors.primaryDark, fontWeight: '800', marginTop: spacing.xs },
  body: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, marginTop: spacing.sm },
  statBox: { marginTop: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, marginTop: 2 },
  reflectionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  transitionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  inheritedRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.sm },
  inheritedText: { ...typography.bodyMuted, color: colors.text, flex: 1, lineHeight: 20 },
  familyMemoryRow: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  familyMemoryTitle: { ...typography.body, color: colors.primaryDark, fontWeight: '800' },
  familyMemoryText: { ...typography.caption, color: colors.text, lineHeight: 18, marginTop: 3 },
  nextCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.8 },
  sectionTitle: { ...typography.h2, marginTop: spacing.xs },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.md },
  pointText: { ...typography.bodyMuted, color: colors.text, flex: 1, lineHeight: 20 },
  notReadyBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  notReadyTitle: { ...typography.body, color: colors.primaryDark, fontWeight: '800' },
  notReadyText: { ...typography.caption, color: colors.text, lineHeight: 18, marginTop: 4 },
});
