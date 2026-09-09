import { AssessmentProfile, ObjetivoPrincipal } from '../../types/assessment';
import { ExercisePrescription, ProgramDay, ProgramDefinition } from '../../types/program';
import { exerciseById } from '../../data/exercises/calisthenics';
import { calculatePostExerciseRestSeconds, calculateRestSeconds } from '../workout/restEngine';
import { selectExerciseForProfile } from '../workout/progressionEngine';

const messages = [
  'Força: execute bem o básico antes de buscar mais.',
  'Foco: hoje importa mais do que fazer tudo de uma vez.',
  'Disciplina: uma sessão curta concluída mantém sua jornada viva.',
  'Resultado: consistência transforma pequenas sessões em progresso.',
];

function phaseForDay(day: number): 1 | 2 | 3 {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
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

function targetMinutes(profile: AssessmentProfile): number {
  return Math.max(8, Math.min(profile.disponibilidadeMinutos ?? 15, 30));
}

function workoutExercises(profile: AssessmentProfile, day: number): ExercisePrescription[] {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const conservative = profile.pontosAtencao.length > 0;
  const hasBar = profile.recursosDisponiveis.includes('barra');
  const hasBand = profile.recursosDisponiveis.includes('elastico');
  const upperBodyCaution = profile.regioesAtencao.some((r) => ['ombro', 'cotovelo', 'punho', 'coluna'].includes(r));
  const lowerBodyCaution = profile.regioesAtencao.some((r) => ['quadril', 'joelho', 'tornozelo', 'coluna'].includes(r));
  const phase = phaseForDay(day);
  const baseSets = profile.nivelCalculado === 'iniciante' ? 2 : profile.nivelCalculado === 'base' ? 2 : 3;
  const sets = conservative ? Math.min(baseSets, 2) : baseSets;
  const repBase = profile.nivelCalculado === 'iniciante' ? 7 : profile.nivelCalculado === 'base' ? 9 : profile.nivelCalculado === 'intermediario' ? 10 : 12;
  const reps = repBase + (phase - 1) * (profile.nivelCalculado === 'iniciante' ? 1 : 2);
  const hold = (profile.nivelCalculado === 'iniciante' ? 15 : profile.nivelCalculado === 'base' ? 20 : profile.nivelCalculado === 'intermediario' ? 30 : 35) + (phase - 1) * 5;

  const push = selectExerciseForProfile('pushup', profile)?.id ?? 'push-wall';
  const squat = selectExerciseForProfile('squat', profile)?.id ?? 'squat-chair';
  const plank = selectExerciseForProfile('plank', profile)?.id ?? 'plank-knee';
  const core = selectExerciseForProfile('core', profile)?.id ?? 'core-deadbug';

  const base: ExercisePrescription[] = [
    prescription(profile, day, 'warm-march', 1, undefined, 60),
    prescription(profile, day, day % 2 ? 'warm-hip' : 'mob-shoulder-wall', 1, undefined, 40),
  ];

  if (objective === 'mobilidade' || objective === 'bem_estar') {
    return [
      ...base,
      prescription(profile, day, 'bird-dog', sets, 6 + phase),
      prescription(profile, day, 'glute-bridge', sets, reps),
      prescription(profile, day, 'mob-catcow', 1, 6),
      prescription(profile, day, day % 2 ? 'mob-ankle' : 'mob-thoracic', 1, 6),
    ];
  }

  if (objective === 'condicionamento') {
    return [
      ...base,
      prescription(profile, day, squat, sets, reps),
      ...(upperBodyCaution ? [] : [prescription(profile, day, push, sets, Math.max(5, reps - 2))]),
      prescription(profile, day, phase === 1 ? 'cardio-step-touch' : 'cardio-knee-lift', sets, undefined, 30 + (phase - 1) * 10),
      prescription(profile, day, plank, sets, undefined, hold),
    ];
  }

  if (objective === 'forca') {
    const strength: ExercisePrescription[] = [...base];
    if (!upperBodyCaution) strength.push(prescription(profile, day, push, sets, reps));
    if (!lowerBodyCaution) strength.push(prescription(profile, day, squat, sets, reps + 2));
    if (hasBar && !upperBodyCaution) {
      const pull = profile.nivelCalculado === 'iniciante'
        ? 'row-bar-high'
        : profile.nivelCalculado === 'base'
          ? (hasBand ? 'pullup-assisted' : 'row-bar-supported')
          : 'pullup';
      strength.push(prescription(profile, day, pull, sets, Math.max(3, reps - 4)));
    } else {
      strength.push(prescription(profile, day, 'bird-dog', sets, 6 + phase));
    }
    strength.push(prescription(profile, day, plank, sets, undefined, hold));
    return strength;
  }

  return [
    ...base,
    prescription(profile, day, squat, sets, reps),
    ...(upperBodyCaution ? [] : [prescription(profile, day, push, sets, Math.max(5, reps - 2))]),
    prescription(profile, day, core, sets, 6 + phase),
    prescription(profile, day, 'cardio-step-touch', 1, undefined, 45 + (phase - 1) * 10),
  ];
}

function recovery(profile: AssessmentProfile, day: number): ProgramDay {
  return {
    day,
    kind: 'recuperacao',
    title: 'Recuperação ativa',
    focus: 'Movimento leve e manutenção do hábito',
    estimatedMinutes: 8,
    exercises: [
      prescription(profile, day, 'warm-march', 1, undefined, 90),
      prescription(profile, day, 'mob-catcow', 1, 6),
      prescription(profile, day, 'mob-hip-flexor', 1, 6),
      prescription(profile, day, 'mob-ankle', 1, 6),
    ],
    disciplineMessage: 'Disciplina também é respeitar a recuperação e manter o compromisso com o movimento.',
  };
}

function title(objective: ObjetivoPrincipal, day: number) {
  const names: Record<ObjetivoPrincipal, string> = {
    forca: 'Fundação de força',
    condicionamento: 'Condicionamento em casa',
    mobilidade: 'Movimento e mobilidade',
    consistencia: 'Consistência em movimento',
    bem_estar: 'Movimento e disposição',
  };
  return `${names[objective]} · Dia ${day}`;
}

export function generateCycle1Program(profile: AssessmentProfile): ProgramDefinition {
  const objective = profile.objetivoPrincipal ?? 'consistencia';
  const minutes = targetMinutes(profile);
  const days: ProgramDay[] = [];
  const recoveryDays = new Set([3, 6, 9, 12, 15, 18]);

  for (let day = 1; day <= 21; day++) {
    if (recoveryDays.has(day)) {
      days.push(recovery(profile, day));
      continue;
    }
    if (day === 7 || day === 14 || day === 21) {
      days.push({
        day,
        kind: 'checkin',
        title: `Marco da jornada · Dia ${day}`,
        focus: 'Treino curto + percepção de evolução',
        estimatedMinutes: Math.min(minutes, 15),
        exercises: workoutExercises(profile, day).slice(0, 5),
        disciplineMessage: day === 21
          ? 'Resultado: você concluiu o primeiro ciclo. Compare sua evolução e prepare o próximo passo.'
          : 'Foco: reconheça o que melhorou e continue construindo sua sequência.',
      });
      continue;
    }
    days.push({
      day,
      kind: 'treino',
      title: title(objective, day),
      focus: day <= 7 ? 'Técnica e adaptação' : day <= 14 ? 'Consistência e progressão' : 'Consolidação do ciclo',
      estimatedMinutes: minutes,
      exercises: workoutExercises(profile, day),
      disciplineMessage: messages[(day - 1) % messages.length],
    });
  }

  return {
    id: `cycle-1-${objective}-${profile.nivelCalculado}`,
    name: `21 Dias — ${objective === 'forca' ? 'Fundação de Força' : objective === 'condicionamento' ? 'Base de Condicionamento' : objective === 'mobilidade' ? 'Movimento e Mobilidade' : objective === 'bem_estar' ? 'Movimento e Disposição' : 'Consistência'}`,
    description: 'Primeiro ciclo personalizado de calistenia, com sessões curtas, descanso planejado, progressão gradual e foco em criar disciplina.',
    cycle: 1,
    durationDays: 21,
    objective,
    level: profile.nivelCalculado,
    premium: false,
    days,
    generatedAt: new Date().toISOString(),
  };
}
