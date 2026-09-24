import { exerciseById } from '../../data/exercises/calisthenics';
import { ExerciseCategory, ProgramDay, SessionAvailabilityOption } from '../../types/program';

export interface SessionPreparationItem {
  id: string;
  title: string;
  seconds: number;
  instruction: string;
  reason: string;
}

export interface SessionPreparationPlan {
  title: string;
  estimatedMinutes: number;
  items: SessionPreparationItem[];
  validationStatus: 'pending';
}

const GENERAL: SessionPreparationItem = {
  id: 'prep-march', title: 'Marcha leve no lugar', seconds: 45,
  instruction: 'Comece em ritmo confortável, com passos curtos e respiração natural.',
  reason: 'Elevar gradualmente o ritmo antes dos movimentos principais.',
};

const BY_CATEGORY: Partial<Record<ExerciseCategory, SessionPreparationItem[]>> = {
  pernas: [
    { id:'prep-ankle', title:'Mobilidade de tornozelos', seconds:30, instruction:'Faça movimentos pequenos e controlados, sem forçar a amplitude.', reason:'Preparação para movimentos com apoio dos pés.' },
    { id:'prep-sit-stand', title:'Sentar e levantar controlado', seconds:40, instruction:'Use uma cadeira firme e faça poucas repetições confortáveis, priorizando controle.', reason:'Ensaio simples do padrão de agachar.' },
  ],
  empurrar: [
    { id:'prep-shoulder', title:'Mobilidade de ombros', seconds:30, instruction:'Faça círculos pequenos e confortáveis com os ombros.', reason:'Preparação para movimentos de empurrar.' },
    { id:'prep-wall-push', title:'Empurrar a parede com controle', seconds:35, instruction:'Apoie as mãos na parede e faça movimentos curtos e tranquilos.', reason:'Ensaio de baixa demanda do padrão de empurrar.' },
  ],
  core: [
    { id:'prep-trunk', title:'Organização do tronco e respiração', seconds:35, instruction:'Em posição confortável, respire normalmente e perceba o alinhamento do tronco.', reason:'Preparação para exercícios de estabilidade.' },
  ],
  puxar: [
    { id:'prep-scapular', title:'Movimento leve das escápulas', seconds:30, instruction:'Movimente os ombros para trás e para frente de forma pequena e confortável.', reason:'Preparação para padrões de puxar.' },
  ],
  mobilidade: [
    { id:'prep-joints', title:'Mobilidade geral leve', seconds:35, instruction:'Movimente as articulações que serão usadas sem buscar amplitude máxima.', reason:'Entrada gradual na sessão de mobilidade.' },
  ],
  condicionamento: [
    { id:'prep-step', title:'Passos laterais leves', seconds:35, instruction:'Alterne passos laterais em ritmo confortável e controlado.', reason:'Preparação gradual para a sessão.' },
  ],
};

function maxItems(option: SessionAvailabilityOption): number {
  if (option === '8_min') return 2;
  if (option === '12_min') return 3;
  return 4;
}

export function buildSessionPreparation(day: ProgramDay, availability: SessionAvailabilityOption): SessionPreparationPlan {
  const categories = day.exercises
    .map((item) => exerciseById[item.exerciseId]?.category)
    .filter((value): value is ExerciseCategory => !!value && value !== 'aquecimento');
  const unique = categories.filter((value, index) => categories.indexOf(value) === index);
  const candidates = [GENERAL, ...unique.flatMap((category) => BY_CATEGORY[category] ?? [])];
  const items = candidates.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index).slice(0, maxItems(availability));
  const seconds = items.reduce((sum, item) => sum + item.seconds, 0);
  return { title:'Preparação para o treino', estimatedMinutes: Math.max(1, Math.ceil(seconds / 60)), items, validationStatus:'pending' };
}

export function buildCooldownPlan(): SessionPreparationPlan {
  return {
    title:'Retorno à calma', estimatedMinutes:2, validationStatus:'pending',
    items:[
      { id:'cool-walk', title:'Movimento leve', seconds:45, instruction:'Reduza o ritmo aos poucos com passos leves ou permanecendo em pé de forma confortável.', reason:'Fazer uma transição gradual após a sessão.' },
      { id:'cool-breathe', title:'Respiração confortável', seconds:45, instruction:'Respire naturalmente, sem prender ou forçar a respiração.', reason:'Encerrar a sessão em ritmo confortável.' },
    ],
  };
}
