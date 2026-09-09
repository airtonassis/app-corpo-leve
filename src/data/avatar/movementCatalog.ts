import { AvatarMovementDefinition, AvatarMotionKey, ExerciseDefinition } from '../../types/program';

const FAMILY_MOVEMENTS: Record<AvatarMotionKey, AvatarMovementDefinition> = {
  warmup: {
    key: 'warmup', motionKey: 'warmup', tempoLabel: 'Ritmo leve e contínuo',
    phases: [
      { key: 'preparar', title: 'Prepare-se', cue: 'Postura confortável e respiração natural.', durationMs: 900 },
      { key: 'executar', title: 'Movimente', cue: 'Comece leve e aumente o ritmo aos poucos.', durationMs: 1600 },
      { key: 'retornar', title: 'Mantenha', cue: 'Conserve um ritmo que permita controle.', durationMs: 1000 },
    ],
    techniquePoints: [
      { id: 'warm-posture', label: 'Postura confortável', region: 'tronco' },
      { id: 'warm-breath', label: 'Respiração livre', region: 'respiracao' },
    ],
    commonMistakes: ['Começar rápido demais', 'Prender a respiração'],
  },
  pushup: {
    key: 'pushup', motionKey: 'pushup', tempoLabel: 'Descida controlada • subida controlada',
    phases: [
      { key: 'preparar', title: 'Posição inicial', cue: 'Apoie as mãos e organize o corpo em uma linha confortável.', durationMs: 900 },
      { key: 'executar', title: 'Desça', cue: 'Flexione os cotovelos com controle, mantendo o tronco estável.', durationMs: 1200 },
      { key: 'retornar', title: 'Suba', cue: 'Empurre a base de apoio e retorne sem perder o alinhamento.', durationMs: 1200 },
    ],
    techniquePoints: [
      { id: 'push-hands', label: 'Mãos firmes na base', region: 'maos', phases: ['preparar', 'executar'], priority: 2, cue: 'Mantenha as mãos firmes durante a descida.' },
      { id: 'push-trunk', label: 'Tronco alinhado', region: 'tronco', phases: ['executar', 'retornar'], priority: 1, cue: 'Mantenha cabeça, tronco e quadril organizados.' },
      { id: 'push-shoulders', label: 'Ombros confortáveis', region: 'ombros', phases: ['preparar', 'executar'], priority: 2, cue: 'Evite encolher os ombros.' },
    ],
    commonMistakes: ['Deixar o quadril cair', 'Encolher os ombros', 'Apressar a descida'],
  },
  squat: {
    key: 'squat', motionKey: 'squat', tempoLabel: 'Desça com controle • estabilize • suba',
    phases: [
      { key: 'preparar', title: 'Posição inicial', cue: 'Pés firmes e postura confortável.', durationMs: 900 },
      { key: 'executar', title: 'Desça', cue: 'Leve o quadril para baixo mantendo os joelhos estáveis.', durationMs: 1300 },
      { key: 'retornar', title: 'Suba', cue: 'Empurre o chão e retorne com controle.', durationMs: 1200 },
    ],
    techniquePoints: [
      { id: 'squat-feet', label: 'Pés apoiados', region: 'pes', phases: ['preparar', 'executar', 'retornar'], priority: 2, cue: 'Mantenha os pés firmes no apoio.' },
      { id: 'squat-knees', label: 'Joelhos estáveis', region: 'joelhos', phases: ['executar', 'retornar'], priority: 1, cue: 'Mantenha os joelhos estáveis durante a descida e a subida.' },
      { id: 'squat-trunk', label: 'Tronco controlado', region: 'tronco', phases: ['executar'], priority: 2, cue: 'Controle o tronco enquanto o quadril desce.' },
    ],
    commonMistakes: ['Perder o apoio dos pés', 'Descer além do confortável', 'Acelerar sem controle'],
  },
  lunge: {
    key: 'lunge', motionKey: 'lunge', tempoLabel: 'Desça e suba de forma estável',
    phases: [
      { key: 'preparar', title: 'Organize a base', cue: 'Afaste os pés e use apoio se estiver previsto.', durationMs: 900 },
      { key: 'executar', title: 'Desça', cue: 'Flexione os joelhos dentro de uma amplitude confortável.', durationMs: 1300 },
      { key: 'retornar', title: 'Retorne', cue: 'Suba com controle e reencontre o equilíbrio.', durationMs: 1200 },
    ],
    techniquePoints: [
      { id: 'lunge-base', label: 'Base estável', region: 'pes', phases: ['preparar'], priority: 1, cue: 'Organize uma base estável antes de descer.' },
      { id: 'lunge-knee', label: 'Joelho controlado', region: 'joelhos', phases: ['executar', 'retornar'], priority: 1, cue: 'Desça apenas até onde o joelho permaneça confortável e controlado.' },
      { id: 'lunge-trunk', label: 'Tronco estável', region: 'tronco', phases: ['executar'], priority: 2, cue: 'Evite inclinar o tronco bruscamente.' },
    ],
    commonMistakes: ['Base estreita demais', 'Perder o equilíbrio', 'Forçar amplitude'],
  },
  pull: {
    key: 'pull', motionKey: 'pull', tempoLabel: 'Puxe sem impulso • retorne com controle',
    phases: [
      { key: 'preparar', title: 'Posição inicial', cue: 'Segure apenas uma estrutura firme e apropriada.', durationMs: 900 },
      { key: 'executar', title: 'Puxe', cue: 'Aproxime o corpo usando costas e braços, sem balanço.', durationMs: 1200 },
      { key: 'retornar', title: 'Desça', cue: 'Retorne devagar e mantenha o controle.', durationMs: 1300 },
    ],
    techniquePoints: [
      { id: 'pull-grip', label: 'Pegada firme', region: 'maos', phases: ['preparar', 'executar'], priority: 1, cue: 'Confirme uma pegada firme e uma estrutura estável.' },
      { id: 'pull-shoulder', label: 'Ombros organizados', region: 'ombros', phases: ['executar', 'retornar'], priority: 1, cue: 'Puxe sem elevar os ombros de forma desconfortável.' },
      { id: 'pull-trunk', label: 'Sem balanço', region: 'tronco', phases: ['executar'], priority: 2, cue: 'Evite usar impulso do tronco.' },
    ],
    commonMistakes: ['Usar impulso', 'Soltar o corpo rapidamente', 'Usar estrutura instável'],
  },
  plank: {
    key: 'plank', motionKey: 'plank', tempoLabel: 'Sustentação controlada',
    phases: [
      { key: 'preparar', title: 'Apoie-se', cue: 'Encontre uma posição estável para mãos, antebraços ou joelhos.', durationMs: 900 },
      { key: 'executar', title: 'Sustente', cue: 'Mantenha o tronco alinhado e continue respirando.', durationMs: 1800 },
      { key: 'retornar', title: 'Finalize', cue: 'Saia da posição com controle antes de perder o alinhamento.', durationMs: 900 },
    ],
    techniquePoints: [
      { id: 'plank-trunk', label: 'Tronco alinhado', region: 'tronco', phases: ['executar'], priority: 1, cue: 'Sustente uma posição estável sem deixar o quadril perder o alinhamento.' },
      { id: 'plank-shoulder', label: 'Ombros confortáveis', region: 'ombros', phases: ['preparar', 'executar'], priority: 2, cue: 'Organize os apoios sem forçar os ombros.' },
      { id: 'plank-breath', label: 'Respiração contínua', region: 'respiracao', phases: ['executar'], priority: 1, cue: 'Continue respirando durante a sustentação.' },
    ],
    commonMistakes: ['Prender a respiração', 'Manter a posição após perder o controle'],
  },
  'core-floor': {
    key: 'core-floor', motionKey: 'core-floor', tempoLabel: 'Movimento lento e estável',
    phases: [
      { key: 'preparar', title: 'Posição inicial', cue: 'Organize o tronco e os pontos de apoio.', durationMs: 900 },
      { key: 'executar', title: 'Movimente', cue: 'Mova braços ou pernas sem perder estabilidade do tronco.', durationMs: 1400 },
      { key: 'retornar', title: 'Retorne', cue: 'Volte à posição inicial suavemente.', durationMs: 1200 },
    ],
    techniquePoints: [
      { id: 'core-trunk', label: 'Tronco estável', region: 'tronco', phases: ['executar'], priority: 1, cue: 'Mantenha o tronco estável enquanto braços ou pernas se movem.' },
      { id: 'core-breath', label: 'Respire naturalmente', region: 'respiracao', phases: ['executar'], priority: 2, cue: 'Continue respirando sem prender o ar.' },
    ],
    commonMistakes: ['Fazer movimentos bruscos', 'Perder a posição do tronco'],
  },
  mobility: {
    key: 'mobility', motionKey: 'mobility', tempoLabel: 'Amplitude confortável',
    phases: [
      { key: 'preparar', title: 'Organize-se', cue: 'Comece em uma posição confortável.', durationMs: 900 },
      { key: 'executar', title: 'Explore', cue: 'Mova apenas dentro de uma amplitude confortável.', durationMs: 1700 },
      { key: 'retornar', title: 'Retorne', cue: 'Volte devagar e sem forçar.', durationMs: 1200 },
    ],
    techniquePoints: [
      { id: 'mob-control', label: 'Movimento sem impulso', region: 'geral', phases: ['executar', 'retornar'], priority: 1, cue: 'Mova devagar, sem balanço ou impulso.' },
      { id: 'mob-range', label: 'Amplitude confortável', region: 'geral', phases: ['executar'], priority: 2, cue: 'Use apenas uma amplitude confortável.' },
    ],
    commonMistakes: ['Forçar amplitude', 'Usar balanço rápido'],
  },
  cardio: {
    key: 'cardio', motionKey: 'cardio', tempoLabel: 'Ritmo contínuo e controlável',
    phases: [
      { key: 'preparar', title: 'Comece leve', cue: 'Encontre espaço seguro para se movimentar.', durationMs: 800 },
      { key: 'executar', title: 'Mantenha o ritmo', cue: 'Use um ritmo que ainda permita controle do movimento.', durationMs: 1400 },
      { key: 'retornar', title: 'Reduza', cue: 'Diminua o ritmo progressivamente.', durationMs: 900 },
    ],
    techniquePoints: [
      { id: 'cardio-space', label: 'Espaço livre', region: 'geral', phases: ['preparar'], priority: 1, cue: 'Confirme que há espaço livre ao seu redor.' },
      { id: 'cardio-control', label: 'Ritmo controlado', region: 'respiracao', phases: ['executar'], priority: 1, cue: 'Mantenha um ritmo que ainda permita controle.' },
    ],
    commonMistakes: ['Acelerar além do controle', 'Ignorar o espaço ao redor'],
  },
  default: {
    key: 'default', motionKey: 'default', tempoLabel: 'Execução controlada',
    phases: [
      { key: 'preparar', title: 'Prepare-se', cue: 'Leia as orientações antes de começar.', durationMs: 900 },
      { key: 'executar', title: 'Execute', cue: 'Faça o movimento com controle.', durationMs: 1300 },
      { key: 'retornar', title: 'Finalize', cue: 'Retorne à posição inicial com calma.', durationMs: 1000 },
    ],
    techniquePoints: [{ id: 'default-control', label: 'Controle do movimento', region: 'geral', phases: ['executar', 'retornar'], priority: 1, cue: 'Execute com controle e finalize sem pressa.' }],
    commonMistakes: ['Acelerar a execução sem necessidade'],
  },
};

