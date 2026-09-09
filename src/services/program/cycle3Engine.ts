import { AssessmentProfile, ObjetivoPrincipal } from '../../types/assessment';
import {
  ExercisePrescription,
  LongitudinalJourneyMemory,
  ProgramDay,
  ProgramDefinition,
} from '../../types/program';
import { exerciseById } from '../../data/exercises/calisthenics';
import { calculatePostExerciseRestSeconds, calculateRestSeconds } from '../workout/restEngine';
import { getProgressionFamily, selectExerciseForProfile } from '../workout/progressionEngine';
import { buildCycleTransitionContext } from '../journey/longitudinalJourneyMemoryEngine';

function phaseForDay(day: number): 1 | 2 | 3 {
  if (day <= 21) return 1;
  if (day <= 42) return 2;
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

function familyMemory(memory: LongitudinalJourneyMemory, group: string) {
  return memory.families.find((item) => item.progressionGroup === group);
}

function stableRecentHistory(memory: LongitudinalJourneyMemory, group: string): boolean {
  const family = familyMemory(memory, group);
  if (!family || family.recentEfforts.length < 3) return false;
  const recent = family.recentEfforts.slice(-3);
  return recent.every((item) => item === 'leve' || item === 'adequado') &&
    !family.recentEfforts.slice(-5).includes('interrompido');
}

function inheritedReference(
  group: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): string {
  const family = familyMemory(memory, group);
  const candidate = family?.currentExerciseId;

  if (candidate && eligibleExercise(profile, candidate, group)) return candidate;

  return selectExerciseForProfile(group, profile)?.id ?? {
    pushup: 'push-wall',
    squat: 'squat-chair',
    lunge: 'split-static-supported',
    pull: 'scapular-row',
    plank: 'plank-knee',
    core: 'core-deadbug',
  }[group] ?? 'bird-dog';
}

function evolutionReference(
  group: string,
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
  phase: 1 | 2 | 3,
): { exerciseId: string; note?: string } {
  const currentId = inheritedReference(group, profile, memory);
  const transition = buildCycleTransitionContext(memory, 2, 3)
    .familyPriorities.find((item) => item.progressionGroup === group);

  if (transition?.recommendation === 'observar') {
    return {
      exerciseId: currentId,
      note: 'Histórico pede observação: manter referência e priorizar controle.',
    };
  }

  // No primeiro terço do ciclo, sempre preservamos a referência herdada.
  if (phase === 1 || !stableRecentHistory(memory, group)) {
    return {
      exerciseId: currentId,
      note: transition?.recommendation === 'priorizar_exposicao'
        ? 'Família com menor exposição histórica; priorizar presença, não volume.'
        : 'Referência herdada da Journey Memory.',
    };
  }

  // A partir da fase 2, uma família estável pode receber a próxima variação
  // compatível como opção inicial do ciclo. O feedback diário ainda pode
  // manter/regredir pelo Adaptive Program Engine.
  const family = getProgressionFamily(group);
  const index = family.findIndex((item) => item.id === currentId);
  const next = index >= 0 ? family[index + 1] : undefined;

  if (next && eligibleExercise(profile, next.id, group)) {
    return {
      exerciseId: next.id,
      note: 'Opção de evolução baseada em histórico recente estável; não implica aumento de volume.',
    };
  }

  return {
    exerciseId: currentId,
    note: 'Manter referência funcional conhecida.',
  };
}

function baseSessionMinutes(profile: AssessmentProfile, memory: LongitudinalJourneyMemory): number {
  const recent = memory.availability.recentAvailableMinutes;
  const recentAverage = recent.length
    ? Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length)
    : undefined;
  const inherited =
    recentAverage ??
    memory.availability.preferredWindowMinutes ??
    memory.availability.averageAvailableMinutes ??
    profile.disponibilidadeMinutos ??
    12;

  // Evolução não aumenta duração automaticamente. A referência continua
  // limitada a uma sessão curta/moderada e o usuário escolhe o tempo do dia.
  return Math.max(8, Math.min(inherited, 20));
}

