import { JourneyCycleDefinition } from '../../types/program';

export const JOURNEY_CYCLES: JourneyCycleDefinition[] = [
  {
    cycle: 1,
    key: 'fundamentos',
    name: 'Fundamentos',
    durationDays: 21,
    purpose: 'Aprender a começar, reconhecer técnica, adaptar o tempo e construir referências sobre a própria rotina.',
    userMessage: 'Eu consigo começar.',
    availability: 'disponivel',
    generatorReady: true,
  },
  {
    cycle: 2,
    key: 'consistencia',
    name: 'Consistência',
    durationDays: 42,
    purpose: 'Fortalecer continuidade, retomadas e escolhas compatíveis com o tempo realmente disponível.',
    userMessage: 'Estou conseguindo manter.',
    availability: 'disponivel',
    generatorReady: true,
  },
  {
    cycle: 3,
    key: 'evolucao',
    name: 'Evolução',
    durationDays: 63,
    purpose: 'Usar histórico funcional e comportamental para ampliar autonomia sem perder coerência de recuperação e técnica.',
    userMessage: 'Percebo minha evolução.',
    availability: 'disponivel',
    generatorReady: true,
  },
  {
    cycle: 4,
    key: 'autonomia',
    name: 'Autonomia',
    durationDays: 84,
    purpose: 'Aumentar o espaço de decisão do usuário enquanto o Corpo Leve atua principalmente como proteção e contexto.',
    userMessage: 'Isso já faz parte da minha rotina.',
    availability: 'disponivel',
    generatorReady: true,
  },
  {
    cycle: 5,
    key: 'continua',
    name: 'Jornada Contínua',
    purpose: 'Manter movimento, revisar objetivos e iniciar novos programas quando fizer sentido.',
    userMessage: 'Eu sei como continuar.',
    availability: 'continuo',
    generatorReady: true,
  },
];

export function cycleDefinition(cycle: number): JourneyCycleDefinition {
  if (cycle <= 1) return JOURNEY_CYCLES[0];
  if (cycle === 2) return JOURNEY_CYCLES[1];
  if (cycle === 3) return JOURNEY_CYCLES[2];
  if (cycle === 4) return JOURNEY_CYCLES[3];
  return JOURNEY_CYCLES[4];
}