const SPECIFIC_OVERRIDES: Record<string, Partial<AvatarMovementDefinition>> = {
  'push-wall': {
    tempoLabel: 'Aproxime o peito da parede • empurre para voltar',
    techniquePoints: [
      { id: 'pw-hands', label: 'Mãos na altura confortável', region: 'maos' },
      { id: 'pw-body', label: 'Corpo alinhado', region: 'tronco' },
      { id: 'pw-heels', label: 'Pés firmes', region: 'pes' },
    ],
  },
  'push-incline': {
    tempoLabel: 'Desça até uma amplitude confortável • empurre para subir',
  },
  'squat-chair': {
    phases: [
      { key: 'preparar', title: 'Frente à cadeira', cue: 'Posicione-se próximo a uma cadeira firme.', durationMs: 900 },
      { key: 'executar', title: 'Sente com controle', cue: 'Leve o quadril para trás até tocar a cadeira suavemente.', durationMs: 1300 },
      { key: 'retornar', title: 'Levante', cue: 'Apoie os pés e retorne sem impulso.', durationMs: 1200 },
    ],
  },
  'pullup-negative': {
    tempoLabel: 'Comece alto com acesso seguro • desça lentamente',
    commonMistakes: ['Saltar para alcançar a barra', 'Descer sem controle', 'Usar estrutura inadequada'],
  },
};

export function getAvatarMovement(exercise: ExerciseDefinition, motionKey: AvatarMotionKey): AvatarMovementDefinition {
  const base = FAMILY_MOVEMENTS[motionKey] ?? FAMILY_MOVEMENTS.default;
  const override = SPECIFIC_OVERRIDES[exercise.id];
  if (!override) return base;
  return {
    ...base,
    ...override,
    key: exercise.id,
    motionKey,
    phases: override.phases ?? base.phases,
    techniquePoints: override.techniquePoints ?? base.techniquePoints,
    commonMistakes: override.commonMistakes ?? base.commonMistakes,
  };
}
