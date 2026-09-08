import { Fase, Treino, Conquista } from '../types';
import { colors } from './theme';

export const FASES: Fase[] = [
  {
    id: 'F1',
    titulo: 'F1 · Fundamento',
    subtitulo: 'Construindo a base',
    descricao:
      'Aprenda os movimentos essenciais com técnica correta, no seu tempo, sem pressa.',
    cor: colors.primaryLight,
  },
  {
    id: 'F2',
    titulo: 'F2 · Força',
    subtitulo: 'Ganhando potência',
    descricao:
      'Aumente a intensidade e as repetições para desenvolver força real e progressiva.',
    cor: colors.accent,
  },
  {
    id: 'F3',
    titulo: 'F3 · Forma',
    subtitulo: 'Refinando o corpo',
    descricao:
      'Trabalhe definição, postura e controle corporal com variações mais desafiadoras.',
    cor: colors.primary,
  },
  {
    id: 'F4',
    titulo: 'F4 · Flow',
    subtitulo: 'Fluidez e autonomia',
    descricao:
      'Combine tudo o que aprendeu em treinos fluidos, com liberdade para explorar seu corpo.',
    cor: colors.primaryDark,
  },
];

export const TREINO_A: Treino = {
  id: 'treino-a',
  nome: 'Treino A · Full Body',
  fase: 'F1',
  exercicios: [
    {
      id: 'agachamento',
      nome: 'Agachamento',
      seriesRepeticoes: '3 séries de 12-15 repetições',
      instrucao: 'Pés na largura do quadril, desça controlando o joelho.',
    },
    {
      id: 'flexao-adaptada',
      nome: 'Flexão adaptada',
      seriesRepeticoes: '3 séries de 8-10 repetições',
      instrucao: 'Apoie os joelhos no chão mantendo o corpo alinhado.',
    },
    {
      id: 'ponte-gluteos',
      nome: 'Ponte de glúteos',
      seriesRepeticoes: '3 séries de 15 repetições',
      instrucao: 'Contraia o glúteo no topo do movimento por 1-2s.',
    },
    {
      id: 'prancha',
      nome: 'Prancha',
      seriesRepeticoes: '2-3 séries de 15-30s',
      instrucao: 'Mantenha o abdômen contraído e o quadril alinhado.',
    },
    {
      id: 'panturrilha',
      nome: 'Panturrilha',
      seriesRepeticoes: '3 séries de 15-20 repetições',
      instrucao: 'Suba na ponta dos pés de forma controlada.',
    },
  ],
};

export const CONQUISTAS_BASE: Conquista[] = [
  { id: 'primeiro-treino', titulo: 'Completei meu primeiro treino' },
  { id: 'flexao-adaptada', titulo: 'Aprendi uma flexão adaptada' },
  { id: 'prancha-melhorou', titulo: 'Melhorei minha prancha' },
  { id: 'semana-completa', titulo: 'Completei uma semana inteira de treinos' },
  { id: 'desafio-21-dias', titulo: 'Concluí o Desafio 21 Dias' },
];
