import { exerciseById } from '../../data/exercises/calisthenics';
import { buildBehaviorAutonomySnapshot } from './behaviorAutonomyEngine';
import {
  AdaptationDecision,
  CycleJourneySummary,
  ComplementaryActivity,
  FreeSessionExecution,
  DailyAvailabilityRecord,
  EffortFeedback,
  ExerciseFamilyJourney,
  ExerciseJourneyTimelineItem,
  ProgramDayExecution,
  ProgramDefinition,
  JourneyContinuitySummary,
} from '../../types/program';

const emptyEfforts = (): Record<EffortFeedback, number> => ({
  leve: 0, adequado: 0, dificil: 0, interrompido: 0,
});

function rankInFamily(exerciseId?: string): number {
  if (!exerciseId) return -1;
  return exerciseById[exerciseId]?.progressionOrder ?? -1;
}

export function buildExerciseFamilyJourneys(
  executions: ProgramDayExecution[],
  decisions: AdaptationDecision[] = [],
): ExerciseFamilyJourney[] {
  const families = new Map<string, ExerciseFamilyJourney>();

  executions
    .filter((item) => item.completedAt)
    .sort((a, b) => a.day - b.day)
    .forEach((execution) => {
      execution.exercises.forEach((record) => {
        const definition = exerciseById[record.exerciseId];
        const group = definition?.progressionGroup;
        if (!group) return;

        const current = families.get(group) ?? {
          progressionGroup: group,
          firstExerciseId: record.exerciseId,
          currentExerciseId: record.exerciseId,
          highestExerciseId: record.exerciseId,
          sessions: 0,
          completedSets: 0,
          activeSeconds: 0,
          effortCounts: emptyEfforts(),
          progressionCount: 0,
          regressionCount: 0,
          exerciseHistory: [],
        };

        current.sessions += 1;
        current.completedSets += record.sets.filter((set) => !!set.completedAt).length;
        current.activeSeconds += record.activeSeconds;
        current.currentExerciseId = record.exerciseId;
        current.lastPerformedAt = record.completedAt ?? execution.completedAt;

        if (!current.exerciseHistory.includes(record.exerciseId)) {
          current.exerciseHistory.push(record.exerciseId);
        }
        if (rankInFamily(record.exerciseId) > rankInFamily(current.highestExerciseId)) {
          current.highestExerciseId = record.exerciseId;
        }
        if (record.effort) current.effortCounts[record.effort] += 1;
        families.set(group, current);
      });
    });

  decisions.forEach((decision) => {
    const family = families.get(decision.exerciseFamily);
    if (!family) return;
    const before = rankInFamily(decision.previousExerciseId);
    const after = rankInFamily(decision.newExerciseId);
    if (after > before) family.progressionCount += 1;
    if (after < before) family.regressionCount += 1;
  });

  return [...families.values()].sort((a, b) => b.sessions - a.sessions);
}


function buildContinuitySummary(
  programId: string,
  executions: ProgramDayExecution[],
  availability: DailyAvailabilityRecord[],
): JourneyContinuitySummary {
  const relevantExecutions = executions
    .filter((item) => item.programId === programId && item.completedAt)
    .sort((a, b) => a.day - b.day);
  const relevantAvailability = availability
    .filter((item) => item.programId === programId)
    .sort((a, b) => a.day - b.day || a.recordedAt.localeCompare(b.recordedAt));

  const shortSessions = relevantExecutions.filter(
    (item) => item.sessionComposition?.adapted,
  ).length;
  const fullSessions = relevantExecutions.filter(
    (item) => !item.sessionComposition?.adapted,
  ).length;
  const unavailableDays = relevantAvailability.filter(
    (item) => item.status === 'indisponivel',
  ).length;

  const availableMinutes = relevantAvailability
    .filter((item) => item.status === 'disponivel' && item.availableMinutes)
    .map((item) => item.availableMinutes as number);

  const frequency = new Map<number, number>();
  availableMinutes.forEach((minutes) => frequency.set(minutes, (frequency.get(minutes) ?? 0) + 1));
  const preferredWindowMinutes = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];

  let returnCount = 0;
  const unavailableDaysSet = new Set(
    relevantAvailability.filter((item) => item.status === 'indisponivel').map((item) => item.day),
  );
  relevantExecutions.forEach((execution) => {
    const hadPriorUnavailable = [...unavailableDaysSet].some((day) => day < execution.day);
    const previousExecutionDay = relevantExecutions
      .filter((item) => item.day < execution.day)
      .map((item) => item.day)
      .sort((a, b) => b - a)[0] ?? 0;
    const latestUnavailableBefore = [...unavailableDaysSet]
      .filter((day) => day < execution.day)
      .sort((a, b) => b - a)[0];
    if (hadPriorUnavailable && latestUnavailableBefore && latestUnavailableBefore > previousExecutionDay) {
      returnCount += 1;
    }
  });

  return {
    shortSessions,
    fullSessions,
    unavailableDays,
    returnCount,
    averageAvailableMinutes: availableMinutes.length
      ? Math.round(availableMinutes.reduce((sum, value) => sum + value, 0) / availableMinutes.length)
      : undefined,
    preferredWindowMinutes,
    lastAvailabilityStatus: relevantAvailability.at(-1)?.status,
  };
}

