import { AssessmentProfile, ObjetivoPrincipal } from '../../types/assessment';
import {
  ContinuousJourneyFocus,
  ContinuousJourneyState,
  ExercisePrescription,
  LongitudinalJourneyMemory,
  PlannedAutonomyOption,
  ProgramDay,
  ProgramDefinition,
} from '../../types/program';
import { exerciseById } from '../../data/exercises/calisthenics';
import { calculatePostExerciseRestSeconds, calculateRestSeconds } from '../workout/restEngine';
import { getProgressionFamily, selectExerciseForProfile } from '../workout/progressionEngine';

function objectiveFromFocus(
  focus: ContinuousJourneyFocus,
  fallback?: ObjetivoPrincipal,
): ObjetivoPrincipal {
  if (focus === 'manter') return fallback ?? 'consistencia';
  return focus;
}

function prescription(
  profile: AssessmentProfile,
  exerciseId: string,
  sets: number,
  reps?: number,
  seconds?: number,
  note?: string,
): ExercisePrescription {
  const exercise = exerciseById[exerciseId];
  const between = exercise ? calculateRestSeconds(profile, exercise, 3) : 45;
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

function blockedRegion(profile: AssessmentProfile, group: string): boolean {
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

function compatible(
  profile: AssessmentProfile,
  exerciseId: string,
  group: string,
): boolean {
  const exercise = exerciseById[exerciseId];
  if (!exercise || blockedRegion(profile, group)) return false;
  if (!exercise.levels.includes(profile.nivelCalculado)) return false;

  const attention = new Set([...profile.regioesAtencao, ...profile.pontosAtencao]);
  if (exercise.avoidWhen?.some((item) => attention.has(item))) return false;

  if (!exercise.equipment.length || exercise.equipment.includes('nenhum')) return true;
  if (exerciseId === 'pullup-assisted') {
    return profile.recursosDisponiveis.includes('barra') &&
      profile.recursosDisponiveis.includes('elastico');
  }
  return exercise.equipment.some((item) => profile.recursosDisponiveis.includes(item));
}

function currentReference(
  group: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): string {
  const remembered = memory.families.find((item) => item.progressionGroup === group)?.currentExerciseId;
  if (remembered && compatible(profile, remembered, group)) return remembered;
  return selectExerciseForProfile(group, profile)?.id ?? {
    pushup: 'push-wall',
    squat: 'squat-chair',
    pull: 'scapular-row',
    plank: 'plank-knee',
    core: 'core-deadbug',
  }[group] ?? 'bird-dog';
}

function familyStable(memory: LongitudinalJourneyMemory, group: string): boolean {
  const recent = memory.families.find((item) => item.progressionGroup === group)?.recentEfforts ?? [];
  if (recent.length < 3) return false;
  return recent.slice(-3).every((item) => item === 'leve' || item === 'adequado') &&
    !recent.slice(-5).includes('interrompido');
}

function autonomyOption(
  group: string,
  currentId: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): PlannedAutonomyOption | null {
  const family = getProgressionFamily(group);
  const index = family.findIndex((item) => item.id === currentId);
  if (index < 0) return null;

  const candidates = [
    family[index - 1],
    family[index],
    familyStable(memory, group) ? family[index + 1] : undefined,
  ]
    .filter((item): item is NonNullable<typeof item> => !!item)
    .filter((item) => compatible(profile, item.id, group))
    .map((item) => item.id);

  const alternatives = [...new Set(candidates)].filter((id) => id !== currentId);
  if (!alternatives.length) return null;

  return {
    slotId: `continuous-${group}`,
    family: group,
    defaultExerciseId: currentId,
    alternativeExerciseIds: alternatives,
    reason: 'Escolha entre referências compatíveis com sua própria Journey Memory.',
  };
}

function sessionMinutes(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): number {
  const recent = memory.availability.recentAvailableMinutes;
  const average = recent.length
    ? Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length)
    : undefined;
  return Math.max(
    8,
    Math.min(
      average ??
        memory.availability.preferredWindowMinutes ??
        profile.disponibilidadeMinutos ??
        12,
      20,
    ),
  );
}

function workDay(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
  day: number,
  objective: ObjetivoPrincipal,
): ProgramDay {
  const sets = profile.pontosAtencao.length > 0 || profile.nivelCalculado === 'iniciante' ? 2 : 3;
  const reps = profile.nivelCalculado === 'iniciante' ? 7 : profile.nivelCalculado === 'base' ? 9 : 10;
  const hold = profile.nivelCalculado === 'iniciante' ? 15 : profile.nivelCalculado === 'base' ? 20 : 25;

  const groups = ['squat', 'pushup', 'pull', day % 2 ? 'core' : 'plank'];
  const refs = groups
    .map((group) => ({ group, exerciseId: currentReference(group, profile, memory) }))
    .filter((item) => compatible(profile, item.exerciseId, item.group));

  const work = refs.map(({ group, exerciseId }) => {
    if (group === 'plank') return prescription(profile, exerciseId, sets, undefined, hold);
    if (group === 'core') return prescription(profile, exerciseId, sets, 7);
    return prescription(profile, exerciseId, sets, group === 'pull' ? Math.max(4, reps - 3) : reps);
  });

  const rotation = work.length ? day % work.length : 0;
  const rotated = work.length
    ? [...work.slice(rotation), ...work.slice(0, rotation)]
    : work;

  const warmup = [
    prescription(profile, 'warm-march', 1, undefined, 60),
    prescription(profile, day % 2 ? 'warm-hip' : 'mob-shoulder-wall', 1, undefined, 40),
  ];

  let exercises: ExercisePrescription[];
  if (objective === 'mobilidade' || objective === 'bem_estar') {
    exercises = [
      ...warmup,
      prescription(profile, 'bird-dog', sets, 6),
      prescription(profile, 'glute-bridge', sets, reps),
      prescription(profile, day % 2 ? 'mob-hip-90-90' : 'mob-thoracic', 1, 6),
      prescription(profile, 'mob-ankle', 1, 6),
    ];
  } else if (objective === 'condicionamento') {
    exercises = [
      ...warmup,
      ...rotated.slice(0, 2),
      prescription(profile, day % 2 ? 'cardio-step' : 'cardio-knee-lift', 2, undefined, 40),
      ...rotated.slice(2, 3),
    ];
  } else if (objective === 'forca') {
    exercises = [...warmup, ...rotated.slice(0, 4)];
  } else {
    exercises = [
      ...warmup,
      ...rotated.slice(0, 3),
      prescription(profile, 'cardio-step-touch', 1, undefined, 45),
    ];
  }

  const options = refs
    .map(({ group, exerciseId }) => autonomyOption(group, exerciseId, profile, memory))
    .filter((item): item is PlannedAutonomyOption => !!item);

  return {
    day,
    kind: 'treino',
    title: `Prática contínua · Sessão ${day}`,
    focus: 'Escolher, realizar e registrar uma prática que faça sentido hoje',
    estimatedMinutes: sessionMinutes(profile, memory),
    exercises,
    disciplineMessage:
      'A Jornada Contínua não exige uma sequência perfeita. O objetivo é saber escolher, adaptar e retornar quando fizer sentido.',
    autonomy: {
      enabled: true,
      guidance: 'leve',
      maxUserChoices: 3,
      options,
      message:
        'Você decide mais; o Corpo Leve preserva limites de segurança, recuperação, equipamento e coerência com sua jornada.',
    },
  };
}

function recoveryDay(profile: AssessmentProfile, day: number): ProgramDay {
  return {
    day,
    kind: 'recuperacao',
    title: `Prática contínua · Sessão ${day}`,
    focus: 'Recuperação ativa também é uma escolha válida',
    estimatedMinutes: 8,
    exercises: [
      prescription(profile, 'warm-march', 1, undefined, 75),
      prescription(profile, 'mob-catcow', 1, 6),
      prescription(profile, 'mob-hip-flexor', 1, 6),
      prescription(profile, 'mob-ankle', 1, 6),
    ],
    disciplineMessage:
      'Autonomia inclui reconhecer quando uma prática leve é a escolha mais coerente para continuar.',
  };
}

export function generateContinuousJourneyBlock(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
  state: ContinuousJourneyState,
): ProgramDefinition {
  const objective = objectiveFromFocus(state.focus, profile.objetivoPrincipal);
  const days: ProgramDay[] = [];

  // Blocos renováveis existem apenas para identidade/persistência. Não são
  // desafios nem prazos. Ao concluir um bloco, outro é criado preservando memória.
  for (let day = 1; day <= 14; day++) {
    days.push(day === 5 || day === 10 ? recoveryDay(profile, day) : workDay(profile, memory, day, objective));
  }

  return {
    id: `cycle-5-continuous-b${state.activeBlockIndex}-${objective}-${profile.nivelCalculado}`,
    name: 'Jornada Contínua',
    description:
      'Prática renovável sem prazo final. Cada bloco preserva identidade própria para que o histórico nunca seja sobrescrito.',
    cycle: 5,
    durationDays: 14,
    objective,
    level: profile.nivelCalculado,
    premium: false,
    days,
    generatedAt: new Date().toISOString(),
    continuous: {
      blockIndex: state.activeBlockIndex,
      sessionCount: 14,
      focus: state.focus,
      renewable: true,
      message:
        'Este bloco organiza registros; ele não define quando sua jornada deve terminar nem quando um hábito foi formado.',
    },
  };
}
