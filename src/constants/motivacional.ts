import { MensagemMotivacional, TemaMotivacional } from '../types';

export const MENSAGENS_MOTIVACIONAIS: MensagemMotivacional[] = [
  // Força
  { tema: 'forca', texto: 'Cada repetição constrói uma versão mais forte de você.' },
  { tema: 'forca', texto: 'Força não se ganha da noite pro dia — e você está construindo a sua.' },
  { tema: 'forca', texto: 'Seu corpo é capaz de muito mais do que você imagina.' },

  // Foco
  { tema: 'foco', texto: 'Um treino de cada vez. Um dia de cada vez.' },
  { tema: 'foco', texto: 'O foco de hoje é o resultado de amanhã.' },
  { tema: 'foco', texto: 'Você não precisa ser perfeita, só precisa continuar.' },

  // Disciplina
  { tema: 'disciplina', texto: 'Disciplina é escolher entre o que você quer agora e o que você quer mais.' },
  { tema: 'disciplina', texto: 'Consistência supera intensidade. Você está no caminho certo.' },
  { tema: 'disciplina', texto: 'Aparecer todos os dias já é metade da conquista.' },

  // Resultados
  { tema: 'resultados', texto: 'Olhe para trás: você já percorreu um caminho que vale comemorar.' },
  { tema: 'resultados', texto: 'Os resultados chegam para quem não desiste no meio do caminho.' },
  { tema: 'resultados', texto: 'Mais um desafio concluído — sua evolução é real.' },
];

export function mensagemAleatoria(tema?: TemaMotivacional): MensagemMotivacional {
  const pool = tema
    ? MENSAGENS_MOTIVACIONAIS.filter((m) => m.tema === tema)
    : MENSAGENS_MOTIVACIONAIS;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export const TEMAS_LABEL: Record<TemaMotivacional, string> = {
  forca: 'Força',
  foco: 'Foco',
  disciplina: 'Disciplina',
  resultados: 'Resultados',
};
