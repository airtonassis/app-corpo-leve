export type FaseId = 'F1' | 'F2' | 'F3' | 'F4';

export interface Fase {
  id: FaseId;
  titulo: string;
  subtitulo: string;
  descricao: string;
  cor: string;
}

export interface Exercicio {
  id: string;
  nome: string;
  seriesRepeticoes: string; // ex: "3 séries de 10 repetições" ou "2-3 séries de 15-30s"
  instrucao?: string;
}

export interface Treino {
  id: string;
  nome: string;
  fase: FaseId;
  exercicios: Exercicio[];
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao?: string;
}

export interface RegistroSemanal {
  semana: number;
  comoMeSenti: string;
  proximaMeta: string;
  dataAtualizacao: string; // ISO date
}