function autonomyContext(memory: LongitudinalJourneyMemory): string {
  const free = memory.movement.freeAssistedSessions;
  const complementary = memory.movement.complementaryActivities;

  if (free >= 3 && complementary >= 3) {
    return 'Sua jornada já mostra escolhas além da sessão guiada; o Corpo Leve amplia contexto sem transformar isso em volume obrigatório.';
  }
  if (free >= 1 || complementary >= 1) {
    return 'Sua jornada já inclui escolhas complementares; elas ajudam a entender autonomia, mas não substituem a atividade planejada.';
  }
  return 'A autonomia continua sendo construída dentro das sessões guiadas e das escolhas de tempo disponíveis.';
}

function setCount(profile: AssessmentProfile): number {
  if (profile.pontosAtencao.length > 0) return 2;
  return profile.nivelCalculado === 'iniciante' ? 2 : 3;
}

function buildWorkSession(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
  day: number,
): ExercisePrescription[] {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const phase = phaseForDay(day);
  const sets = setCount(profile);
  const repBase =
    profile.nivelCalculado === 'iniciante' ? 7 :
    profile.nivelCalculado === 'base' ? 9 : 10;
  const reps = repBase + (phase - 1);
  const hold =
    (profile.nivelCalculado === 'iniciante' ? 15 :
      profile.nivelCalculado === 'base' ? 20 : 25) +
    (phase - 1) * 5;

  const push = evolutionReference('pushup', profile, memory, phase);
  const squat = evolutionReference('squat', profile, memory, phase);
  const pull = evolutionReference('pull', profile, memory, phase);
  const plank = evolutionReference('plank', profile, memory, phase);
  const core = evolutionReference('core', profile, memory, phase);

  const warmup: ExercisePrescription[] = [
    prescription(profile, day, 'warm-march', 1, undefined, 60),
    prescription(profile, day, day % 2 ? 'warm-hip' : 'mob-shoulder-wall', 1, undefined, 40),
  ];

  const candidates: ExercisePrescription[] = [];

  if (!familyBlockedByRegion(profile, 'squat') && eligibleExercise(profile, squat.exerciseId, 'squat')) {
    candidates.push(prescription(profile, day, squat.exerciseId, sets, reps, undefined, squat.note));
  }

  if (!familyBlockedByRegion(profile, 'pushup') && eligibleExercise(profile, push.exerciseId, 'pushup')) {
    candidates.push(prescription(profile, day, push.exerciseId, sets, Math.max(5, reps - 1), undefined, push.note));
  }

  if (!familyBlockedByRegion(profile, 'pull') && eligibleExercise(profile, pull.exerciseId, 'pull')) {
    candidates.push(prescription(profile, day, pull.exerciseId, sets, Math.max(4, reps - 3), undefined, pull.note));
  }

  const useCore = day % 2 === 1;
  const trunk = useCore ? core : plank;
  if (eligibleExercise(profile, trunk.exerciseId, useCore ? 'core' : 'plank')) {
    candidates.push(prescription(
      profile,
      day,
      trunk.exerciseId,
      sets,
      useCore ? 6 + phase : undefined,
      useCore ? undefined : hold,
      trunk.note,
    ));
  }

  // Rotação altera prioridade, não quantidade total de trabalho.
  const rotation = day % 4;
  const rotated = candidates.length
    ? [...candidates.slice(rotation % candidates.length), ...candidates.slice(0, rotation % candidates.length)]
    : candidates;

  if (objective === 'mobilidade' || objective === 'bem_estar') {
    return [
      ...warmup,
      prescription(profile, day, 'bird-dog', sets, 6 + phase),
      prescription(profile, day, 'glute-bridge', sets, reps),
      prescription(profile, day, day % 2 ? 'mob-hip-90-90' : 'mob-thoracic', 1, 6),
      prescription(profile, day, day % 3 ? 'mob-ankle' : 'mob-hamstring-dynamic', 1, 6),
    ];
  }

  if (objective === 'condicionamento') {
    return [
      ...warmup,
      ...rotated.slice(0, 2),
      prescription(profile, day, day % 2 ? 'cardio-step' : 'cardio-knee-lift', 2, undefined, 35 + phase * 5),
      ...(plank.exerciseId && eligibleExercise(profile, plank.exerciseId, 'plank')
        ? [prescription(profile, day, plank.exerciseId, sets, undefined, hold, plank.note)]
        : []),
    ];
  }

  if (objective === 'forca') {
    return [...warmup, ...rotated.slice(0, 4)];
  }

  return [
    ...warmup,
    ...rotated.slice(0, 3),
    prescription(profile, day, day % 2 ? 'cardio-step-touch' : 'cardio-march-fast', 1, undefined, 45),
  ];
}

