import { AssessmentProfile, ObjetivoPrincipal } from '../../types/assessment';
import {
  ExercisePrescription,
  LongitudinalJourneyMemory,
  PlannedAutonomyOption,
  ProgramDay,
  ProgramDefinition,
} from '../../types/program';
import { exerciseById } from '../../data/exercises/calisthenics';
import { calculatePostExerciseRestSeconds, calculateRestSeconds } from '../workout/restEngine';
import { getProgressionFamily, selectExerciseForProfile } from '../workout/progressionEngine';
import { buildCycleTransitionContext } from '../journey/longitudinalJourneyMemoryEngine';

function phaseForDay(day: number): 1 | 2 | 3 {
  if (day <= 28) return 1;
  if (day <= 56) return 2;
  return 3;
}

function prescription(
  profile: AssessmentProfile,
  day: number,
  exerciseId: string,
  sets: number,
  reps?: number,
  seconds?: number,
  note?: string,
): ExercisePrescription {
  const exercise = exerciseById[exerciseId];
  const between = exercise ? calculateRestSeconds(profile, exercise, phaseForDay(day)) : 45;
  return {
    exerciseId,
    sets,
    reps,
    seconds,
    executionMode: seconds ? 'tempo' : 'repeticoes',
    restBetweenSetsSeconds: between,
    restAfterExerciseSeconds: calculatePostExerciseRestSeconds(between),
    note,
  };
}

function familyBlockedByRegion(profile: AssessmentProfile, group: string): boolean {
  const upper = profile.regioesAtencao.some((item) =>
    ['ombro', 'cotovelo', 'punho', 'coluna'].includes(item),
  );
  const lower = profile.regioesAtencao.some((item) =>
    ['quadril', 'joelho', 'tornozelo', 'coluna'].includes(item),
  );
  if (['pushup', 'pull'].includes(group)) return upper;
  if (['squat', 'lunge'].includes(group)) return lower;
  return false;
}

function hasAttentionConflict(profile: AssessmentProfile, exerciseId: string): boolean {
  const exercise = exerciseById[exerciseId];
  if (!exercise?.avoidWhen?.length) return false;
  const attention = new Set([...profile.regioesAtencao, ...profile.pontosAtencao]);
  return exercise.avoidWhen.some((item) => attention.has(item));
}

function hasEquipment(profile: AssessmentProfile, exerciseId: string): boolean {
  const exercise = exerciseById[exerciseId];
  if (!exercise) return false;
  if (!exercise.equipment.length || exercise.equipment.includes('nenhum')) return true;
  if (exerciseId === 'pullup-assisted') {
    return profile.recursosDisponiveis.includes('barra') &&
      profile.recursosDisponiveis.includes('elastico');
  }
  return exercise.equipment.some((item) => profile.recursosDisponiveis.includes(item));
}

function eligibleExercise(profile: AssessmentProfile, exerciseId: string, group: string): boolean {
  const exercise = exerciseById[exerciseId];
  return !!exercise &&
    exercise.levels.includes(profile.nivelCalculado) &&
    hasEquipment(profile, exerciseId) &&
    !hasAttentionConflict(profile, exerciseId) &&
    !familyBlockedByRegion(profile, group);
}

function memoryFamily(memory: LongitudinalJourneyMemory, group: string) {
  return memory.families.find((item) => item.progressionGroup === group);
}

function inheritedReference(
  group: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): string {
  const family = memoryFamily(memory, group);
  const current = family?.currentExerciseId;
  if (current && eligibleExercise(profile, current, group)) return current;
  return selectExerciseForProfile(group, profile)?.id ?? {
    pushup: 'push-wall',
    squat: 'squat-chair',
    lunge: 'split-static-supported',
    pull: 'scapular-row',
    plank: 'plank-knee',
    core: 'core-deadbug',
  }[group] ?? 'bird-dog';
}

function stableFamily(memory: LongitudinalJourneyMemory, group: string): boolean {
  const family = memoryFamily(memory, group);
  if (!family || family.recentEfforts.length < 3) return false;
  const lastThree = family.recentEfforts.slice(-3);
  return lastThree.every((item) => item === 'leve' || item === 'adequado') &&
    !family.recentEfforts.slice(-5).includes('interrompido');
}

