import { calisthenicsExercises, exerciseById } from '../../data/exercises/calisthenics';
import {
  AdaptationDecision,
  AdaptationReason,
  EffortFeedback,
  ExercisePrescription,
  ProgramDay,
  ProgramDayExecution,
  ProgramDefinition,
} from '../../types/program';
import { getProgressionFamily } from '../workout/progressionEngine';

type FamilyHistory = {
  efforts: EffortFeedback[];
  lastExerciseId?: string;
  lastDay?: number;
};

function effortHistoryForGroup(
  group: string,
  executions: ProgramDayExecution[],
  beforeDay: number,
): FamilyHistory {
  const rows = executions
    .filter((execution) => execution.day < beforeDay)
    .sort((a, b) => a.day - b.day)
    .flatMap((execution) =>
      execution.exercises
        .map((record) => {
          const exercise = exerciseById[record.exerciseId];
          return {
            day: execution.day,
            record,
            group: exercise?.progressionGroup,
          };
        })
        .filter((row) => row.group === group && row.record.effort),
    );

  return {
    efforts: rows.map((row) => row.record.effort!) as EffortFeedback[],
    lastExerciseId: rows.at(-1)?.record.exerciseId,
    lastDay: rows.at(-1)?.day,
  };
}

function familyExerciseByOffset(exerciseId: string, offset: number): string {
  const current = exerciseById[exerciseId];
  if (!current?.progressionGroup) return exerciseId;
  const family = getProgressionFamily(current.progressionGroup);
  const index = family.findIndex((item) => item.id === exerciseId);
  if (index < 0) return exerciseId;
  const target = Math.max(0, Math.min(family.length - 1, index + offset));
  return family[target]?.id ?? exerciseId;
}

function recentPattern(efforts: EffortFeedback[]) {
  const latest = efforts.at(-1);
  const lastTwo = efforts.slice(-2);
  const lastThree = efforts.slice(-3);

  const interrupted = latest === 'interrompido';
  const repeatedDifficulty =
    lastTwo.length === 2 &&
    lastTwo.every((effort) => effort === 'dificil' || effort === 'interrompido');

  const stableThree =
    lastThree.length === 3 &&
    lastThree.every((effort) => effort === 'leve' || effort === 'adequado');

  return { latest, interrupted, repeatedDifficulty, stableThree };
}

function reduceVolume(prescription: ExercisePrescription, factor: number): ExercisePrescription {
  return {
    ...prescription,
    sets: Math.max(1, Math.floor(prescription.sets * factor)),
    reps: prescription.reps ? Math.max(3, Math.floor(prescription.reps * factor)) : undefined,
    seconds: prescription.seconds ? Math.max(10, Math.floor(prescription.seconds * factor)) : undefined,
    note: [prescription.note, 'Ajustado pelo feedback recente para priorizar técnica e recuperação.']
      .filter(Boolean)
      .join(' '),
  };
}

function adaptPrescription(
  prescription: ExercisePrescription,
  executions: ProgramDayExecution[],
  day: number,
): ExercisePrescription {
  const exercise = exerciseById[prescription.exerciseId];
  const group = exercise?.progressionGroup;
  if (!group) return prescription;

  const history = effortHistoryForGroup(group, executions, day);
  if (!history.efforts.length) return prescription;

  const pattern = recentPattern(history.efforts);
  const lastId = history.lastExerciseId ?? prescription.exerciseId;

  if (pattern.interrupted) {
    const regressedId = familyExerciseByOffset(lastId, -1);
    return reduceVolume({ ...prescription, exerciseId: regressedId }, 0.8);
  }

  if (pattern.repeatedDifficulty) {
    const conservativeId = familyExerciseByOffset(lastId, -1);
    return reduceVolume({ ...prescription, exerciseId: conservativeId }, 0.85);
  }

  if (pattern.stableThree) {
    const progressedId = familyExerciseByOffset(lastId, 1);
    return {
      ...prescription,
      exerciseId: progressedId,
      note: [prescription.note, 'Progressão aplicada após três feedbacks estáveis.']
        .filter(Boolean)
        .join(' '),
    };
  }

  if (pattern.latest === 'dificil') {
    return reduceVolume({ ...prescription, exerciseId: lastId }, 0.9);
  }

  return { ...prescription, exerciseId: lastId };
}

