import { AvatarMovementPhaseKey } from '../../types/program';

export interface ExerciseVisualDemoFrame {
  order: number;
  phase: AvatarMovementPhaseKey;
  label: string;
  instruction: string;
}

export interface ExerciseVisualDemoDefinition {
  exerciseId: string;
  frames: ExerciseVisualDemoFrame[];
  reviewStatus: 'pending' | 'revision_required';
  version: string;
}

export const exerciseVisualDemoCatalog: Record<string, ExerciseVisualDemoDefinition> = {
  'squat-body': {
    exerciseId:'squat-body', reviewStatus:'pending', version:'visual-training-v1',
    frames:[
      { order:1, phase:'preparar', label:'Posição inicial', instruction:'Fique em pé em uma base confortável, com os pés firmes no chão.' },
      { order:2, phase:'executar', label:'Movimento', instruction:'Leve o quadril para trás e desça somente enquanto mantém controle.' },
      { order:3, phase:'retornar', label:'Retorno', instruction:'Empurre o chão com os pés e volte à posição inicial de forma controlada.' },
    ],
  },
  'push-incline': {
    exerciseId:'push-incline', reviewStatus:'pending', version:'visual-training-v1',
    frames:[
      { order:1, phase:'preparar', label:'Posição inicial', instruction:'Apoie as mãos em uma superfície firme e mantenha o corpo alinhado.' },
      { order:2, phase:'executar', label:'Movimento', instruction:'Aproxime o peito do apoio de forma controlada, mantendo o alinhamento.' },
      { order:3, phase:'retornar', label:'Retorno', instruction:'Empurre o apoio e retorne sem perder o controle do tronco.' },
    ],
  },
  'plank-forearm': {
    exerciseId:'plank-forearm', reviewStatus:'pending', version:'visual-training-v1',
    frames:[
      { order:1, phase:'preparar', label:'Posição', instruction:'Apoie os antebraços e organize o corpo em uma linha confortável.' },
      { order:2, phase:'executar', label:'Sustentação', instruction:'Mantenha a posição com respiração natural e encerre antes de perder o alinhamento.' },
    ],
  },
};