function autonomousChoices(
  group: string,
  defaultExerciseId: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): PlannedAutonomyOption | null {
  const transition = buildCycleTransitionContext(memory, 3, 4)
    .familyPriorities.find((item) => item.progressionGroup === group);

  if (transition?.recommendation === 'observar') return null;

  const family = getProgressionFamily(group);
  const index = family.findIndex((item) => item.id === defaultExerciseId);
  if (index < 0) return null;

  const nearby = [
    family[index - 1],
    family[index],
    stableFamily(memory, group) ? family[index + 1] : undefined,
  ]
    .filter((item): item is NonNullable<typeof item> => !!item)
    .filter((item) => eligibleExercise(profile, item.id, group))
    .map((item) => item.id);

  const alternatives = [...new Set(nearby)].filter((id) => id !== defaultExerciseId);
  if (!alternatives.length) return null;

  return {
    slotId: `family-${group}`,
    family: group,
    defaultExerciseId,
    alternativeExerciseIds: alternatives,
    reason: stableFamily(memory, group)
      ? 'Você pode escolher entre referências compatíveis desta família; o Corpo Leve mantém os limites de segurança e recuperação.'
      : 'Você pode ajustar a variação dentro de referências já compatíveis com sua jornada.',
  };
}

function baseMinutes(profile: AssessmentProfile, memory: LongitudinalJourneyMemory): number {
  const recent = memory.availability.recentAvailableMinutes;
  const recentAverage = recent.length
    ? Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length)
    : undefined;
  return Math.max(
    8,
    Math.min(
      recentAverage ??
        memory.availability.preferredWindowMinutes ??
        profile.disponibilidadeMinutos ??
        12,
      20,
    ),
  );
}

function setsFor(profile: AssessmentProfile): number {
  if (profile.pontosAtencao.length > 0) return 2;
  return profile.nivelCalculado === 'iniciante' ? 2 : 3;
}

function autonomyMessage(memory: LongitudinalJourneyMemory): string {
  const free = memory.movement.freeAssistedSessions;
  const complementary = memory.movement.complementaryActivities;
  if (free >= 3 || complementary >= 4) {
    return 'Você já demonstrou escolhas próprias na jornada. Nesta etapa, o Corpo Leve orienta mais pelo contexto e interfere principalmente quando encontra conflito.';
  }
  return 'Você ganha mais espaço para decidir dentro de opções compatíveis; o Corpo Leve continua protegendo técnica, recuperação e coerência.';
}

function buildSession(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
  day: number,
): { exercises: ExercisePrescription[]; autonomyOptions: PlannedAutonomyOption[] } {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const phase = phaseForDay(day);
  const sets = setsFor(profile);
  const reps = (profile.nivelCalculado === 'iniciante' ? 7 : profile.nivelCalculado === 'base' ? 9 : 10) + (phase - 1);
  const hold = (profile.nivelCalculado === 'iniciante' ? 15 : profile.nivelCalculado === 'base' ? 20 : 25) + (phase - 1) * 5;

  const groups = ['squat', 'pushup', 'pull', day % 2 ? 'core' : 'plank'];
  const refs = groups
    .map((group) => ({ group, exerciseId: inheritedReference(group, profile, memory) }))
    .filter((item) => eligibleExercise(profile, item.exerciseId, item.group));

  const work = refs.map(({ group, exerciseId }) => {
    if (group === 'plank') return prescription(profile, day, exerciseId, sets, undefined, hold, 'Escolha autônoma dentro de referências protegidas.');
    if (group === 'core') return prescription(profile, day, exerciseId, sets, 6 + phase, undefined, 'Escolha autônoma dentro de referências protegidas.');
    return prescription(profile, day, exerciseId, sets, group === 'pull' ? Math.max(4, reps - 3) : reps, undefined, 'Escolha autônoma dentro de referências protegidas.');
  });

  const rotation = work.length ? day % work.length : 0;
  const rotated = work.length
    ? [...work.slice(rotation), ...work.slice(0, rotation)]
    : work;

  const warmup = [
    prescription(profile, day, 'warm-march', 1, undefined, 60),
    prescription(profile, day, day % 2 ? 'warm-hip' : 'mob-shoulder-wall', 1, undefined, 40),
  ];

  let exercises: ExercisePrescription[];
  if (objective === 'mobilidade' || objective === 'bem_estar') {
    exercises = [
      ...warmup,
      prescription(profile, day, 'bird-dog', sets, 6 + phase),
      prescription(profile, day, 'glute-bridge', sets, reps),
      prescription(profile, day, day % 2 ? 'mob-hip-90-90' : 'mob-thoracic', 1, 6),
      prescription(profile, day, 'mob-ankle', 1, 6),
    ];
  } else if (objective === 'condicionamento') {
    exercises = [
      ...warmup,
      ...rotated.slice(0, 2),
      prescription(profile, day, day % 2 ? 'cardio-step' : 'cardio-knee-lift', 2, undefined, 35 + phase * 5),
      ...rotated.slice(2, 3),
    ];
  } else if (objective === 'forca') {
    exercises = [...warmup, ...rotated.slice(0, 4)];
  } else {
    exercises = [
      ...warmup,
      ...rotated.slice(0, 3),
      prescription(profile, day, 'cardio-step-touch', 1, undefined, 45),
    ];
  }

  const options = refs
    .map(({ group, exerciseId }) => autonomousChoices(group, exerciseId, profile, memory))
    .filter((item): item is PlannedAutonomyOption => !!item);

  return { exercises, autonomyOptions: options };
}