function adaptDay(day: ProgramDay, executions: ProgramDayExecution[]): ProgramDay {
  const alreadyCompleted = executions.some((execution) => execution.day === day.day);
  if (alreadyCompleted || day.kind === 'recuperacao') return day;

  return {
    ...day,
    exercises: day.exercises.map((prescription) =>
      adaptPrescription(prescription, executions, day.day),
    ),
  };
}

export function adaptProgramForHistory(
  program: ProgramDefinition,
  executions: ProgramDayExecution[],
): ProgramDefinition {
  const relevant = executions
    .filter((execution) => execution.programId === program.id && execution.completedAt)
    .sort((a, b) => a.day - b.day);

  if (!relevant.length) return program;

  return {
    ...program,
    days: program.days.map((day) => adaptDay(day, relevant)),
  };
}

export function summarizeAdaptationForDay(
  program: ProgramDefinition,
  dayNumber: number,
  executions: ProgramDayExecution[],
): string | null {
  const baseDay = program.days.find((day) => day.day === dayNumber);
  if (!baseDay) return null;

  const adapted = adaptDay(baseDay, executions.filter((item) => item.programId === program.id));
  const changedExercise = adapted.exercises.some(
    (item, index) => item.exerciseId !== baseDay.exercises[index]?.exerciseId,
  );
  const changedVolume = adapted.exercises.some((item, index) => {
    const base = baseDay.exercises[index];
    return !!base && (item.sets !== base.sets || item.reps !== base.reps || item.seconds !== base.seconds);
  });

  if (changedExercise && changedVolume) return 'Exercícios e volume ajustados com base nos seus feedbacks recentes.';
  if (changedExercise) return 'Variações ajustadas com base nos seus feedbacks recentes.';
  if (changedVolume) return 'Volume ajustado com base nos seus feedbacks recentes.';
  return null;
}


function adaptationReasonForHistory(efforts: EffortFeedback[]): AdaptationReason {
  const pattern = recentPattern(efforts);
  if (pattern.interrupted) return 'feedback_interrompido';
  if (pattern.repeatedDifficulty) return 'dificuldade_repetida';
  if (pattern.stableThree) return 'tres_feedbacks_estaveis';
  if (pattern.latest === 'dificil') return 'feedback_dificil';
  return 'manutencao';
}

export function getAdaptationDecisionsForDay(
  program: ProgramDefinition,
  dayNumber: number,
  executions: ProgramDayExecution[],
): AdaptationDecision[] {
  const baseDay = program.days.find((day) => day.day === dayNumber);
  if (!baseDay || baseDay.kind === 'recuperacao') return [];

  const relevant = executions
    .filter((execution) => execution.programId === program.id && execution.completedAt && execution.day < dayNumber)
    .sort((a, b) => a.day - b.day);

  if (!relevant.length) return [];

  const adaptedDay = adaptDay(baseDay, relevant);
  const createdAt = new Date().toISOString();

  return adaptedDay.exercises.flatMap((adapted, index) => {
    const base = baseDay.exercises[index];
    if (!base) return [];

    const definition = exerciseById[base.exerciseId];
    const group = definition?.progressionGroup;
    if (!group) return [];

    const changed =
      adapted.exerciseId !== base.exerciseId ||
      adapted.sets !== base.sets ||
      adapted.reps !== base.reps ||
      adapted.seconds !== base.seconds;

    if (!changed) return [];

    const history = effortHistoryForGroup(group, relevant, dayNumber);
    const previousExerciseId = history.lastExerciseId ?? base.exerciseId;

    return [{
      id: `${program.id}:${dayNumber}:${group}`,
      programId: program.id,
      targetDay: dayNumber,
      exerciseFamily: group,
      previousExerciseId,
      newExerciseId: adapted.exerciseId,
      reason: adaptationReasonForHistory(history.efforts),
      recentEfforts: history.efforts.slice(-3),
      volumeBefore: { sets: base.sets, reps: base.reps, seconds: base.seconds },
      volumeAfter: { sets: adapted.sets, reps: adapted.reps, seconds: adapted.seconds },
      createdAt,
    }];
  });
}
