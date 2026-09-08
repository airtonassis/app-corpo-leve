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
  imagemUrl?: string; // imagem/gif demonstrando a execução correta
}

// --- Melhoria 1: Cadastro/quiz do usuário e cálculo de IMC ---
export type NivelExperiencia = 'iniciante' | 'intermediaria' | 'avancada';

export interface PerfilUsuario {
  nome: string;
  idade: number;
  pesoKg: number;
  alturaCm: number;
  nivelExperiencia: NivelExperiencia;
  objetivo: string;
  quizConcluido: boolean;
  atualizadoEm: string; // ISO date
}

export interface ResultadoImc {
  valor: number;
  classificacao: string;
}

// --- Melhoria 2: Registro de data/hora de início e término de cada exercício ---
export interface ExecucaoExercicio {
  exercicioId: string;
  data: string; // ISO date (dia da execução)
  horaInicio: string; // ISO datetime
  horaFim?: string; // ISO datetime
}

export interface ExecucaoTreino {
  treinoId: string;
  data: string; // ISO date
  horaInicio: string;
  horaFim?: string;
  execucoesExercicios: ExecucaoExercicio[];
}

// --- Melhoria 6: Mensagens motivacionais por tema ---
export type TemaMotivacional = 'forca' | 'foco' | 'disciplina' | 'resultados';

export interface MensagemMotivacional {
  tema: TemaMotivacional;
  texto: string;
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

// --- V2: avaliação adaptativa, perfil calculado e jornada de programas ---
export * from './quiz';
export * from './assessment';
export * from './program';
