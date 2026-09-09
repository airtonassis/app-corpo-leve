import { AssessmentProfile } from '../../types/assessment';
import {
  ExerciseCategory,
  FreeExerciseOption,
  FreeSessionGuardResult,
  ProgramDayExecution,
  ProgramDefinition,
} from '../../types/program';
import { calisthenicsExercises, exerciseById } from '../../data/exercises/calisthenics';
import { resolveFreeModePolicy } from './freeModePolicy';

function localDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hasEquipment(profile: AssessmentProfile, required: string[]): boolean {
  if (!required.length || required.includes('nenhum')) return true;
  const resources = new Set(profile.recursosDisponiveis ?? []);
  return required.some((item) => resources.has(item));
}

function hasAttentionConflict(profile: AssessmentProfile, avoidWhen?: string[]): boolean {
  if (!avoidWhen?.length) return false;
  const attention = new Set([
    ...(profile.regioesAtencao ?? []),
    ...(profile.pontosAtencao ?? []),
  ]);
  return avoidWhen.some((item) => attention.has(item));
}

function familyOf(exerciseId: string): string {
  const exercise = exerciseById[exerciseId];
  return exercise?.progressionGroup ?? exercise?.category ?? 'geral';
}

function categoryPriority(category: ExerciseCategory, workedToday: Set<string>): number {
  if (category === 'mobilidade') return 80;
  if (category === 'aquecimento') return 75;
  if (!workedToday.has(category)) return 60;
  return 20;
}

export function buildFreeSessionGuard(
  profile: AssessmentProfile,
  program: ProgramDefinition,
  executions: ProgramDayExecution[],
  now: Date = new Date(),
): FreeSessionGuardResult {
  const policy = resolveFreeModePolicy(program.cycle);
  const today = localDateKey(now);
  const completedToday = executions.filter(
    (item) =>
      item.programId === program.id &&
      !!item.completedAt &&
      localDateKey(item.completedAt) === today,
  );

  const plannedActivityCompletedToday = completedToday.length > 0;

  if (!plannedActivityCompletedToday) {
    return {
      allowed: false,
      plannedActivityCompletedToday: false,
      maxExercises: 0,
      maxMinutes: 0,
      policy,
      options: [],
      messages: [
        'A atividade planejada do Corpo Leve ainda não foi concluída hoje.',
        'O Modo Livre Assistido fica disponível depois da sessão principal para complementar a jornada, não para substituí-la.',
      ],
    };
  }

  const workedFamilies = new Set<string>();
  const workedCategories = new Set<string>();

  completedToday.forEach((execution) => {
    execution.exercises.forEach((record) => {
      const exercise = exerciseById[record.exerciseId];
      if (!exercise) return;
      workedFamilies.add(familyOf(record.exerciseId));
      workedCategories.add(exercise.category);
    });
  });

  const latestEffortByFamily = new Map<string, string>();
  completedToday.forEach((execution) => {
    execution.exercises.forEach((record) => {
      if (record.effort) latestEffortByFamily.set(familyOf(record.exerciseId), record.effort);
    });
  });

  const options: FreeExerciseOption[] = calisthenicsExercises
    .filter((exercise) => exercise.category !== 'condicionamento')
    .map((exercise) => {
      const reasons: string[] = [];
      const family = familyOf(exercise.id);

      if (!exercise.levels.includes(profile.nivelCalculado)) {
        return {
          exerciseId: exercise.id,
          availability: 'bloqueado' as const,
          reasons: ['variação fora do nível atual'],
          family,
        };
      }

      if (!hasEquipment(profile, exercise.equipment)) {
        return {
          exerciseId: exercise.id,
          availability: 'bloqueado' as const,
          reasons: ['equipamento não disponível'],
          family,
        };
      }

      if (hasAttentionConflict(profile, exercise.avoidWhen)) {
        return {
          exerciseId: exercise.id,
          availability: 'bloqueado' as const,
          reasons: ['não recomendado para um ponto de atenção registrado'],
          family,
        };
      }

      const effort = latestEffortByFamily.get(family);
      if (effort === 'interrompido' || effort === 'dificil') {
        return {
          exerciseId: exercise.id,
          availability: 'nao_recomendado' as const,
          reasons: ['essa família já exigiu mais esforço hoje'],
          family,
        };
      }

      if (exercise.category === 'mobilidade' || exercise.category === 'aquecimento') {
        reasons.push('adequado para uma prática complementar leve');
      } else if (workedFamilies.has(family)) {
        reasons.push('família já trabalhada na sessão principal');
      } else {
        reasons.push('família ainda não apareceu na sessão principal de hoje');
      }

      const priority = categoryPriority(exercise.category, workedCategories);
      const workedFamily = workedFamilies.has(family);
      return {
        exerciseId: exercise.id,
        availability: priority >= 70
          ? 'recomendado' as const
          : workedFamily
            ? (policy.allowWorkedFamilyWithGuidance ? 'disponivel' as const : 'nao_recomendado' as const)
            : 'disponivel' as const,
        reasons: workedFamily && policy.allowWorkedFamilyWithGuidance
          ? [...reasons, 'disponível com orientação porque essa família já apareceu hoje']
          : reasons,
        family,
      };
    })
    .sort((a, b) => {
      const order = { recomendado: 0, disponivel: 1, nao_recomendado: 2, bloqueado: 3 };
      return order[a.availability] - order[b.availability];
    });

  return {
    allowed: true,
    plannedActivityCompletedToday: true,
    maxExercises: policy.maxExercises,
    maxMinutes: policy.maxMinutes,
    policy,
    options,
    messages: [
      'Sua atividade principal de hoje já foi concluída.',
      'Escolha uma prática complementar curta, priorizando técnica e mobilidade.',
      'O Modo Livre Assistido não aumenta sua progressão automática nem substitui recuperação.',
    ],
  };
}
