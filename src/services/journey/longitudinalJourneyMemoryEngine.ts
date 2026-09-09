import { exerciseById } from '../../data/exercises/calisthenics';
import {
  AdaptationDecision,
  ComplementaryActivity,
  CycleTransitionContext,
  DailyAvailabilityRecord,
  EffortFeedback,
  FreeSessionExecution,
  JourneyMemoryFamily,
  LongitudinalJourneyMemory,
  ProgramDayExecution,
} from '../../types/program';

function cycleFromProgramId(programId: string): number {
  const match = /^cycle-(\d+)-/.exec(programId);
  const parsed = match ? Number(match[1]) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function emptyEfforts(): Record<EffortFeedback, number> {
  return { leve: 0, adequado: 0, dificil: 0, interrompido: 0 };
}

function progressionRank(exerciseId?: string): number {
  if (!exerciseId) return -1;
  return exerciseById[exerciseId]?.progressionOrder ?? -1;
}

export function buildLongitudinalJourneyMemory(
  executions: ProgramDayExecution[],
  decisions: AdaptationDecision[] = [],
  availability: DailyAvailabilityRecord[] = [],
  complementaryActivities: ComplementaryActivity[] = [],
  freeSessions: FreeSessionExecution[] = [],
): LongitudinalJourneyMemory {
  const completed = executions
    .filter((item) => !!item.completedAt)
    .sort((a, b) => (a.completedAt ?? a.startedAt).localeCompare(b.completedAt ?? b.startedAt));

  const families = new Map<string, JourneyMemoryFamily>();

  completed.forEach((execution) => {
    const cycle = cycleFromProgramId(execution.programId);
    execution.exercises.forEach((record) => {
      const definition = exerciseById[record.exerciseId];
      const group = definition?.progressionGroup;
      if (!group) return;

      const current = families.get(group) ?? {
        progressionGroup: group,
        firstExerciseId: record.exerciseId,
        currentExerciseId: record.exerciseId,
        highestExerciseId: record.exerciseId,
        exerciseHistory: [],
        cyclesSeen: [],
        sessions: 0,
        completedSets: 0,
        activeSeconds: 0,
        effortCounts: emptyEfforts(),
        recentEfforts: [],
        progressionCount: 0,
        regressionCount: 0,
      };

      current.sessions += 1;
      current.completedSets += record.sets.filter((set) => !!set.completedAt).length;
      current.activeSeconds += record.activeSeconds;
      current.currentExerciseId = record.exerciseId;
      current.lastPerformedAt = record.completedAt ?? execution.completedAt;

      if (!current.exerciseHistory.includes(record.exerciseId)) {
        current.exerciseHistory.push(record.exerciseId);
      }
      if (!current.cyclesSeen.includes(cycle)) {
        current.cyclesSeen.push(cycle);
      }
      if (progressionRank(record.exerciseId) > progressionRank(current.highestExerciseId)) {
        current.highestExerciseId = record.exerciseId;
      }
      if (record.effort) {
        current.effortCounts[record.effort] += 1;
        current.recentEfforts = [...current.recentEfforts, record.effort].slice(-5);
      }

      families.set(group, current);
    });
  });

  decisions.forEach((decision) => {
    const family = families.get(decision.exerciseFamily);
    if (!family) return;
    const before = progressionRank(decision.previousExerciseId);
    const after = progressionRank(decision.newExerciseId);
    if (after > before) family.progressionCount += 1;
    if (after < before) family.regressionCount += 1;
  });

  const availableMinutes = availability
    .filter((item) => item.status === 'disponivel' && typeof item.availableMinutes === 'number')
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map((item) => item.availableMinutes as number);

  const frequency = new Map<number, number>();
  availableMinutes.forEach((minutes) => {
    frequency.set(minutes, (frequency.get(minutes) ?? 0) + 1);
  });
  const preferredWindowMinutes = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];

  const activityTypes: LongitudinalJourneyMemory['movement']['activityTypes'] = {};
  complementaryActivities.forEach((activity) => {
    activityTypes[activity.activityType] = (activityTypes[activity.activityType] ?? 0) + 1;
  });

  const freeIntents: LongitudinalJourneyMemory['movement']['freeIntents'] = {};
  freeSessions.forEach((session) => {
    freeIntents[session.intent] = (freeIntents[session.intent] ?? 0) + 1;
  });

  const cycleMap = new Map<number, LongitudinalJourneyMemory['cycles'][number]>();
  completed.forEach((execution) => {
    const cycle = cycleFromProgramId(execution.programId);
    const current = cycleMap.get(cycle) ?? {
      cycle,
      programIds: [],
      completedDays: 0,
      completedSessions: 0,
      activeSeconds: 0,
    };

    if (!current.programIds.includes(execution.programId)) current.programIds.push(execution.programId);
    current.completedSessions += 1;
    current.activeSeconds += execution.activeSeconds;

    const completedDays = new Set(
      completed
        .filter((item) => cycleFromProgramId(item.programId) === cycle)
        .map((item) => `${item.programId}:${item.day}`),
    );
    current.completedDays = completedDays.size;

    const date = execution.completedAt ?? execution.startedAt;
    if (!current.startedAt || execution.startedAt < current.startedAt) current.startedAt = execution.startedAt;
    if (!current.lastActivityAt || date > current.lastActivityAt) current.lastActivityAt = date;
    cycleMap.set(cycle, current);
  });

  const shortSessions = completed.filter((item) => item.sessionComposition?.adapted).length;
  const fullSessions = completed.filter((item) => !item.sessionComposition?.adapted).length;
  const unavailableRecords = availability.filter((item) => item.status === 'indisponivel').length;

  const behaviorSignals: string[] = [];
  if (completed.length >= 2) behaviorSignals.push('mantém histórico de sessões planejadas');
  if (shortSessions >= 2) behaviorSignals.push('usa formatos adaptados ao tempo disponível');
  if (unavailableRecords >= 1 && completed.length >= 2) behaviorSignals.push('a jornada inclui interrupções e continuidade posterior');
  if (freeSessions.length >= 1) behaviorSignals.push('faz escolhas no Modo Livre Assistido');
  if (complementaryActivities.length >= 1) behaviorSignals.push('registra movimento complementar ao programa');
  if (cycleMap.size > 1) behaviorSignals.push('mantém continuidade entre ciclos');

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalCompletedSessions: completed.length,
    totalActiveSeconds: completed.reduce((sum, item) => sum + item.activeSeconds, 0),
    totalRestSeconds: completed.reduce((sum, item) => sum + item.restSeconds, 0),
    totalAdaptationDecisions: decisions.length,
    families: [...families.values()].sort((a, b) => b.sessions - a.sessions),
    availability: {
      recordedChoices: availableMinutes.length,
      shortSessions,
      fullSessions,
      unavailableRecords,
      averageAvailableMinutes: availableMinutes.length
        ? Math.round(availableMinutes.reduce((sum, value) => sum + value, 0) / availableMinutes.length)
        : undefined,
      preferredWindowMinutes,
      recentAvailableMinutes: availableMinutes.slice(-8),
    },
    movement: {
      complementaryActivities: complementaryActivities.length,
      complementaryMinutes: Math.round(
        complementaryActivities.reduce((sum, item) => sum + item.durationSeconds, 0) / 60,
      ),
      activityTypes,
      freeAssistedSessions: freeSessions.length,
      freeAssistedMinutes: Math.round(
        freeSessions.reduce((sum, item) => sum + item.durationSeconds, 0) / 60,
      ),
      freeIntents,
    },
    cycles: [...cycleMap.values()].sort((a, b) => a.cycle - b.cycle),
    behaviorSignals,
  };
}

