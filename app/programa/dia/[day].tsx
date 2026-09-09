import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { AvatarMovementGuide } from '../../../src/components/AvatarMovementGuide';
import { colors, radius, shadow, spacing, typography } from '../../../src/constants/theme';
import { exerciseById } from '../../../src/data/exercises/calisthenics';
import { generateCycle1Program } from '../../../src/services/program/cycle1Engine';
import { adaptProgramForHistory, getAdaptationDecisionsForDay, summarizeAdaptationForDay } from '../../../src/services/program/adaptiveProgramEngine';
import { loadAssessmentResult } from '../../../src/services/storage/assessmentStorage';
import { loadProgramExecutions, saveProgramDayExecution } from '../../../src/services/workout/executionStorage';
import { upsertAdaptationDecisions } from '../../../src/services/journey/adaptationStorage';
import { loadDailyAvailability, upsertDailyAvailability } from '../../../src/services/journey/availabilityStorage';
import { buildAvailabilityInsight } from '../../../src/services/journey/availabilityInsights';
import { composeSessionForAvailability } from '../../../src/services/program/sessionComposerEngine';
import { AvatarVariant, EffortFeedback, ExerciseExecutionRecord, ProgramDefinition, ProgramDay, SessionAvailabilityOption, SessionCompositionMeta, SetExecutionRecord } from '../../../src/types/program';

 type Mode = 'idle' | 'active' | 'rest' | 'feedback' | 'done';