function recovery(profile: AssessmentProfile, day: number): ProgramDay {
  return {
    day,
    kind: 'recuperacao',
    title: 'Recuperação escolhida com consciência',
    focus: 'Movimento leve para preservar continuidade',
    estimatedMinutes: 8,
    exercises: [
      prescription(profile, day, 'warm-march', 1, undefined, 75),
      prescription(profile, day, 'mob-catcow', 1, 6),
      prescription(profile, day, 'mob-hip-flexor', 1, 6),
      prescription(profile, day, 'mob-ankle', 1, 6),
    ],
    disciplineMessage: 'Autonomia também é escolher não aumentar esforço quando recuperação é a melhor decisão.',
  };
}

function title(objective: ObjetivoPrincipal, day: number): string {
  const names: Record<ObjetivoPrincipal, string> = {
    forca: 'Autonomia na força',
    condicionamento: 'Autonomia no condicionamento',
    mobilidade: 'Autonomia no movimento',
    consistencia: 'Autonomia consistente',
    bem_estar: 'Autonomia sustentável',
  };
  return `${names[objective]} · Dia ${day}`;
}

export function generateCycle4Program(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): ProgramDefinition {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const minutes = baseMinutes(profile, memory);
  const days: ProgramDay[] = [];
  const recoveryDays = new Set([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78]);
  const checkinDays = new Set([7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84]);

  for (let day = 1; day <= 84; day++) {
    if (recoveryDays.has(day)) {
      days.push(recovery(profile, day));
      continue;
    }

    const built = buildSession(profile, memory, day);
    const maxChoices = day <= 28 ? 1 : day <= 56 ? 2 : 3;

    if (checkinDays.has(day)) {
      days.push({
        day,
        kind: 'checkin',
        title: `Marco de autonomia · Dia ${day}`,
        focus: 'Revisar escolhas, execução e coerência com a própria jornada',
        estimatedMinutes: Math.min(minutes, 15),
        exercises: built.exercises.slice(0, 5),
        disciplineMessage: day === 84
          ? 'Você concluiu a etapa de Autonomia. A Jornada Contínua mantém sua memória e devolve ainda mais decisão para você.'
          : autonomyMessage(memory),
        autonomy: {
          enabled: true,
          guidance: day <= 28 ? 'moderada' : 'leve',
          maxUserChoices: maxChoices,
          options: built.autonomyOptions,
          message: autonomyMessage(memory),
        },
      });
      continue;
    }

    days.push({
      day,
      kind: 'treino',
      title: title(objective, day),
      focus: day <= 28
        ? 'Escolher dentro de referências conhecidas'
        : day <= 56
          ? 'Combinar escolhas com mais independência'
          : 'Consolidar autonomia com proteção contextual',
      estimatedMinutes: minutes,
      exercises: built.exercises,
      disciplineMessage: autonomyMessage(memory),
      autonomy: {
        enabled: true,
        guidance: day <= 28 ? 'moderada' : 'leve',
        maxUserChoices: maxChoices,
        options: built.autonomyOptions,
        message: autonomyMessage(memory),
      },
    });
  }

  return {
    id: `cycle-4-${objective}-${profile.nivelCalculado}`,
    name: '84 Dias — Autonomia',
    description: 'Quarto ciclo do Corpo Leve, em que o usuário decide mais dentro da sessão e o motor atua principalmente como proteção contextual.',
    cycle: 4,
    durationDays: 84,
    objective,
    level: profile.nivelCalculado,
    premium: false,
    days,
    generatedAt: new Date().toISOString(),
    eligibility: { requiresProgramId: `cycle-3-${objective}-${profile.nivelCalculado}` },
  };
}
