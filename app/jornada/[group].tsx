import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { exerciseById } from '../../src/data/exercises/calisthenics';
import { generateCycle1Program } from '../../src/services/program/cycle1Engine';
import { loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { loadProgramExecutions } from '../../src/services/workout/executionStorage';
import { loadAdaptationDecisions } from '../../src/services/journey/adaptationStorage';
import {
  buildCycleJourneySummary,
  buildExerciseFamilyTimeline,
} from '../../src/services/journey/journeyEngine';
import {
  AdaptationDecision,
  ExerciseFamilyJourney,
  ExerciseJourneyTimelineItem,
} from '../../src/types/program';

const FAMILY_LABELS: Record<string, string> = {
  pushup: 'Empurrar',
  squat: 'Agachamento',
  lunge: 'Afundo',
  pull: 'Puxar',
  plank: 'Prancha',
  core: 'Core',
};

const EFFORT_LABELS = {
  leve: 'Leve',
  adequado: 'Adequado',
  dificil: 'Difícil',
  interrompido: 'Interrompido',
} as const;

function familyLabel(group: string) {
  return FAMILY_LABELS[group] ?? group.charAt(0).toUpperCase() + group.slice(1);
}

function exerciseName(id?: string) {
  if (!id) return '—';
  return exerciseById[id]?.name ?? id;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatSeconds(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}min ${rest}s` : `${minutes}min`;
}

function reasonText(decision?: AdaptationDecision) {
  if (!decision) return null;
  switch (decision.reason) {
    case 'feedback_interrompido':
      return 'Ajuste aplicado após uma interrupção recente, priorizando uma variação mais confortável e menor volume.';
    case 'dificuldade_repetida':
      return 'Ajuste aplicado após dificuldade repetida nas sessões recentes.';
    case 'feedback_dificil':
      return 'O volume foi reduzido após um feedback difícil para preservar controle e recuperação.';
    case 'tres_feedbacks_estaveis':
      return 'Progressão aplicada após três feedbacks estáveis consecutivos.';
    default:
      return 'O treino foi mantido com base no histórico recente.';
  }
}

export default function ExerciseJourneyScreen() {
  const { group = '' } = useLocalSearchParams<{ group: string }>();
  const [timeline, setTimeline] = useState<ExerciseJourneyTimelineItem[]>([]);
  const [family, setFamily] = useState<ExerciseFamilyJourney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadAssessmentResult(),
      loadProgramExecutions(),
      loadAdaptationDecisions(),
    ])
      .then(([assessment, executions, decisions]) => {
        if (!assessment || !group) return;
        const program = generateCycle1Program(assessment.profile);
        const relevant = executions.filter((item) => item.programId === program.id);
        const relevantDecisions = decisions.filter((item) => item.programId === program.id);
        const summary = buildCycleJourneySummary(program, relevant, relevantDecisions);
        setFamily(summary.exerciseFamilies.find((item) => item.progressionGroup === group) ?? null);
        setTimeline(buildExerciseFamilyTimeline(group, relevant, relevantDecisions));
      })
      .finally(() => setLoading(false));
  }, [group]);

  const lastItem = timeline.at(-1);
  const firstItem = timeline[0];

  const stableCount = useMemo(
    () => family ? family.effortCounts.leve + family.effortCounts.adequado : 0,
    [family],
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryDark} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Minha Jornada</Text>
      </Pressable>

      <Text style={styles.eyebrow}>JORNADA DO EXERCÍCIO</Text>
      <Text style={typography.h1}>{familyLabel(group)}</Text>
      <Text style={styles.subtitle}>
        Histórico sessão a sessão desta família de movimento.
      </Text>

      {family && firstItem && lastItem ? (
        <>
          <View style={[styles.heroCard, shadow.card]}>
            <Text style={styles.cardEyebrow}>CAMINHO ATUAL</Text>
            <Text style={styles.pathStart}>{exerciseName(firstItem.exerciseId)}</Text>
            <View style={styles.pathArrow}>
              <View style={styles.pathLine} />
              <Ionicons name="arrow-down" size={18} color={colors.primaryDark} />
            </View>
            <Text style={styles.pathCurrent}>{exerciseName(lastItem.exerciseId)}</Text>
            <Text style={styles.pathHint}>
              {timeline.length} sessões · {stableCount} feedbacks estáveis
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <MiniMetric label="Sessões" value={`${family.sessions}`} />
            <MiniMetric label="Séries" value={`${family.completedSets}`} />
            <MiniMetric label="Progressões" value={`${family.progressionCount}`} />
          </View>

          <Text style={styles.sectionTitle}>Linha do tempo</Text>
          <Text style={styles.sectionSubtitle}>
            Mudanças de variação são registradas junto com o feedback e a decisão que influenciou o treino.
          </Text>

          <View style={styles.timeline}>
            {timeline.map((item, index) => (
              <TimelineItem
                key={`${item.day}-${item.exerciseId}-${index}`}
                item={item}
                isLast={index === timeline.length - 1}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={[styles.emptyCard, shadow.card]}>
          <Text style={styles.emptyTitle}>Ainda não há sessões nesta família.</Text>
          <Text style={styles.emptyText}>
            Assim que um exercício desta família for concluído, a linha do tempo começará a ser construída.
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primaryDark} />
        <Text style={styles.infoText}>
          Uma regressão temporária não significa perda de progresso. Ela pode ser usada para preservar técnica, controle e recuperação antes de retomar uma progressão.
        </Text>
      </View>
    </ScrollView>
  );
}

function TimelineItem({ item, isLast }: { item: ExerciseJourneyTimelineItem; isLast: boolean }) {
  const decisionText = reasonText(item.adaptation);
  const transitionLabel =
    item.transition === 'inicio' ? 'Início'
    : item.transition === 'avancou' ? 'Progressão'
    : item.transition === 'regrediu' ? 'Ajuste'
    : 'Mantido';

  const icon =
    item.transition === 'avancou' ? 'arrow-up-circle-outline'
    : item.transition === 'regrediu' ? 'swap-vertical-outline'
    : item.transition === 'inicio' ? 'flag-outline'
    : 'remove-circle-outline';

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot}>
          <Ionicons name={icon} size={16} color={colors.primaryDark} />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>

      <View style={[styles.timelineCard, shadow.card]}>
        <View style={styles.timelineHeader}>
          <View>
            <Text style={styles.timelineDay}>DIA {item.day}</Text>
            <Text style={styles.timelineDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.transitionBadge}>
            <Text style={styles.transitionText}>{transitionLabel}</Text>
          </View>
        </View>

        <Text style={styles.exerciseName}>{exerciseName(item.exerciseId)}</Text>

        {item.previousExerciseId && item.previousExerciseId !== item.exerciseId ? (
          <Text style={styles.changeText}>
            {exerciseName(item.previousExerciseId)} → {exerciseName(item.exerciseId)}
          </Text>
        ) : null}

        <View style={styles.sessionStats}>
          <Text style={styles.sessionStat}>{item.setsCompleted} séries</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.sessionStat}>{formatSeconds(item.activeSeconds)}</Text>
          {item.repsCompleted ? (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.sessionStat}>{item.repsCompleted} reps</Text>
            </>
          ) : null}
        </View>

        {item.effort ? (
          <View style={styles.effortBox}>
            <Text style={styles.effortLabel}>FEEDBACK</Text>
            <Text style={styles.effortValue}>{EFFORT_LABELS[item.effort]}</Text>
          </View>
        ) : null}

        {decisionText ? (
          <View style={styles.decisionBox}>
            <Text style={styles.decisionEyebrow}>DECISÃO DO CORPO LEVE</Text>
            <Text style={styles.decisionText}>{decisionText}</Text>
            {item.adaptation?.recentEfforts.length ? (
              <Text style={styles.historyText}>
                Histórico considerado: {item.adaptation.recentEfforts.map((effort) => EFFORT_LABELS[effort]).join(' · ')}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.miniMetric, shadow.card]}>
      <Text style={styles.miniMetricValue}>{value}</Text>
      <Text style={styles.miniMetricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 3, marginBottom: spacing.lg },
  backText: { ...typography.bodyMuted, color: colors.text },
  eyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 1.2, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },

  heroCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg },
  cardEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.8 },
  pathStart: { ...typography.body, fontWeight: '700', marginTop: spacing.md },
  pathArrow: { width: 24, alignItems: 'center', marginVertical: 5 },
  pathLine: { width: 2, height: 14, backgroundColor: colors.primary },
  pathCurrent: { ...typography.h2, color: colors.primaryDark },
  pathHint: { ...typography.caption, marginTop: spacing.sm },

  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  miniMetric: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  miniMetricValue: { ...typography.h3 },
  miniMetricLabel: { ...typography.caption, marginTop: 2 },

  sectionTitle: { ...typography.h2, marginTop: spacing.md, marginBottom: spacing.xs },
  sectionSubtitle: { ...typography.bodyMuted, lineHeight: 20, marginBottom: spacing.lg },

  timeline: { marginTop: spacing.xs },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch' },
  timelineRail: { width: 32, alignItems: 'center' },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.border },
  timelineCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginLeft: spacing.sm, marginBottom: spacing.md },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  timelineDay: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.7 },
  timelineDate: { ...typography.caption, marginTop: 2 },
  transitionBadge: { backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 5 },
  transitionText: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },
  exerciseName: { ...typography.h3, marginTop: spacing.sm },
  changeText: { ...typography.bodyMuted, lineHeight: 19, marginTop: 3 },
  sessionStats: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  sessionStat: { ...typography.caption, color: colors.text },
  separator: { ...typography.caption },

  effortBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm },
  effortLabel: { ...typography.caption, fontWeight: '800' },
  effortValue: { ...typography.caption, color: colors.primaryDark, fontWeight: '900' },

  decisionBox: { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: spacing.sm, marginTop: spacing.md },
  decisionEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.6 },
  decisionText: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, marginTop: 4 },
  historyText: { ...typography.caption, lineHeight: 17, marginTop: spacing.xs },

  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  emptyTitle: { ...typography.h3 },
  emptyText: { ...typography.bodyMuted, lineHeight: 20, marginTop: spacing.xs },

  infoCard: { flexDirection: 'row', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  infoText: { ...typography.bodyMuted, flex: 1, lineHeight: 20 },
});
