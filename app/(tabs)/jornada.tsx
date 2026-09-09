import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { exerciseById } from '../../src/data/exercises/calisthenics';
import { generateCycle1Program } from '../../src/services/program/cycle1Engine';
import { loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { loadProgramExecutions } from '../../src/services/workout/executionStorage';
import { loadAdaptationDecisions } from '../../src/services/journey/adaptationStorage';
import { loadDailyAvailability } from '../../src/services/journey/availabilityStorage';
import { loadComplementaryActivities } from '../../src/services/journey/complementaryActivityStorage';
import { loadFreeSessions } from '../../src/services/journey/freeSessionStorage';
import { buildCycleJourneySummary, cycleFeedback } from '../../src/services/journey/journeyEngine';
import { CycleJourneySummary, ExerciseFamilyJourney } from '../../src/types/program';

const FAMILY_LABELS: Record<string, string> = {
  pushup: 'Empurrar',
  squat: 'Agachamento',
  lunge: 'Afundo',
  pull: 'Puxar',
  plank: 'Prancha',
  core: 'Core',
};

function formatMinutes(seconds: number) {
  const minutes = Math.max(0, Math.round(seconds / 60));
  return `${minutes} min`;
}

function exerciseName(id?: string) {
  if (!id) return '—';
  return exerciseById[id]?.name ?? id;
}

function behaviorStageLabel(stage: CycleJourneySummary['behavior']['stage']) {
  const labels = {
    descobrindo: 'Descobrindo',
    construindo_consistencia: 'Construindo consistência',
    ganhando_autonomia: 'Ganhando autonomia',
    movimento_integrado: 'Movimento integrado',
  } as const;
  return labels[stage];
}

function familyLabel(group: string) {
  return FAMILY_LABELS[group] ?? group.charAt(0).toUpperCase() + group.slice(1);
}

export default function JourneyScreen() {
  const [summary, setSummary] = useState<CycleJourneySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadAssessmentResult(),
      loadProgramExecutions(),
      loadAdaptationDecisions(),
      loadDailyAvailability(),
      loadComplementaryActivities(),
      loadFreeSessions(),
    ])
      .then(([assessment, executions, decisions, availability, complementaryActivities, freeSessions]) => {
        if (!assessment) return;
        const program = generateCycle1Program(assessment.profile);
        setSummary(buildCycleJourneySummary(program, executions, decisions, availability, complementaryActivities, freeSessions));
      })
      .finally(() => setLoading(false));
  }, []);

  const feedback = useMemo(
    () => summary ? cycleFeedback(summary) : '',
    [summary],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  if (!summary) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MINHA JORNADA</Text>
        <Text style={typography.h1}>Seu histórico começa com o primeiro ciclo.</Text>
        <Text style={styles.subtitle}>
          Conclua o quiz inicial e inicie seu programa para que o Corpo Leve possa organizar sua evolução.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>MINHA JORNADA</Text>
      <Text style={typography.h1}>Ciclo {summary.cycle}</Text>
      <Text style={styles.subtitle}>
        Seu progresso é comparado com o seu próprio histórico de treinos.
      </Text>

      <View style={[styles.heroCard, shadow.card]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.cardEyebrow}>PROGRESSO DO CICLO</Text>
            <Text style={styles.heroValue}>{summary.completedDays}/{summary.durationDays} dias</Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{summary.completionRate}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${summary.completionRate}%` }]} />
        </View>
        <Text style={styles.heroHint}>Consistência é registrada sessão por sessão.</Text>
      </View>

      <View style={styles.metricGrid}>
        <Metric icon="time-outline" label="Tempo ativo" value={formatMinutes(summary.activeSeconds)} />
        <Metric icon="sparkles-outline" label="Progressões" value={`${summary.progressionCount}`} />
        <Metric icon="options-outline" label="Adaptações" value={`${summary.adaptationCount}`} />
        <Metric icon="refresh-outline" label="Regressões" value={`${summary.regressionCount}`} />
      </View>

      <View style={[styles.feedbackCard, shadow.card]}>
        <View style={styles.feedbackHeader}>
          <Ionicons name="leaf-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.feedbackTitle}>O que o Corpo Leve aprendeu</Text>
        </View>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>


      <Text style={styles.sectionTitle}>Continuidade</Text>
      <Text style={styles.sectionSubtitle}>
        Sessões curtas contam como prática real. O Corpo Leve observa disponibilidade e retomadas sem exigir uma sequência perfeita.
      </Text>

      <View style={[styles.continuityCard, shadow.card]}>
        <View style={styles.continuityGrid}>
          <ContinuityMetric label="Sessões curtas" value={`${summary.continuity.shortSessions}`} />
          <ContinuityMetric label="Treinos completos" value={`${summary.continuity.fullSessions}`} />
          <ContinuityMetric label="Retomadas" value={`${summary.continuity.returnCount}`} />
          <ContinuityMetric label="Dias sem tempo" value={`${summary.continuity.unavailableDays}`} />
        </View>
        {summary.continuity.preferredWindowMinutes ? (
          <View style={styles.windowInsight}>
            <Ionicons name="time-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.windowInsightText}>
              Até agora, {summary.continuity.preferredWindowMinutes} minutos é sua janela de tempo mais escolhida para treinar.
            </Text>
          </View>
        ) : (
          <Text style={styles.continuityHint}>
            Conforme você escolher o tempo disponível, o Corpo Leve aprenderá quais formatos se encaixam melhor na sua rotina.
          </Text>
        )}
      </View>


      <Text style={styles.sectionTitle}>Autonomia em construção</Text>
      <Text style={styles.sectionSubtitle}>
        O Corpo Leve observa sinais da sua própria jornada. Não existe um prazo fixo para “formar um hábito”.
      </Text>

      <View style={[styles.behaviorCard, shadow.card]}>
        <Text style={styles.behaviorStage}>{behaviorStageLabel(summary.behavior.stage)}</Text>
        <Text style={styles.behaviorMessage}>{summary.behavior.message}</Text>

        <View style={styles.behaviorStats}>
          <SmallStat label="Sessões do programa" value={`${summary.behavior.completedProgramSessions}`} />
          <SmallStat label="Atividades complementares" value={`${summary.behavior.complementaryActivities}`} />
          <SmallStat label="Min. complementares" value={`${summary.behavior.complementaryMinutes}`} />
        </View>
        <View style={styles.freeModeMetric}>
          <Text style={styles.freeModeMetricValue}>{summary.behavior.freeAssistedSessions}</Text>
          <Text style={styles.freeModeMetricText}>práticas no Modo Livre Assistido</Text>
        </View>

        {summary.behavior.observedSignals.length ? (
          <View style={styles.signalBox}>
            <Text style={styles.signalTitle}>SINAIS OBSERVADOS</Text>
            {summary.behavior.observedSignals.map((signal) => (
              <Text key={signal} style={styles.signalText}>• {signal}</Text>
            ))}
          </View>
        ) : null}

        <Pressable
          onPress={() => router.push('/jornada/modo-livre')}
          style={({ pressed }) => [styles.freeModeButton, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="compass-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.freeModeButtonText}>Abrir Modo Livre Assistido</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/jornada/atividade-complementar')}
          style={({ pressed }) => [styles.complementaryButton, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.complementaryButtonText}>Registrar atividade complementar</Text>
        </Pressable>

        <Text style={styles.complementaryRule}>
          Atividades complementares enriquecem sua jornada, mas não concluem automaticamente a atividade planejada do dia.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Evolução por exercício</Text>
      <Text style={styles.sectionSubtitle}>
        Cada família mantém sua própria memória de prática, esforço e progressão.
      </Text>

      {summary.exerciseFamilies.length ? (
        summary.exerciseFamilies.map((family) => (
          <FamilyCard key={family.progressionGroup} family={family} />
        ))
      ) : (
        <View style={[styles.emptyCard, shadow.card]}>
          <Text style={styles.emptyTitle}>Histórico em construção</Text>
          <Text style={styles.emptyText}>
            Quando você concluir exercícios com progressão registrada, eles aparecerão aqui.
          </Text>
        </View>
      )}

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Como interpretar sua jornada</Text>
        <Text style={styles.footerText}>
          Avançar, manter ou regredir temporariamente uma variação fazem parte do processo.
          O Corpo Leve usa seu histórico para priorizar técnica, recuperação e evolução gradual.
        </Text>
      </View>
    </ScrollView>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.metricCard, shadow.card]}>
      <Ionicons name={icon} size={20} color={colors.primaryDark} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ContinuityMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.continuityMetric}>
      <Text style={styles.continuityMetricValue}>{value}</Text>
      <Text style={styles.continuityMetricLabel}>{label}</Text>
    </View>
  );
}

function FamilyCard({ family }: { family: ExerciseFamilyJourney }) {
  const stable = family.effortCounts.leve + family.effortCounts.adequado;
  const challenging = family.effortCounts.dificil + family.effortCounts.interrompido;
  const totalFeedback = stable + challenging;
  const stableRate = totalFeedback ? Math.round((stable / totalFeedback) * 100) : 0;

  return (
    <Pressable
      onPress={() => router.push(`/jornada/${family.progressionGroup}`)}
      style={({ pressed }) => [styles.familyCard, shadow.card, pressed && styles.familyCardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir jornada de ${familyLabel(family.progressionGroup)}`}
    >
      <View style={styles.familyHeader}>
        <View>
          <Text style={styles.familyTitle}>{familyLabel(family.progressionGroup)}</Text>
          <Text style={styles.familySessions}>{family.sessions} sessões registradas</Text>
        </View>
        <View style={styles.familyBadge}>
          <Text style={styles.familyBadgeText}>{stableRate}% estável</Text>
        </View>
      </View>

      <View style={styles.pathBox}>
        <Text style={styles.pathLabel}>JORNADA DA VARIAÇÃO</Text>
        <Text style={styles.pathText}>
          {exerciseName(family.firstExerciseId)} → {exerciseName(family.currentExerciseId)}
        </Text>
        {family.highestExerciseId && family.highestExerciseId !== family.currentExerciseId ? (
          <Text style={styles.highestText}>
            Maior variação já alcançada: {exerciseName(family.highestExerciseId)}
          </Text>
        ) : null}
      </View>

      <View style={styles.familyStats}>
        <SmallStat label="Séries" value={`${family.completedSets}`} />
        <SmallStat label="Tempo ativo" value={formatMinutes(family.activeSeconds)} />
        <SmallStat label="Progressões" value={`${family.progressionCount}`} />
      </View>

      <View style={styles.effortRow}>
        <EffortPill label="Leve" value={family.effortCounts.leve} />
        <EffortPill label="Adequado" value={family.effortCounts.adequado} />
        <EffortPill label="Difícil" value={family.effortCounts.dificil} />
        <EffortPill label="Interrompido" value={family.effortCounts.interrompido} />
      </View>
      <View style={styles.openJourneyRow}>
        <Text style={styles.openJourneyText}>Ver linha do tempo</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primaryDark} />
      </View>
    </Pressable>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.smallStat}>
      <Text style={styles.smallStatValue}>{value}</Text>
      <Text style={styles.smallStatLabel}>{label}</Text>
    </View>
  );
}

function EffortPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.effortPill}>
      <Text style={styles.effortPillValue}>{value}</Text>
      <Text style={styles.effortPillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  eyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 1.4, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },

  heroCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.8 },
  heroValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4 },
  percentBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full },
  percentText: { ...typography.body, color: colors.primaryDark, fontWeight: '900' },
  progressTrack: { height: 9, backgroundColor: colors.surfaceAlt, borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.md },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  heroHint: { ...typography.caption, marginTop: spacing.sm },

  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  metricCard: { width: '48%', flexGrow: 1, minWidth: 140, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  metricValue: { ...typography.h3, marginTop: spacing.sm },
  metricLabel: { ...typography.caption, marginTop: 2 },

  feedbackCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  feedbackTitle: { ...typography.h3, color: colors.primaryDark },
  feedbackText: { ...typography.body, lineHeight: 23, marginTop: spacing.sm },

  sectionTitle: { ...typography.h2, marginBottom: spacing.xs },
  continuityCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  continuityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  continuityMetric: { width: '48%', flexGrow: 1, minWidth: 130, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md },
  continuityMetricValue: { ...typography.h3, color: colors.text },
  continuityMetricLabel: { ...typography.caption, marginTop: 2 },
  windowInsight: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  windowInsightText: { ...typography.bodyMuted, flex: 1, lineHeight: 20, color: colors.text },
  continuityHint: { ...typography.bodyMuted, lineHeight: 20, marginTop: spacing.md },
  sectionSubtitle: { ...typography.bodyMuted, lineHeight: 20, marginBottom: spacing.md },
  behaviorCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  behaviorStage: { ...typography.h3, color: colors.primaryDark },
  behaviorMessage: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, marginTop: spacing.xs },
  behaviorStats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  signalBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  signalTitle: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.6, marginBottom: 5 },
  signalText: { ...typography.bodyMuted, color: colors.text, lineHeight: 20 },
  freeModeMetric: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: spacing.md },
  freeModeMetricValue: { ...typography.h3, color: colors.primaryDark },
  freeModeMetricText: { ...typography.caption, color: colors.text },
  freeModeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryDark, backgroundColor: colors.surface },
  freeModeButtonText: { ...typography.body, color: colors.primaryDark, fontWeight: '800' },
  complementaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primaryLight },
  complementaryButtonText: { ...typography.body, color: colors.primaryDark, fontWeight: '800' },
  complementaryRule: { ...typography.caption, lineHeight: 17, marginTop: spacing.sm },

  familyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  familyCardPressed: { opacity: 0.78 },
  openJourneyRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: spacing.md },
  openJourneyText: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },
  familyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  familyTitle: { ...typography.h3 },
  familySessions: { ...typography.caption, marginTop: 3 },
  familyBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  familyBadgeText: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },

  pathBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  pathLabel: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.6 },
  pathText: { ...typography.body, fontWeight: '700', lineHeight: 22, marginTop: 5 },
  highestText: { ...typography.caption, lineHeight: 17, marginTop: spacing.xs },

  familyStats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  smallStat: { flex: 1, backgroundColor: '#FAF9F6', borderRadius: radius.sm, padding: spacing.sm },
  smallStatValue: { ...typography.body, fontWeight: '800' },
  smallStatLabel: { ...typography.caption, marginTop: 2 },

  effortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  effortPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 5 },
  effortPillValue: { ...typography.caption, color: colors.text, fontWeight: '900' },
  effortPillLabel: { ...typography.caption, fontSize: 10 },

  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  emptyTitle: { ...typography.h3 },
  emptyText: { ...typography.bodyMuted, lineHeight: 20, marginTop: spacing.xs },

  footerCard: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  footerTitle: { ...typography.body, fontWeight: '800' },
  footerText: { ...typography.bodyMuted, lineHeight: 20, marginTop: spacing.xs },
});
