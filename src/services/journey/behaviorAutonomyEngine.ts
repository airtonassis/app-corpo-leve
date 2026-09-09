import {
  BehaviorAutonomySnapshot,
  ComplementaryActivity,
  JourneyContinuitySummary,
  ProgramDayExecution,
  FreeSessionExecution,
} from '../../types/program';

export function buildBehaviorAutonomySnapshot(
  programId: string,
  executions: ProgramDayExecution[],
  continuity: JourneyContinuitySummary,
  complementaryActivities: ComplementaryActivity[],
  freeSessions: FreeSessionExecution[] = [],
): BehaviorAutonomySnapshot {
  const completedProgramSessions = executions.filter(
    (item) => item.programId === programId && item.completedAt,
  ).length;

  const relevantComplementary = complementaryActivities.filter(
    (item) => !item.programId || item.programId === programId,
  );

  const complementaryMinutes = Math.round(
    relevantComplementary.reduce((sum, item) => sum + item.durationSeconds, 0) / 60,
  );

  const signals: string[] = [];
  if (completedProgramSessions >= 2) signals.push('sessões planejadas registradas');
  if (continuity.shortSessions >= 2) signals.push('adapta o treino ao tempo disponível');
  if (continuity.returnCount >= 1) signals.push('retomou após um dia sem disponibilidade');
  if (relevantComplementary.length >= 1) signals.push('registrou movimento além do programa');
  if (relevantComplementary.length >= 3) signals.push('repete atividades complementares');
  const relevantFreeSessions = freeSessions.filter((item) => item.programId === programId);
  if (relevantFreeSessions.length >= 1) signals.push('usou o Modo Livre Assistido após a atividade principal');
  if (relevantFreeSessions.length >= 3) signals.push('faz escolhas complementares com mais autonomia');

  // These stages describe observed journey behavior. They are not a diagnosis
  // and do not claim that a habit has been formed after a fixed number of days.
  let stage: BehaviorAutonomySnapshot['stage'] = 'descobrindo';

  const consistencySignals =
    completedProgramSessions >= 4 &&
    (continuity.shortSessions >= 1 || continuity.returnCount >= 1);

  const autonomySignals =
    completedProgramSessions >= 7 &&
    continuity.shortSessions >= 2 &&
    (continuity.returnCount >= 1 || relevantComplementary.length >= 2 || relevantFreeSessions.length >= 2);

  const integratedMovementSignals =
    completedProgramSessions >= 10 &&
    relevantComplementary.length >= 4 &&
    continuity.returnCount >= 1;

  if (consistencySignals) stage = 'construindo_consistencia';
  if (autonomySignals) stage = 'ganhando_autonomia';
  if (integratedMovementSignals) stage = 'movimento_integrado';

  const messages: Record<BehaviorAutonomySnapshot['stage'], string> = {
    descobrindo:
      'Você está construindo referências sobre como encaixar movimento na sua rotina.',
    construindo_consistencia:
      'Você já apresenta sinais de continuidade: realizar, adaptar e retornar estão começando a aparecer na sua jornada.',
    ganhando_autonomia:
      'Você está usando mais de uma forma de manter a prática, adaptando o tempo e retomando quando necessário.',
    movimento_integrado:
      'O movimento está aparecendo de formas diferentes na sua rotina. O Corpo Leve continua orientando sem transformar isso em uma obrigação de sequência perfeita.',
  };

  return {
    stage,
    observedSignals: signals,
    completedProgramSessions,
    complementaryActivities: relevantComplementary.length,
    complementaryMinutes,
    returnCount: continuity.returnCount,
    shortSessionCount: continuity.shortSessions,
    freeAssistedSessions: relevantFreeSessions.length,
    message: messages[stage],
  };
}
