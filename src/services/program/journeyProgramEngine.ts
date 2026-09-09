import {
  JourneyCycleProgress,
  JourneyProgramState,
  ProgramDayExecution,
} from '../../types/program';
import { JOURNEY_CYCLES } from './cycleCatalog';

function cycleFromProgramId(programId: string): number | undefined {
  const match = /^cycle-(\d+)-/.exec(programId);
  if (!match) return undefined;
  const cycle = Number(match[1]);
  return Number.isFinite(cycle) ? cycle : undefined;
}

export function buildJourneyProgramState(
  executions: ProgramDayExecution[],
): JourneyProgramState {
  const completedByCycle = new Map<number, Set<string>>();

  executions
    .filter((item) => !!item.completedAt)
    .forEach((item) => {
      const cycle = cycleFromProgramId(item.programId);
      if (!cycle) return;
      const days = completedByCycle.get(cycle) ?? new Set<string>();
      // Em ciclos fechados o programId é estável; na Jornada Contínua cada
      // bloco possui um ID próprio. A chave composta impede que Sessão 1 do
      // bloco 2 seja confundida com Sessão 1 do bloco 1.
      days.add(`${item.programId}:${item.day}`);
      completedByCycle.set(cycle, days);
    });

  let previousCompleted = true;
  let currentCycle = 1;

  const cycles: JourneyCycleProgress[] = JOURNEY_CYCLES.map((definition) => {
    const completedDays = completedByCycle.get(definition.cycle)?.size ?? 0;
    const duration = definition.durationDays;
    const completed = duration ? completedDays >= duration : false;
    const unlocked = definition.cycle === 1 || previousCompleted;
    const completionRate = duration
      ? Math.min(100, Math.round((completedDays / duration) * 100))
      : 0;

    if (unlocked && !completed && currentCycle === 1) {
      currentCycle = definition.cycle;
    }

    const progress: JourneyCycleProgress = {
      definition,
      completedDays,
      completionRate,
      completed,
      unlocked,
      current: false,
    };

    previousCompleted = completed;
    return progress;
  });

  // O primeiro ciclo desbloqueado e ainda não concluído é o atual.
  const firstOpen = cycles.find((item) => item.unlocked && !item.completed);
  if (firstOpen) currentCycle = firstOpen.definition.cycle;
  else if (cycles.length) currentCycle = cycles[cycles.length - 1].definition.cycle;

  const current = cycles.find((item) => item.definition.cycle === currentCycle) ?? cycles[0];
  current.current = true;

  const nextCycle = cycles.find(
    (item) => item.definition.cycle === currentCycle + 1,
  )?.definition;

  const totalCompletedProgramDays = [...completedByCycle.values()]
    .reduce((sum, set) => sum + set.size, 0);

  let message = `${current.definition.name}: ${current.definition.userMessage}`;
  if (current.completed && nextCycle) {
    message = `Você concluiu ${current.definition.name}. A próxima etapa é ${nextCycle.name}.`;
  } else if (!current.definition.generatorReady && current.definition.cycle > 1) {
    message = `${current.definition.name} já faz parte da arquitetura da jornada; o gerador específico deste ciclo ainda precisa ser implementado.`;
  }

  return {
    currentCycle,
    currentCycleKey: current.definition.key,
    cycles,
    totalCompletedProgramDays,
    nextCycle,
    message,
  };
}