export function buildCycleTransitionContext(
  memory: LongitudinalJourneyMemory,
  fromCycle: number,
  toCycle: number,
): CycleTransitionContext {
  const maxFamilySessions = Math.max(1, ...memory.families.map((family) => family.sessions));

  const familyPriorities = memory.families.map((family) => {
    const difficult =
      family.effortCounts.dificil + family.effortCounts.interrompido;
    const feedbackTotal = Object.values(family.effortCounts).reduce((sum, value) => sum + value, 0);
    const challengingShare = feedbackTotal ? difficult / feedbackTotal : 0;
    const underrepresented = family.sessions <= Math.max(2, Math.floor(maxFamilySessions * 0.45));

    if (challengingShare >= 0.4 || family.recentEfforts.some((effort) => effort === 'interrompido')) {
      return {
        progressionGroup: family.progressionGroup,
        recommendation: 'observar' as const,
        reason: 'o histórico recente pede cautela antes de qualquer avanço desta família',
      };
    }

    if (underrepresented) {
      return {
        progressionGroup: family.progressionGroup,
        recommendation: 'priorizar_exposicao' as const,
        reason: 'esta família apareceu menos vezes do que outras na jornada',
      };
    }

    return {
      progressionGroup: family.progressionGroup,
      recommendation: 'preservar_referencia' as const,
      reason: 'há histórico suficiente para manter a última referência conhecida e reavaliar a partir dela',
    };
  });

  const inheritedSignals = [
    `${memory.totalCompletedSessions} sessões planejadas registradas ao longo da jornada`,
    memory.availability.preferredWindowMinutes
      ? `${memory.availability.preferredWindowMinutes} minutos é a janela mais frequente no histórico disponível`
      : 'a janela de tempo preferida ainda está em construção',
    memory.availability.shortSessions > 0
      ? `${memory.availability.shortSessions} sessões foram adaptadas ao tempo disponível`
      : 'ainda há pouca evidência sobre uso de sessões curtas',
    memory.movement.freeAssistedSessions > 0
      ? `${memory.movement.freeAssistedSessions} práticas foram registradas no Modo Livre Assistido`
      : 'o Modo Livre Assistido ainda não aparece no histórico',
    memory.movement.complementaryActivities > 0
      ? `${memory.movement.complementaryActivities} atividades complementares fazem parte da jornada`
      : 'atividades complementares ainda não aparecem no histórico',
  ];

  return {
    fromCycle,
    toCycle,
    generatedAt: new Date().toISOString(),
    inheritedSignals,
    familyPriorities,
    preferredSessionMinutes: memory.availability.preferredWindowMinutes,
    guidance: [
      'usar a memória como contexto, não como obrigação de repetir a prescrição anterior',
      'preservar referências funcionais já conhecidas antes de considerar progressões',
      'não interpretar indisponibilidade de agenda como perda de capacidade física',
      'não permitir que atividades complementares substituam a atividade planejada',
      'explicar ao usuário os principais motivos de adaptações entre ciclos',
    ],
  };
}
