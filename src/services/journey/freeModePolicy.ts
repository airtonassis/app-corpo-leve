import { FreeModePolicy } from '../../types/program';

const POLICIES: Record<number, FreeModePolicy> = {
  1: {
    cycle: 1,
    stageLabel: 'Fundamentos',
    guidanceLevel: 'alto',
    maxExercises: 2,
    maxMinutes: 10,
    allowWorkedFamilyWithGuidance: false,
    allowBuildPracticeIntent: false,
    explanation: 'Você escolhe dentro de opções bem protegidas enquanto aprende a reconhecer técnica, ritmo e recuperação.',
  },
  2: {
    cycle: 2,
    stageLabel: 'Consistência',
    guidanceLevel: 'moderado',
    maxExercises: 2,
    maxMinutes: 12,
    allowWorkedFamilyWithGuidance: true,
    allowBuildPracticeIntent: false,
    explanation: 'Você ganha mais opções de escolha, mas o Corpo Leve ainda organiza boa parte da prática complementar.',
  },
  3: {
    cycle: 3,
    stageLabel: 'Evolução',
    guidanceLevel: 'moderado',
    maxExercises: 3,
    maxMinutes: 15,
    allowWorkedFamilyWithGuidance: true,
    allowBuildPracticeIntent: true,
    explanation: 'Você pode combinar mais movimentos compatíveis, enquanto o motor continua validando coerência e recuperação.',
  },
  4: {
    cycle: 4,
    stageLabel: 'Autonomia',
    guidanceLevel: 'leve',
    maxExercises: 3,
    maxMinutes: 15,
    allowWorkedFamilyWithGuidance: true,
    allowBuildPracticeIntent: true,
    explanation: 'Você decide mais e o Corpo Leve interfere principalmente quando encontra conflito de segurança, recuperação ou coerência.',
  },
};

export function resolveFreeModePolicy(cycle: number): FreeModePolicy {
  if (cycle <= 1) return POLICIES[1];
  if (cycle === 2) return POLICIES[2];
  if (cycle === 3) return POLICIES[3];
  return POLICIES[4];
}
