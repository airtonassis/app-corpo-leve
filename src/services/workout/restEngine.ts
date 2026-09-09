import { AssessmentProfile } from '../../types/assessment';
import { ExerciseCategory, ExerciseDefinition } from '../../types/program';

const categoryBase: Record<ExerciseCategory, number> = {
  aquecimento: 20,
  mobilidade: 20,
  condicionamento: 35,
  core: 45,
  pernas: 50,
  empurrar: 55,
  puxar: 60,
};

export function calculateRestSeconds(
  profile: AssessmentProfile,
  exercise: Pick<ExerciseDefinition, 'category' | 'progressionOrder'>,
  phase: 1 | 2 | 3,
): number {
  let rest = categoryBase[exercise.category];

  if (profile.nivelCalculado === 'iniciante') rest += 15;
  if (profile.nivelCalculado === 'avancado') rest -= 5;
  if (profile.objetivoPrincipal === 'forca') rest += 15;
  if (profile.objetivoPrincipal === 'condicionamento') rest -= 10;
  if (profile.objetivoPrincipal === 'consistencia') rest -= 5;
  if ((exercise.progressionOrder ?? 1) >= 4) rest += 10;
  if (profile.pontosAtencao.length > 0) rest += 10;
  if (phase === 1) rest += 5;

  return Math.max(20, Math.min(90, Math.round(rest / 5) * 5));
}

export function calculatePostExerciseRestSeconds(restBetweenSetsSeconds: number): number {
  return Math.max(30, Math.min(90, restBetweenSetsSeconds + 15));
}
