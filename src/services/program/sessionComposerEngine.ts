import { exerciseById } from '../../data/exercises/calisthenics';
import {
  ExercisePrescription,
  ProgramDay,
  ProgramDayExecution,
  SessionAvailabilityOption,
  SessionCompositionMeta,
} from '../../types/program';

const TARGET_MINUTES: Record<Exclude<SessionAvailabilityOption, 'completo'>, number> = {
  '8_min': 8,
  '12_min': 12,
  '20_min': 20,
};

function familyOf(exerciseId: string): string {
  const exercise = exerciseById[exerciseId];
  return exercise?.progressionGroup ?? exercise?.category ?? 'geral';
}

function estimatePrescriptionSeconds(item: ExercisePrescription): number {
  const workPerSet = item.seconds ?? Math.max(20, (item.reps ?? 8) * 4);
  return item.sets * workPerSet
    + Math.max(0, item.sets - 1) * item.restBetweenSetsSeconds
    + item.restAfterExerciseSeconds;
}

function recentFamilyCounts(executions: ProgramDayExecution[], beforeDay: number): Record<string, number> {
  const recent = executions
    .filter((item) => item.completedAt && item.day < beforeDay)
    .sort((a, b) => b.day - a.day)
    .slice(0, 4);
  const counts: Record<string, number> = {};
  for (const execution of recent) {
    for (const record of execution.exercises) {
      const family = familyOf(record.exerciseId);
      counts[family] = (counts[family] ?? 0) + 1;
    }
  }
  return counts;
}

function latestEffortForFamily(executions: ProgramDayExecution[], family: string, beforeDay: number) {
  const records = executions
    .filter((item) => item.completedAt && item.day < beforeDay)
    .sort((a, b) => b.day - a.day)
    .flatMap((item) => item.exercises)
    .filter((item) => familyOf(item.exerciseId) === family && item.effort);
  return records[0]?.effort;
}

function compactPrescription(item: ExercisePrescription, targetMinutes: number): ExercisePrescription {
  if (targetMinutes >= 20) return item;
  return {
    ...item,
    sets: Math.min(item.sets, targetMinutes <= 8 ? 1 : 2),
    restAfterExerciseSeconds: Math.min(item.restAfterExerciseSeconds, 45),
  };
}

export function composeSessionForAvailability(
  day: ProgramDay,
  availability: SessionAvailabilityOption,
  executions: ProgramDayExecution[],
): { day: ProgramDay; meta: SessionCompositionMeta } {
  if (availability === 'completo') {
    return {
      day,
      meta: {
        availability,
        plannedMinutes: day.estimatedMinutes,
        targetMinutes: day.estimatedMinutes,
        adapted: false,
        selectedExerciseIds: day.exercises.map((item) => item.exerciseId),
        omittedExerciseIds: [],
        prioritizedFamilies: [],
        reasons: ['treino_completo'],
      },
    };
  }

  const targetMinutes = TARGET_MINUTES[availability];
  const budgetSeconds = targetMinutes * 60;
  const familyCounts = recentFamilyCounts(executions, day.day);

  const candidates = day.exercises.map((item, index) => {
    const family = familyOf(item.exerciseId);
    const exercise = exerciseById[item.exerciseId];
    const isWarmup = exercise?.category === 'aquecimento';
    const isMobility = exercise?.category === 'mobilidade';
    const recentCount = familyCounts[family] ?? 0;
    const latestEffort = latestEffortForFamily(executions, family, day.day);

    let score = 100 - recentCount * 14;
    if (isWarmup) score = index === 0 ? 1000 : 160;
    if (isMobility) score += 25;
    if (latestEffort === 'interrompido') score -= 45;
    if (latestEffort === 'dificil') score -= 20;

    return { item: compactPrescription(item, targetMinutes), family, score, index, isWarmup };
  });

  const selected: typeof candidates = [];
  let usedSeconds = 0;

  const warmup = candidates.find((item) => item.isWarmup);
  if (warmup) {
    selected.push(warmup);
    usedSeconds += estimatePrescriptionSeconds(warmup.item);
  }

  for (const candidate of candidates
    .filter((item) => item !== warmup)
    .sort((a, b) => b.score - a.score || a.index - b.index)) {
    const seconds = estimatePrescriptionSeconds(candidate.item);
    if (usedSeconds + seconds <= budgetSeconds || selected.length < 2) {
      selected.push(candidate);
      usedSeconds += seconds;
    }
  }

  selected.sort((a, b) => a.index - b.index);
  const selectedIds = selected.map((item) => item.item.exerciseId);
  const omitted = day.exercises.filter((item) => !selectedIds.includes(item.exerciseId));
  const prioritizedFamilies = selected
    .filter((item) => !item.isWarmup && (familyCounts[item.family] ?? 0) === Math.min(
      ...candidates.filter((candidate) => !candidate.isWarmup).map((candidate) => familyCounts[candidate.family] ?? 0),
    ))
    .map((item) => item.family)
    .filter((value, index, all) => all.indexOf(value) === index);

  return {
    day: {
      ...day,
      title: `${day.title} · Sessão de ${targetMinutes} min`,
      estimatedMinutes: targetMinutes,
      exercises: selected.map((item) => item.item),
    },
    meta: {
      availability,
      plannedMinutes: day.estimatedMinutes,
      targetMinutes,
      adapted: true,
      selectedExerciseIds: selectedIds,
      omittedExerciseIds: omitted.map((item) => item.exerciseId),
      prioritizedFamilies,
      reasons: prioritizedFamilies.length
        ? ['tempo_disponivel', 'equilibrio_entre_familias', 'historico_recente']
        : ['tempo_disponivel', 'preservacao_da_sessao'],
    },
  };
}