function formatSeconds(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const seconds = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function ProgramDayScreen() {
  const params = useLocalSearchParams<{ day: string }>();
  const requestedDay = Math.max(1, Math.min(21, Number(params.day ?? '1')));
  const [program, setProgram] = useState<ProgramDefinition | null>(null);
  const [avatarVariant, setAvatarVariant] = useState<AvatarVariant>('neutro');
  const [loading, setLoading] = useState(true);
  const [adaptationMessage, setAdaptationMessage] = useState<string | null>(null);
  const [baseDay, setBaseDay] = useState<ProgramDay | null>(null);
  const [sessionDay, setSessionDay] = useState<ProgramDay | null>(null);
  const [sessionComposition, setSessionComposition] = useState<SessionCompositionMeta | null>(null);
  const [availabilityChosen, setAvailabilityChosen] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<import('../../../src/types/program').ProgramDayExecution[]>([]);
  const [suggestedAvailability, setSuggestedAvailability] = useState<SessionAvailabilityOption | undefined>();
  const [availabilityInsightText, setAvailabilityInsightText] = useState<string | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [mode, setMode] = useState<Mode>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [records, setRecords] = useState<ExerciseExecutionRecord[]>([]);
  const setStartedAtRef = useRef<number | null>(null);
  const restStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    Promise.all([loadAssessmentResult(), loadProgramExecutions(), loadDailyAvailability()])
      .then(([result, executions, availability]) => {
        if (result) {
          const baseProgram = generateCycle1Program(result.profile);
          const adaptedProgram = adaptProgramForHistory(baseProgram, executions);
          const decisions = getAdaptationDecisionsForDay(baseProgram, requestedDay, executions);
          setProgram(adaptedProgram);
          const adaptedDay = adaptedProgram.days.find((item) => item.day === requestedDay) ?? null;
          setBaseDay(adaptedDay);
          setSessionDay(adaptedDay);
          setExecutionHistory(executions);
          const availabilityInsight = buildAvailabilityInsight(adaptedProgram.id, availability);
          setSuggestedAvailability(availabilityInsight.suggestedOption);
          setAvailabilityInsightText(availabilityInsight.confidence === 'insuficiente' ? null : availabilityInsight.reason);
          setAvailabilityChosen(false);
          setSessionComposition(null);
          setAdaptationMessage(summarizeAdaptationForDay(baseProgram, requestedDay, executions));
          setAvatarVariant(result.profile.avatarVariant ?? 'neutro');
          void upsertAdaptationDecisions(decisions);
        }
      })
      .finally(() => setLoading(false));
  }, [requestedDay]);

  const day = sessionDay ?? baseDay ?? program?.days.find((item) => item.day === requestedDay);
  const prescription = day?.exercises[exerciseIndex];
  const exercise = prescription ? exerciseById[prescription.exerciseId] : undefined;

  useEffect(() => {
    if (mode !== 'active' || setStartedAtRef.current === null) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (setStartedAtRef.current ?? Date.now())) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [mode, exerciseIndex, setNumber]);

  useEffect(() => {
    if (mode !== 'rest' || restStartedAtRef.current === null) return;
    const id = setInterval(() => {
      const spent = Math.floor((Date.now() - (restStartedAtRef.current ?? Date.now())) / 1000);
      const next = Math.max(0, restRemaining - spent);
      if (next <= 0) {
        clearInterval(id);
        restStartedAtRef.current = null;
        setRestRemaining(0);
        setElapsed(0);
        setMode('idle');
      } else {
        setElapsed(next);
      }
    }, 250);
    return () => clearInterval(id);
  }, [mode, restRemaining]);

  const progress = useMemo(() => {
    if (!day?.exercises.length) return 0;
    return Math.min(1, exerciseIndex / day.exercises.length);
  }, [day?.exercises.length, exerciseIndex]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!program || !day || !prescription || !exercise) {
    return (
      <View style={styles.center}>
        <Text style={typography.h2}>Não foi possível carregar este dia.</Text>
        <PrimaryButton label="Voltar" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  function chooseAvailability(option: SessionAvailabilityOption) {
    if (!baseDay || !program) return;
    const composed = composeSessionForAvailability(baseDay, option, executionHistory);
    setSessionDay(composed.day);
    setSessionComposition(composed.meta);
    setExerciseIndex(0);
    setSetNumber(1);
    setRecords([]);
    setAvailabilityChosen(true);
    void upsertDailyAvailability({
      id: `${program.id}:${requestedDay}`,
      programId: program.id,
      day: requestedDay,
      status: 'disponivel',
      option,
      plannedMinutes: baseDay.estimatedMinutes,
      availableMinutes: composed.meta.targetMinutes,
      recordedAt: new Date().toISOString(),
    });
  }

  function markUnavailableToday() {
    if (!baseDay || !program) return;
    void upsertDailyAvailability({
      id: `${program.id}:${requestedDay}`,
      programId: program.id,
      day: requestedDay,
      status: 'indisponivel',
      plannedMinutes: baseDay.estimatedMinutes,
      recordedAt: new Date().toISOString(),
    });
    router.replace('/(tabs)/jornada');
  }

  if (!availabilityChosen && baseDay) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>CICLO 1 · DIA {requestedDay}/21</Text>
        <Text style={typography.h1}>Quanto tempo você tem hoje?</Text>
        <Text style={styles.availabilityIntro}>
          Escolha o tempo disponível. O Corpo Leve ajusta a sessão sem transformar pouco tempo em treino excessivamente intenso.
        </Text>
        <View style={[styles.availabilityCard, shadow.card]}>
          {availabilityInsightText ? (
            <View style={styles.suggestionInsight}>
              <Text style={styles.suggestionEyebrow}>SUGESTÃO PARA HOJE</Text>
              <Text style={styles.suggestionText}>{availabilityInsightText}</Text>
            </View>
          ) : null}
          <AvailabilityButton minutes="8 min" note="Sessão essencial" suggested={suggestedAvailability === '8_min'} onPress={() => chooseAvailability('8_min')} />
          <AvailabilityButton minutes="12 min" note="Sessão equilibrada" suggested={suggestedAvailability === '12_min'} onPress={() => chooseAvailability('12_min')} />
          <AvailabilityButton minutes="20 min" note="Sessão ampliada" suggested={suggestedAvailability === '20_min'} onPress={() => chooseAvailability('20_min')} />
          <AvailabilityButton minutes={`Completo · ${baseDay.estimatedMinutes} min`} note="Planejamento original" suggested={suggestedAvailability === 'completo'} onPress={() => chooseAvailability('completo')} />
        </View>
        <Pressable onPress={markUnavailableToday} style={({ pressed }) => [styles.cantTodayButton, pressed && { opacity: 0.75 }]}>
          <Text style={styles.cantTodayTitle}>Hoje não consigo</Text>
          <Text style={styles.cantTodayText}>Sem problema. Registramos sua disponibilidade e a jornada continua.</Text>
        </Pressable>
        <Text style={styles.footerNote}>
          Sessões mais curtas continuam fazendo parte da sua jornada. O motor considera também as famílias de movimentos realizadas recentemente.
        </Text>
      </ScrollView>
    );
  }

  function startSet() {
    if (!sessionStartedAt) setSessionStartedAt(new Date().toISOString());
    setElapsed(0);
    setStartedAtRef.current = Date.now();
    setMode('active');
  }

  function completeSet() {
    if (!setStartedAtRef.current) return;
    const completedAt = new Date().toISOString();
    const activeSeconds = Math.max(1, Math.floor((Date.now() - setStartedAtRef.current) / 1000));
    const setRecord: SetExecutionRecord = {
      setNumber,
      startedAt: new Date(setStartedAtRef.current).toISOString(),
      completedAt,
      activeSeconds,
      plannedReps: prescription?.reps,
      completedReps: prescription?.reps,
      plannedSeconds: prescription?.seconds,
      restSeconds: 0,
    };

    setRecords((current) => {
      const existing = current.find((item) => item.exerciseId === prescription?.exerciseId);
      if (!existing) {
        return [...current, {
          exerciseId: prescription!.exerciseId,
          startedAt: setRecord.startedAt,
          activeSeconds,
          restSeconds: 0,
          sets: [setRecord],
        }];
      }
      return current.map((item) => item.exerciseId === prescription?.exerciseId
        ? { ...item, activeSeconds: item.activeSeconds + activeSeconds, sets: [...item.sets, setRecord] }
        : item);
    });

    setStartedAtRef.current = null;
    setElapsed(0);

    if (setNumber < prescription.sets) {
      const rest = prescription.restBetweenSetsSeconds;
      setRecords((current) => current.map((item) => item.exerciseId === prescription.exerciseId
        ? { ...item, restSeconds: item.restSeconds + rest, sets: item.sets.map((set) => set.setNumber === setNumber ? { ...set, restSeconds: rest } : set) }
        : item));
      setSetNumber((value) => value + 1);
      beginRest(rest);
      return;
    }

    setMode('feedback');
  }

  function beginRest(seconds: number) {
    restStartedAtRef.current = Date.now();
    setRestRemaining(seconds);
    setElapsed(seconds);
    setMode('rest');
  }

  function skipRest() {
    restStartedAtRef.current = null;
    setRestRemaining(0);
    setElapsed(0);
    setMode('idle');
  }

  function applyFeedback(effort: EffortFeedback) {
    const exerciseId = prescription.exerciseId;
    const completedAt = new Date().toISOString();
    const updatedRecords = records.map((item) => item.exerciseId === exerciseId
      ? { ...item, effort, completedAt }
      : item);
    setRecords(updatedRecords);

    const isLast = exerciseIndex >= day.exercises.length - 1;
    if (isLast) {
      finishDay(updatedRecords);
      return;
    }

    const rest = prescription.restAfterExerciseSeconds;
    setRecords((current) => current.map((item) => item.exerciseId === exerciseId
      ? { ...item, restSeconds: item.restSeconds + rest }
      : item));
    setExerciseIndex((value) => value + 1);
    setSetNumber(1);
    beginRest(rest);
  }

  async function finishDay(finalRecords: ExerciseExecutionRecord[]) {
    const completedAt = new Date().toISOString();
    const activeSeconds = finalRecords.reduce((sum, item) => sum + item.activeSeconds, 0);
    const restSeconds = finalRecords.reduce((sum, item) => sum + item.restSeconds, 0);
    const startedAt = sessionStartedAt ?? completedAt;
    const totalSeconds = Math.max(activeSeconds + restSeconds, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

    await saveProgramDayExecution({
      programId: program.id,
      day: requestedDay,
      startedAt,
      completedAt,
      totalSeconds,
      activeSeconds,
      restSeconds,
      exercises: finalRecords,
      sessionComposition: sessionComposition ?? undefined,
    });
    setRecords(finalRecords);
    setMode('done');
  }

  if (mode === 'done') {
    const active = records.reduce((sum, item) => sum + item.activeSeconds, 0);
    const rest = records.reduce((sum, item) => sum + item.restSeconds, 0);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.doneCard, shadow.card]}>
          <Text style={styles.eyebrow}>DIA {requestedDay} CONCLUÍDO</Text>
          <Text style={typography.h1}>Treino registrado ✓</Text>
          <Text style={styles.message}>{day.disciplineMessage}</Text>
          <Metric label="Tempo em exercícios" value={formatSeconds(active)} />
          <Metric label="Descanso planejado" value={formatSeconds(rest)} />
          <Metric label="Exercícios" value={`${day.exercises.length}`} />
        </View>
        <View style={styles.freeAfterDoneCard}>
          <Text style={styles.freeAfterDoneTitle}>Ainda quer se movimentar?</Text>
          <Text style={styles.freeAfterDoneText}>
            O Modo Livre Assistido libera uma prática complementar curta, respeitando o que você já fez hoje.
          </Text>
          <PrimaryButton label="Abrir Modo Livre Assistido" variant="outline" onPress={() => router.push('/jornada/modo-livre')} style={{ marginTop: spacing.sm }} />
        </View>
        {requestedDay < 21 && <PrimaryButton label={`Ver Dia ${requestedDay + 1}`} onPress={() => router.replace(`/programa/dia/${requestedDay + 1}`)} />}
        <PrimaryButton label="Voltar ao início" variant="outline" onPress={() => router.replace('/(tabs)')} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>CICLO 1 · DIA {requestedDay}/21</Text>
      <Text style={typography.h1}>{day.title}</Text>
      <Text style={styles.subtitle}>{day.focus} · ≈ {day.estimatedMinutes} min</Text>
      {sessionComposition?.adapted ? (
        <View style={styles.sessionAdaptCard}>
          <Text style={styles.adaptationEyebrow}>SESSÃO AJUSTADA AO SEU TEMPO</Text>
          <Text style={styles.sessionAdaptText}>
            {sessionComposition.targetMinutes} min · {day.exercises.length} exercícios selecionados
          </Text>
          <Text style={styles.sessionAdaptHint}>
            O Corpo Leve considerou seu histórico recente para manter a jornada equilibrada.
          </Text>
        </View>
      ) : null}
      {adaptationMessage ? (
        <View style={styles.adaptationCard}>
          <Text style={styles.adaptationEyebrow}>TREINO ADAPTADO</Text>
          <Text style={styles.adaptationText}>{adaptationMessage}</Text>
        </View>
      ) : null}
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>

      <View style={[styles.exerciseCard, shadow.card]}>
        <Text style={styles.exerciseCount}>EXERCÍCIO {exerciseIndex + 1} DE {day.exercises.length}</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.prescription}>
          Série {setNumber} de {prescription.sets} · {prescription.reps ? `${prescription.reps} repetições` : `${prescription.seconds ?? 0}s`}
        </Text>

        <AvatarMovementGuide
          variant={avatarVariant}
          exercise={exercise}
          active={mode !== 'rest' && mode !== 'feedback'}
        />

        {exercise.instructions.map((instruction) => <Text key={instruction} style={styles.instruction}>• {instruction}</Text>)}
        <Text style={styles.safety}>Técnica primeiro: {exercise.safetyCues[0]}</Text>

        {mode === 'rest' ? (
          <View style={styles.timerArea}>
            <Text style={styles.timerLabel}>DESCANSO</Text>
            <Text style={styles.timer}>{formatSeconds(elapsed)}</Text>
            <Text style={styles.helper}>O intervalo faz parte do treino. Use-o para recuperar a respiração e manter a técnica.</Text>
            <PrimaryButton label="Pular descanso" variant="outline" onPress={skipRest} style={{ marginTop: spacing.md }} />
          </View>
        ) : mode === 'feedback' ? (
          <View style={styles.feedbackArea}>
            <Text style={styles.timerLabel}>COMO FOI?</Text>
            <Text style={styles.helper}>Esse feedback ajuda o motor a decidir quando manter, regredir ou avançar a variação.</Text>
            <EffortButton label="Muito leve" onPress={() => applyFeedback('leve')} />
            <EffortButton label="Adequado" onPress={() => applyFeedback('adequado')} />
            <EffortButton label="Difícil" onPress={() => applyFeedback('dificil')} />
            <EffortButton label="Precisei interromper" onPress={() => applyFeedback('interrompido')} />
          </View>
        ) : (
          <View style={styles.timerArea}>
            <Text style={styles.timerLabel}>{mode === 'active' ? 'TEMPO DE EXECUÇÃO' : 'PRONTO PARA COMEÇAR'}</Text>
            <Text style={styles.timer}>{formatSeconds(elapsed)}</Text>
            {mode === 'active' ? (
              <PrimaryButton label="■ Concluir série" onPress={completeSet} style={{ marginTop: spacing.md }} />
            ) : (
              <PrimaryButton label="▶ Iniciar série" onPress={startSet} style={{ marginTop: spacing.md }} />
            )}
          </View>
        )}
      </View>

      <Text style={styles.footerNote}>O cronômetro registra sua execução; não é uma competição de velocidade. Priorize controle e pare se sentir dor ou mal-estar.</Text>
    </ScrollView>
  );
}