export function buildCycleJourneySummary(
  program: ProgramDefinition,
  executions: ProgramDayExecution[],
  decisions: AdaptationDecision[] = [],
  availability: DailyAvailabilityRecord[] = [],
  complementaryActivities: ComplementaryActivity[] = [],
  freeSessions: FreeSessionExecution[] = [],
): CycleJourneySummary {
  const relevant = executions.filter(
    (item) => item.programId === program.id && item.completedAt,
  );
  const relevantDecisions = decisions.filter((item) => item.programId === program.id);
  const completedDays = new Set(relevant.map((item) => item.day)).size;
  const families = buildExerciseFamilyJourneys(relevant, relevantDecisions);

  const continuity = buildContinuitySummary(program.id, relevant, availability);
  const behavior = buildBehaviorAutonomySnapshot(
    program.id,
    relevant,
    continuity,
    complementaryActivities,
    freeSessions,
  );

  return {
    programId: program.id,
    cycle: program.cycle,
    durationDays: program.durationDays,
    completedDays,
    completionRate: Math.round((completedDays / program.durationDays) * 100),
    activeSeconds: relevant.reduce((sum, item) => sum + item.activeSeconds, 0),
    restSeconds: relevant.reduce((sum, item) => sum + item.restSeconds, 0),
    exerciseFamilies: families,
    adaptationCount: relevantDecisions.length,
    progressionCount: families.reduce((sum, item) => sum + item.progressionCount, 0),
    regressionCount: families.reduce((sum, item) => sum + item.regressionCount, 0),
    updatedAt: new Date().toISOString(),
    continuity,
    behavior,
  };
}

export function cycleFeedback(summary: CycleJourneySummary): string {
  if (!summary.completedDays) {
    return 'Sua jornada começará a ganhar detalhes conforme as sessões forem registradas.';
  }
  const mostPracticed = summary.exerciseFamilies[0];
  const progress = summary.progressionCount;
  const adaptations = summary.adaptationCount;
  const continuity = summary.continuity;

  if (continuity.returnCount > 0) {
    return `Você retomou sua jornada ${continuity.returnCount} vez${continuity.returnCount > 1 ? 'es' : ''} após um dia sem disponibilidade. Retomar faz parte da consistência, e suas sessões curtas continuam contando como prática real.`;
  }

  if (progress > 0 && mostPracticed) {
    return `Você já consolidou prática em ${mostPracticed.progressionGroup} e registrou ${progress} progressão${progress > 1 ? 'ões' : ''}. O programa continuará usando seus feedbacks para decidir quando manter ou avançar.`;
  }
  if (adaptations > 0) {
    return `O Corpo Leve já realizou ${adaptations} ajuste${adaptations > 1 ? 's' : ''} com base no histórico. O objetivo é manter uma evolução gradual, respeitando técnica e recuperação.`;
  }
  return 'Seu histórico está sendo construído. A regularidade e os feedbacks de cada exercício ajudarão a personalizar os próximos treinos.';
}


export function buildExerciseFamilyTimeline(
  progressionGroup: string,
  executions: ProgramDayExecution[],
  decisions: AdaptationDecision[] = [],
): ExerciseJourneyTimelineItem[] {
  const relevantDecisions = decisions.filter(
    (decision) => decision.exerciseFamily === progressionGroup,
  );
  let previousExerciseId: string | undefined;

  return executions
    .filter((execution) => execution.completedAt)
    .sort((a, b) => a.day - b.day)
    .flatMap((execution) =>
      execution.exercises
        .filter((record) => exerciseById[record.exerciseId]?.progressionGroup === progressionGroup)
        .map((record) => {
          const previousRank = rankInFamily(previousExerciseId);
          const currentRank = rankInFamily(record.exerciseId);
          const transition =
            !previousExerciseId ? 'inicio'
            : currentRank > previousRank ? 'avancou'
            : currentRank < previousRank ? 'regrediu'
            : 'manteve';

          const item: ExerciseJourneyTimelineItem = {
            day: execution.day,
            date: record.completedAt ?? execution.completedAt ?? execution.startedAt,
            exerciseId: record.exerciseId,
            previousExerciseId,
            transition,
            effort: record.effort,
            setsCompleted: record.sets.filter((set) => !!set.completedAt).length,
            activeSeconds: record.activeSeconds,
            repsCompleted: record.sets.reduce(
              (sum, set) => sum + (set.completedReps ?? 0),
              0,
            ) || undefined,
            plannedSeconds: record.sets.reduce(
              (sum, set) => sum + (set.plannedSeconds ?? 0),
              0,
            ) || undefined,
            adaptation: relevantDecisions.find(
              (decision) => decision.targetDay === execution.day,
            ),
          };

          previousExerciseId = record.exerciseId;
          return item;
        }),
    );
}