function recovery(profile: AssessmentProfile, day: number): ProgramDay {
  return {
    day,
    kind: 'recuperacao',
    title: 'Recuperação para continuar evoluindo',
    focus: 'Mobilidade e movimento leve, sem compensação',
    estimatedMinutes: 8,
    exercises: [
      prescription(profile, day, 'warm-march', 1, undefined, 75),
      prescription(profile, day, 'mob-catcow', 1, 6),
      prescription(profile, day, day % 2 ? 'mob-hip-flexor' : 'mob-thoracic', 1, 6),
      prescription(profile, day, 'mob-ankle', 1, 6),
    ],
    disciplineMessage: 'Evoluir também é reconhecer quando manter movimento leve ajuda a próxima prática.',
  };
}

function title(objective: ObjetivoPrincipal, day: number): string {
  const names: Record<ObjetivoPrincipal, string> = {
    forca: 'Evolução de força',
    condicionamento: 'Evolução de condicionamento',
    mobilidade: 'Evolução de movimento',
    consistencia: 'Evolução consistente',
    bem_estar: 'Evolução sustentável',
  };
  return `${names[objective]} · Dia ${day}`;
}

export function generateCycle3Program(
  profile: AssessmentProfile,
  memory: LongitudinalJourneyMemory,
): ProgramDefinition {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const minutes = baseSessionMinutes(profile, memory);
  const days: ProgramDay[] = [];
  const recoveryDays = new Set([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]);
  const checkinDays = new Set([7, 14, 21, 28, 35, 42, 49, 56, 63]);

  for (let day = 1; day <= 63; day++) {
    if (recoveryDays.has(day)) {
      days.push(recovery(profile, day));
      continue;
    }

    if (checkinDays.has(day)) {
      days.push({
        day,
        kind: 'checkin',
        title: `Marco de evolução · Dia ${day}`,
        focus: 'Prática curta + leitura de capacidade, rotina e escolhas',
        estimatedMinutes: Math.min(minutes, 15),
        exercises: buildWorkSession(profile, memory, day).slice(0, 5),
        disciplineMessage: day === 63
          ? `Você concluiu a etapa de Evolução. ${autonomyContext(memory)}`
          : `Compare sua execução com sua própria jornada. ${autonomyContext(memory)}`,
      });
      continue;
    }

    days.push({
      day,
      kind: 'treino',
      title: title(objective, day),
      focus: day <= 21
        ? 'Preservar referências e confirmar estabilidade'
        : day <= 42
          ? 'Explorar evolução compatível com feedback e histórico'
          : 'Consolidar decisões e preparar autonomia',
      estimatedMinutes: minutes,
      exercises: buildWorkSession(profile, memory, day),
      disciplineMessage: day > 42
        ? autonomyContext(memory)
        : day % 2
          ? 'Evolução é perceber o que mudou e continuar escolhendo um caminho que cabe na sua rotina.'
          : 'Hoje o Corpo Leve usa sua própria história como referência, não a comparação com outras pessoas.',
    });
  }

  return {
    id: `cycle-3-${objective}-${profile.nivelCalculado}`,
    name: '63 Dias — Evolução',
    description: 'Terceiro ciclo do Corpo Leve, guiado pela Journey Memory para evoluir referências funcionais com contexto de rotina, feedback e autonomia.',
    cycle: 3,
    durationDays: 63,
    objective,
    level: profile.nivelCalculado,
    premium: false,
    days,
    generatedAt: new Date().toISOString(),
    eligibility: { requiresProgramId: `cycle-2-${objective}-${profile.nivelCalculado}` },
  };
}
