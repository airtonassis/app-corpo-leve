import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { exerciseById } from '../../src/data/exercises/calisthenics';
import { generateProgramForCycle } from '../../src/services/program/programResolver';
import { buildJourneyProgramState } from '../../src/services/program/journeyProgramEngine';
import { buildFreeSessionGuard } from '../../src/services/journey/freeSessionGuardEngine';
import { saveFreeSession } from '../../src/services/journey/freeSessionStorage';
import { loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { loadProgramExecutions } from '../../src/services/workout/executionStorage';
import { refreshLongitudinalJourneyMemory } from '../../src/services/journey/journeyMemoryStorage';
import { loadContinuousJourneyState } from '../../src/services/journey/continuousJourneyStorage';
import {
  FreeExerciseOption,
  FreeSessionGuardResult,
  FreeSessionIntent,
  ProgramDefinition,
} from '../../src/types/program';

const BASE_INTENTS: { key: FreeSessionIntent; label: string; description: string }[] = [
  { key: 'tecnica', label: 'Praticar técnica', description: 'Repetir movimentos com foco em controle.' },
  { key: 'mobilidade', label: 'Mobilidade', description: 'Movimentos leves para explorar amplitude confortável.' },
  { key: 'explorar', label: 'Explorar', description: 'Conhecer exercícios compatíveis com sua etapa.' },
];

const BUILD_INTENT = {
  key: 'montar_pratica' as const,
  label: 'Montar minha prática',
  description: 'Combinar movimentos permitidos e organizar sua própria prática complementar.',
};

function availabilityLabel(option: FreeExerciseOption['availability']) {
  const labels = {
    recomendado: 'Recomendado',
    disponivel: 'Disponível',
    nao_recomendado: 'Melhor evitar hoje',
    bloqueado: 'Ainda não disponível',
  };
  return labels[option];
}

export default function FreeModeScreen() {
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<ProgramDefinition | null>(null);
  const [guard, setGuard] = useState<FreeSessionGuardResult | null>(null);
  const [intent, setIntent] = useState<FreeSessionIntent>('tecnica');
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    Promise.all([
      loadAssessmentResult(),
      loadProgramExecutions(),
      refreshLongitudinalJourneyMemory(),
      loadContinuousJourneyState(),
    ])
      .then(([assessment, executions, journeyMemory, continuousState]) => {
        if (!assessment) return;
        const journey = buildJourneyProgramState(executions);
        const currentProgram =
          generateProgramForCycle(assessment.profile, journey.currentCycle, journeyMemory, continuousState) ??
          generateProgramForCycle(assessment.profile, 1, journeyMemory, continuousState);
        if (!currentProgram) return;
        setProgram(currentProgram);
        setGuard(buildFreeSessionGuard(assessment.profile, currentProgram, executions));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
    }, 500);
    return () => clearInterval(id);
  }, [startedAt]);

  const availableIntents = useMemo(
    () => guard?.policy.allowBuildPracticeIntent ? [...BASE_INTENTS, BUILD_INTENT] : BASE_INTENTS,
    [guard?.policy.allowBuildPracticeIntent],
  );

  const visibleOptions = useMemo(() => {
    if (!guard) return [];
    return guard.options.filter((item) => {
      const definition = exerciseById[item.exerciseId];
      if (!definition) return false;
      if (intent === 'mobilidade') return definition.category === 'mobilidade' || definition.category === 'aquecimento';
      if (intent === 'tecnica') return definition.category !== 'aquecimento';
      if (intent === 'montar_pratica') return definition.category !== 'aquecimento';
      return true;
    });
  }, [guard, intent]);

  function toggleExercise(option: FreeExerciseOption) {
    if (!guard || option.availability === 'bloqueado' || option.availability === 'nao_recomendado') return;
    setSelected((current) => {
      if (current.includes(option.exerciseId)) return current.filter((id) => id !== option.exerciseId);
      if (current.length >= guard.maxExercises) return current;
      return [...current, option.exerciseId];
    });
  }

  function startPractice() {
    if (!selected.length || !guard) return;
    setStartedAt(new Date());
    setElapsedSeconds(0);
  }

  async function finish() {
    if (!program || !guard || !selected.length || !startedAt) return;
    const now = new Date();
    const durationSeconds = Math.max(1, Math.floor((now.getTime() - startedAt.getTime()) / 1000));

    await saveFreeSession({
      id: `free:${now.getTime()}`,
      programId: program.id,
      source: 'modo_livre_assistido',
      intent,
      startedAt: startedAt.toISOString(),
      completedAt: now.toISOString(),
      selectedExerciseIds: selected,
      durationSeconds,
      guardSnapshot: {
        cycle: guard.policy.cycle,
        guidanceLevel: guard.policy.guidanceLevel,
        maxExercises: guard.maxExercises,
        maxMinutes: guard.maxMinutes,
        plannedActivityCompletedToday: guard.plannedActivityCompletedToday,
      },
    });
    setSaved(true);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryDark} /></View>;
  }

  if (!guard?.allowed) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.eyebrow}>MODO LIVRE ASSISTIDO</Text>
        <Text style={typography.h1}>Primeiro, sua atividade do dia.</Text>
        <View style={[styles.infoCard, shadow.card]}>
          {guard?.messages.map((message) => <Text key={message} style={styles.infoText}>• {message}</Text>)}
        </View>
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Voltar ao início</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (saved) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.successCard, shadow.card]}>
          <Ionicons name="leaf-outline" size={34} color={colors.primaryDark} />
          <Text style={styles.successTitle}>Prática livre registrada</Text>
          <Text style={styles.successText}>
            Essa escolha conta como sinal de autonomia da sua jornada, mas não altera sua progressão de exercícios automaticamente.
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/jornada')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Ver Minha Jornada</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  if (startedAt) {
    const limitSeconds = (guard?.maxMinutes ?? 10) * 60;
    const reachedGuideline = elapsedSeconds >= limitSeconds;
    const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MODO LIVRE ASSISTIDO</Text>
        <Text style={typography.h1}>Pratique com controle.</Text>
        <Text style={styles.subtitle}>
          Esta janela é complementar. Não há meta de velocidade, repetições ou esforço máximo.
        </Text>

        <View style={[styles.liveCard, shadow.card]}>
          <Text style={styles.liveLabel}>TEMPO DA PRÁTICA</Text>
          <Text style={styles.liveTimer}>{minutes}:{seconds}</Text>
          {reachedGuideline ? (
            <Text style={styles.limitMessage}>
              Você chegou à duração de referência desta prática. Considere encerrar e preservar sua recuperação.
            </Text>
          ) : (
            <Text style={styles.liveHint}>Referência máxima desta janela: {guard?.maxMinutes ?? 10} min.</Text>
          )}

          <Text style={styles.liveSectionTitle}>Exercícios escolhidos</Text>
          {selected.map((id, index) => (
            <View key={id} style={styles.liveExerciseRow}>
              <Text style={styles.liveExerciseIndex}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveExerciseName}>{exerciseById[id]?.name ?? id}</Text>
                <Text style={styles.liveExerciseCue}>
                  {exerciseById[id]?.instructions?.[0] ?? 'Priorize execução confortável e controlada.'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={finish} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Concluir prática livre</Text>
        </Pressable>
        <Text style={styles.footerNote}>
          Pare antes do limite se estiver cansado ou desconfortável. Esta prática não precisa durar o tempo máximo.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      <Text style={styles.eyebrow}>MODO LIVRE ASSISTIDO</Text>
      <Text style={typography.h1}>Você já fez sua atividade principal hoje.</Text>
      <Text style={styles.subtitle}>
        Agora você pode escolher uma prática complementar curta. O Corpo Leve continua protegendo técnica, recuperação e coerência.
      </Text>

      <View style={[styles.ruleCard, shadow.card]}>
        <Text style={styles.ruleTitle}>CICLO {guard.policy.cycle} · {guard.policy.stageLabel.toUpperCase()}</Text>
        <Text style={styles.ruleText}>Até {guard.maxExercises} exercícios · até {guard.maxMinutes} min · orientação {guard.policy.guidanceLevel}.</Text>
        <Text style={styles.policyExplanation}>{guard.policy.explanation}</Text>
        <Text style={styles.noProgression}>Sem progressão automática da capacidade física.</Text>
      </View>

      <Text style={styles.sectionTitle}>Qual é sua intenção?</Text>
      {availableIntents.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => { setIntent(item.key); setSelected([]); }}
          style={[styles.intentCard, intent === item.key && styles.intentCardSelected]}
        >
          <Text style={styles.intentTitle}>{item.label}</Text>
          <Text style={styles.intentText}>{item.description}</Text>
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>Escolha seus exercícios</Text>
      <Text style={styles.sectionHint}>
        O nível de liberdade muda conforme o ciclo. As travas de segurança, equipamento e recuperação continuam valendo em todas as etapas.
      </Text>

      {visibleOptions.map((option) => {
        const definition = exerciseById[option.exerciseId];
        const isSelected = selected.includes(option.exerciseId);
        const disabled = option.availability === 'bloqueado' || option.availability === 'nao_recomendado';
        return (
          <Pressable
            key={option.exerciseId}
            disabled={disabled}
            onPress={() => toggleExercise(option)}
            style={[
              styles.exerciseCard,
              isSelected && styles.exerciseSelected,
              disabled && styles.exerciseDisabled,
            ]}
          >
            <View style={styles.exerciseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{definition?.name ?? option.exerciseId}</Text>
                <Text style={styles.exerciseMeta}>{availabilityLabel(option.availability)}</Text>
              </View>
              {isSelected ? <Ionicons name="checkmark-circle" size={22} color={colors.primaryDark} /> : null}
            </View>
            <Text style={styles.exerciseReason}>{option.reasons[0]}</Text>
          </Pressable>
        );
      })}

      <Pressable
        disabled={!selected.length}
        onPress={startPractice}
        style={[styles.primaryButton, !selected.length && styles.primaryButtonDisabled]}
      >
        <Text style={styles.primaryButtonText}>
          Iniciar prática livre ({selected.length}/{guard.maxExercises})
        </Text>
      </Pressable>

      <Text style={styles.footerNote}>
        Pare se houver dor, tontura ou mal-estar. O objetivo desta janela é praticar com controle, não acumular esforço.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg, alignSelf: 'flex-start' },
  backText: { ...typography.body, fontWeight: '700' },
  eyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 1.2, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg },
  infoText: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, marginBottom: 6 },
  ruleCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  ruleTitle: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.8 },
  ruleText: { ...typography.body, color: colors.text, lineHeight: 21, marginTop: 5, fontWeight: '700' },
  policyExplanation: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, marginTop: spacing.sm },
  noProgression: { ...typography.caption, color: colors.primaryDark, fontWeight: '800', marginTop: spacing.sm },
  sectionTitle: { ...typography.h2, marginTop: spacing.md, marginBottom: spacing.sm },
  sectionHint: { ...typography.bodyMuted, lineHeight: 20, marginBottom: spacing.md },
  intentCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  intentCardSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primaryDark },
  intentTitle: { ...typography.body, fontWeight: '800' },
  intentText: { ...typography.caption, lineHeight: 18, marginTop: 3 },
  exerciseCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  exerciseSelected: { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight },
  exerciseDisabled: { opacity: 0.45 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  exerciseName: { ...typography.body, fontWeight: '800' },
  exerciseMeta: { ...typography.caption, color: colors.primaryDark, marginTop: 2, fontWeight: '700' },
  exerciseReason: { ...typography.caption, lineHeight: 18, marginTop: spacing.xs },
  primaryButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.md, marginTop: spacing.lg },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { ...typography.body, color: colors.textInverse, fontWeight: '900', textAlign: 'center' },
  footerNote: { ...typography.caption, lineHeight: 18, textAlign: 'center', marginTop: spacing.md },
  liveCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  liveLabel: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center' },
  liveTimer: { fontSize: 48, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.sm, fontVariant: ['tabular-nums'] },
  liveHint: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
  limitMessage: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, textAlign: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  liveSectionTitle: { ...typography.h3, marginTop: spacing.lg, marginBottom: spacing.sm },
  liveExerciseRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  liveExerciseIndex: { ...typography.body, fontWeight: '900', color: colors.primaryDark, width: 22 },
  liveExerciseName: { ...typography.body, fontWeight: '800' },
  liveExerciseCue: { ...typography.caption, lineHeight: 18, marginTop: 2 },
  successCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.xxl, alignItems: 'center' },
  successTitle: { ...typography.h2, textAlign: 'center', marginTop: spacing.sm },
  successText: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm },
});
