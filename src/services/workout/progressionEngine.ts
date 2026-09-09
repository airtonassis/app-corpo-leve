import { AssessmentProfile, NivelCalculado } from '../../types/assessment';
import { calisthenicsExercises } from '../../data/exercises/calisthenics';
import { EffortFeedback, ExerciseDefinition } from '../../types/program';

const levelRank: Record<NivelCalculado, number> = { iniciante: 1, base: 2, intermediario: 3, avancado: 4 };

export function getProgressionFamily(group: string): ExerciseDefinition[] {
  return calisthenicsExercises
    .filter((exercise) => exercise.progressionGroup === group)
    .sort((a, b) => (a.progressionOrder ?? 0) - (b.progressionOrder ?? 0));
}

export function selectExerciseForProfile(group: string, profile: AssessmentProfile): ExerciseDefinition | undefined {
  const family = getProgressionFamily(group);
  if (!family.length) return undefined;
  const rank = levelRank[profile.nivelCalculado];
  const eligible = family.filter((exercise) => exercise.levels.some((level) => levelRank[level] <= rank));
  return eligible.at(-1) ?? family[0];
}

export function nextProgression(
  exerciseId: string,
  recentEfforts: EffortFeedback[],
): ExerciseDefinition | undefined {
  const current = calisthenicsExercises.find((exercise) => exercise.id === exerciseId);
  if (!current?.progressionGroup) return current;
  const family = getProgressionFamily(current.progressionGroup);
  const index = family.findIndex((exercise) => exercise.id === exerciseId);
  if (index < 0) return current;

  const lastThree = recentEfforts.slice(-3);
  const readyToProgress = lastThree.length === 3 && lastThree.every((effort) => effort === 'leve' || effort === 'adequado');
  const needsRegression = recentEfforts.at(-1) === 'interrompido';

  if (needsRegression && index > 0) return family[index - 1];
  if (readyToProgress && index < family.length - 1) return family[index + 1];
  return current;
}