function AvailabilityButton({
  minutes,
  note,
  suggested = false,
  onPress,
}: {
  minutes: string;
  note: string;
  suggested?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.availabilityButton,
        suggested && styles.availabilityButtonSuggested,
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={styles.availabilityLabelArea}>
        <View style={styles.availabilityTitleRow}>
          <Text style={styles.availabilityMinutes}>{minutes}</Text>
          {suggested ? <Text style={styles.suggestedBadge}>SUGERIDO</Text> : null}
        </View>
        <Text style={styles.availabilityNote}>{note}</Text>
      </View>
      <Text style={styles.availabilityArrow}>›</Text>
    </Pressable>
  );
}

function EffortButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.effortButton, pressed && { opacity: 0.75 }]}>
      <Text style={styles.effortText}>{label}</Text>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metricRow}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  eyebrow: { ...typography.caption, fontWeight: '800', color: colors.primaryDark, letterSpacing: 1, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  availabilityIntro: { ...typography.bodyMuted, lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.lg },
  cantTodayButton: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  cantTodayTitle: { ...typography.body, fontWeight: '800', color: colors.text },
  cantTodayText: { ...typography.caption, lineHeight: 18, marginTop: 3 },
  availabilityCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.sm },
  suggestionInsight: { padding: spacing.md, margin: spacing.xs, borderRadius: radius.md, backgroundColor: colors.primaryLight },
  suggestionEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.7 },
  suggestionText: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, marginTop: 4 },
  availabilityButtonSuggested: { backgroundColor: colors.primaryLight, borderRadius: radius.md },
  availabilityLabelArea: { flex: 1 },
  availabilityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  suggestedBadge: { ...typography.caption, fontSize: 9, color: colors.primaryDark, fontWeight: '900', borderWidth: 1, borderColor: colors.primaryDark, borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 3 },
  availabilityButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  availabilityMinutes: { ...typography.h3, color: colors.text },
  availabilityNote: { ...typography.caption, marginTop: 3 },
  availabilityArrow: { fontSize: 30, color: colors.primaryDark, lineHeight: 30 },
  sessionAdaptCard: { marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primaryLight },
  sessionAdaptText: { ...typography.body, fontWeight: '800', marginTop: 4 },
  sessionAdaptHint: { ...typography.caption, lineHeight: 18, marginTop: 3 },
  adaptationCard: {
    marginBottom: spacing.md, padding: spacing.sm,
    borderRadius: radius.md, backgroundColor: '#101B16',
    borderWidth: 1, borderColor: '#284C3B',
  },
  adaptationEyebrow: {
    ...typography.caption, color: '#66E39C',
    fontWeight: '900', letterSpacing: 0.7,
  },
  adaptationText: {
    ...typography.bodyMuted, color: '#DDE8E1',
    lineHeight: 19, marginTop: 3,
  },
    progressTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginBottom: spacing.lg },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  exerciseCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  exerciseCount: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },
  exerciseName: { ...typography.h2, marginTop: spacing.xs },
  prescription: { ...typography.body, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.md },
  instruction: { ...typography.bodyMuted, lineHeight: 21, marginBottom: spacing.xs },
  safety: { ...typography.caption, lineHeight: 18, marginTop: spacing.sm, padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
  timerArea: { alignItems: 'center', paddingTop: spacing.xl },
  timerLabel: { ...typography.caption, color: colors.primaryDark, fontWeight: '800', letterSpacing: 1 },
  timer: { fontSize: 54, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'], marginTop: spacing.sm },
  helper: { ...typography.bodyMuted, textAlign: 'center', lineHeight: 21, marginTop: spacing.sm },
  feedbackArea: { paddingTop: spacing.lg },
  effortButton: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, backgroundColor: colors.surfaceAlt },
  effortText: { ...typography.body, textAlign: 'center', fontWeight: '600' },
  footerNote: { ...typography.caption, lineHeight: 18, textAlign: 'center', marginTop: spacing.lg },
  doneCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  freeAfterDoneCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  freeAfterDoneTitle: { ...typography.h3, color: colors.primaryDark },
  freeAfterDoneText: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, marginTop: spacing.xs },
  message: { ...typography.bodyMuted, lineHeight: 22, marginVertical: spacing.lg },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  metricLabel: { ...typography.bodyMuted },
  metricValue: { ...typography.body, fontWeight: '700' },
});
