import { AssessmentProfile, ObjetivoPrincipal } from '../../types/assessment';
import {
  ExercisePrescription,
  LongitudinalJourneyMemory,
  ProgramDay,
  ProgramDefinition,
} from '../../types/program';
import { exerciseById } from '../../data/exercises/calisthenics';
import { calculatePostExerciseRestSeconds, calculateRestSeconds } from '../workout/restEngine';
import { selectExerciseForProfile } from '../workout/progressionEngine';
import { buildCycleTransitionContext } from '../journey/longitudinalJourneyMemoryEngine';

function phaseForDay(day: number): 1 | 2 | 3 {
  if (day <= 14) return 1;
  if (day <= 28) return 2;
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

function inheritedExercise(
  group: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): string {
  const family = memory.families.find((item) => item.progressionGroup === group);
  const candidate = family?.currentExerciseId;

  if (
    candidate &&
    exerciseById[candidate]?.levels.includes(profile.nivelCalculado) &&
    hasEquipment(profile, candidate) &&
    !hasAttentionConflict(profile, candidate) &&
    !familyBlockedByRegion(profile, group)
  ) {
    return candidate;
  }

  return selectExerciseForProfile(group, profile)?.id ?? {
    pushup: 'push-wall',
    squat: 'squat-chair',
    lunge: 'split-static-supported',
    pull: 'scapular-row',
    plank: 'plank-knee',
    core: 'core-deadbug',
  }[group] ?? 'bird-dog';
}

function baseSessionMinutes(profile: AssessmentProfile, memory: LongitudinalJourneyMemory): number {
  const inherited = memory.availability.preferredWindowMinutes;
  const profileMinutes = profile.disponibilidadeMinutos ?? 12;
  const reference = inherited ?? profileMinutes;
  // O histórico orienta o formato inicial, sem transformar a janela frequente em obrigação.
  return Math.max(8, Math.min(reference, 20));
}

function familyPriority(memory: LongitudinalJourneyMemory, group: string) {
  return buildCycleTransitionContext(memory, 1, 2)
    .familyPriorities
    .find((item) => item.progressionGroup === group);
}

function workPrescriptions(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
  day: number,
): ExercisePrescription[] {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const phase = phaseForDay(day);
  const conservative = profile.pontosAtencao.length > 0;
  const baseSets = profile.nivelCalculado === 'iniciante' ? 2 : 3;
  const sets = conservative ? Math.min(baseSets, 2) : baseSets;
  const repBase = profile.nivelCalculado === 'iniciante' ? 7 : profile.nivelCalculado === 'base' ? 9 : 10;
  const reps = repBase + (phase - 1);
  const hold = (profile.nivelCalculado === 'iniciante' ? 15 : profile.nivelCalculado === 'base' ? 20 : 25) + (phase - 1) * 5;

  const push = inheritedExercise('pushup', profile, memory);
  const squat = inheritedExercise('squat', profile, memory);
  const plank = inheritedExercise('plank', profile, memory);
  const core = inheritedExercise('core', profile, memory);
  const pull = inheritedExercise('pull', profile, memory);

  const pushPriority = familyPriority(memory, 'pushup');
  const squatPriority = familyPriority(memory, 'squat');
  const pullPriority = familyPriority(memory, 'pull');
  const corePriority = familyPriority(memory, 'core');
  const plankPriority = familyPriority(memory, 'plank');

  const warmup: ExercisePrescription[] = [
    prescription(profile, day, 'warm-march', 1, undefined, 60),
    prescription(profile, day, day % 2 ? 'warm-hip' : 'warm-shoulder', 1, undefined, 40),
  ];

  const strengthPool: ExercisePrescription[] = [];
  if (!familyBlockedByRegion(profile, 'squat') && !hasAttentionConflict(profile, squat)) {
    strengthPool.push(prescription(
      profile, day, squat, sets, reps,
      undefined,
      squatPriority?.recommendation === 'observar' ? 'Manter referência e priorizar controle.' : undefined,
    ));
  }
  if (!familyBlockedByRegion(profile, 'pushup') && !hasAttentionConflict(profile, push)) {
    strengthPool.push(prescription(
      profile, day, push, sets, Math.max(5, reps - 1),
      undefined,
      pushPriority?.recommendation === 'observar' ? 'Sem avanço automático; observar resposta.' : undefined,
    ));
  }
  if (
    !familyBlockedByRegion(profile, 'pull') &&
    hasEquipment(profile, pull) &&
    !hasAttentionConflict(profile, pull)
  ) {
    strengthPool.push(prescription(
      profile, day, pull, sets, Math.max(4, reps - 3),
      undefined,
      pullPriority?.recommendation === 'priorizar_exposicao' ? 'Família com menor exposição histórica.' : undefined,
    ));
  }

  strengthPool.push(
    prescription(
      profile, day, day % 2 ? core : plank, sets,
      day % 2 ? 6 + phase : undefined,
      day % 2 ? undefined : hold,
      (day % 2 ? corePriority : plankPriority)?.recommendation === 'observar'
        ? 'Manter execução conhecida e reavaliar com feedback.'
        : undefined,
    ),
  );

  // Ciclo 2 alterna famílias para favorecer continuidade e equilíbrio, não para aumentar volume.
  const rotated = day % 3 === 0
    ? [...strengthPool.slice(1), strengthPool[0]].filter(Boolean)
    : strengthPool;

  if (objective === 'mobilidade' || objective === 'bem_estar') {
    return [
      ...warmup,
      prescription(profile, day, 'bird-dog', sets, 6 + phase),
      prescription(profile, day, 'glute-bridge', sets, reps),
      prescription(profile, day, day % 2 ? 'mob-hip-90-90' : 'mob-thoracic', 1, 6),
      prescription(profile, day, 'mob-ankle', 1, 6),
    ];
  }

  if (objective === 'condicionamento') {
    return [
      ...warmup,
      ...rotated.slice(0, 2),
      prescription(profile, day, day % 2 ? 'cardio-step' : 'cardio-march-fast', 2, undefined, 35 + phase * 5),
      prescription(profile, day, plank, sets, undefined, hold),
    ];
  }

  if (objective === 'forca') {
    return [...warmup, ...rotated.slice(0, 4)];
  }

  return [
    ...warmup,
    ...rotated.slice(0, 3),
    prescription(profile, day, 'cardio-step-touch', 1, undefined, 45),
  ];
}

function recovery(profile: AssessmentProfile, day: number): ProgramDay {
  return {
    day,
    kind: 'recuperacao',
    title: 'Recuperação e continuidade',
    focus: 'Movimento leve sem compensar sessões anteriores',
    estimatedMinutes: 8,
    exercises: [
      prescription(profile, day, 'warm-march', 1, undefined, 75),
      prescription(profile, day, 'mob-catcow', 1, 6),
      prescription(profile, day, 'mob-hip-flexor', 1, 6),
      prescription(profile, day, 'mob-ankle', 1, 6),
    ],
    disciplineMessage: 'Consistência também é respeitar recuperação e retornar sem compensar o que ficou para trás.',
  };
}

function title(objective: ObjetivoPrincipal, day: number): string {
  const names: Record<ObjetivoPrincipal, string> = {
    forca: 'Força com continuidade',
    condicionamento: 'Condicionamento consistente',
    mobilidade: 'Mobilidade em continuidade',
    consistencia: 'Consistência em movimento',
    bem_estar: 'Movimento sustentável',
  };
  return `${names[objective]} · Dia ${day}`;
}

export function generateCycle2Program(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): ProgramDefinition {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const minutes = baseSessionMinutes(profile, memory);
  const days: ProgramDay[] = [];
  const recoveryDays = new Set([4, 8, 12, 16, 20, 24, 28, 32, 36, 40]);
  const checkinDays = new Set([7, 14, 21, 28, 35, 42]);

  for (let day = 1; day <= 42; day++) {
    if (recoveryDays.has(day)) {
      days.push(recovery(profile, day));
      continue;
    }

    if (checkinDays.has(day)) {
      days.push({
        day,
        kind: 'checkin',
        title: `Marco de consistência · Dia ${day}`,
        focus: 'Prática curta + leitura da própria continuidade',
        estimatedMinutes: Math.min(minutes, 15),
        exercises: workPrescriptions(profile, memory, day).slice(0, 5),
        disciplineMessage: day === 42
          ? 'Você concluiu a etapa de Consistência. O histórico segue com você para a próxima fase.'
          : 'Observe como você está conseguindo realizar, adaptar e retornar sem buscar uma sequência perfeita.',
      });
      continue;
    }

    days.push({
      day,
      kind: 'treino',
      title: title(objective, day),
      focus: day <= 14
        ? 'Preservar referências e estabilizar rotina'
        : day <= 28
          ? 'Equilibrar famílias e manter continuidade'
          : 'Consolidar escolhas e preparar mais autonomia',
      estimatedMinutes: minutes,
      exercises: workPrescriptions(profile, memory, day),
      disciplineMessage: day % 2
        ? 'Consistência é conseguir voltar e continuar, mesmo quando a rotina muda.'
        : 'Seu histórico orienta o treino de hoje; ele não obriga você a repetir o dia anterior.',
    });
  }

  return {
    id: `cycle-2-${objective}-${profile.nivelCalculado}`,
    name: `42 Dias — Consistência`,
    description: 'Segundo ciclo do Corpo Leve, construído sobre a Journey Memory para fortalecer continuidade, retomadas e escolhas compatíveis com a rotina.',
    cycle: 2,
    durationDays: 42,
    objective,
    level: profile.nivelCalculado,
    premium: false,
    days,
    generatedAt: new Date().toISOString(),
    eligibility: { requiresProgramId: `cycle-1-${objective}-${profile.nivelCalculado}` },
  };
}
