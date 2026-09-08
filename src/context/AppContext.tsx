import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  FaseId,
  RegistroSemanal,
  PerfilUsuario,
  ExecucaoTreino,
  ExecucaoExercicio,
} from '../types';
import { agendarLembreteDiario, cancelarLembreteDiario, notificarConquista } from '../utils/notifications';
import { mensagemAleatoria } from '../constants/motivacional';

interface AppContextData {
  faseAtual: FaseId;
  setFaseAtual: (fase: FaseId) => void;

  // exercícios concluídos por id de treino -> lista de ids de exercício
  exerciciosConcluidos: Record<string, string[]>;
  toggleExercicio: (treinoId: string, exercicioId: string) => void;
  isExercicioConcluido: (treinoId: string, exercicioId: string) => boolean;
  treinosFinalizados: string[];

  // conquistas
  conquistasDesbloqueadas: string[];
  toggleConquista: (conquistaId: string) => void;

  // planner semanal
  registros: RegistroSemanal[];
  salvarRegistroSemanal: (registro: RegistroSemanal) => void;

  // Melhoria 1: perfil do usuário / quiz
  perfil: PerfilUsuario | null;
  salvarPerfil: (perfil: PerfilUsuario) => void;

  // Melhoria 2: data/hora de início e término de cada exercício e do treino
  execucoesTreino: ExecucaoTreino[];
  iniciarExecucaoTreino: (treinoId: string) => void;
  marcarInicioExercicio: (treinoId: string, exercicioId: string) => void;
  marcarFimExercicio: (treinoId: string, exercicioId: string) => void;
  finalizarTreino: (treinoId: string) => void;

  // Melhoria 3: notificações
  notificacoesAtivas: boolean;
  ativarNotificacoes: (horaPreferida?: number) => Promise<void>;
  desativarNotificacoes: () => Promise<void>;

  // Melhoria 6: última mensagem motivacional gerada (para exibir em telas/alertas)
  ultimaMensagemMotivacional: string | null;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [faseAtual, setFaseAtual] = useState<FaseId>('F1');
  const [exerciciosConcluidos, setExerciciosConcluidos] = useState<Record<string, string[]>>({});
  const [treinosFinalizados, setTreinosFinalizados] = useState<string[]>([]);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState<string[]>([]);
  const [registros, setRegistros] = useState<RegistroSemanal[]>([]);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [execucoesTreino, setExecucoesTreino] = useState<ExecucaoTreino[]>([]);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [ultimaMensagemMotivacional, setUltimaMensagemMotivacional] = useState<string | null>(null);

  const toggleExercicio = useCallback((treinoId: string, exercicioId: string) => {
    setExerciciosConcluidos((prev) => {
      const atuais = prev[treinoId] ?? [];
      const jaConcluido = atuais.includes(exercicioId);
      const novaLista = jaConcluido
        ? atuais.filter((id) => id !== exercicioId)
        : [...atuais, exercicioId];
      return { ...prev, [treinoId]: novaLista };
    });
  }, []);

  const isExercicioConcluido = useCallback(
    (treinoId: string, exercicioId: string) => {
      return (exerciciosConcluidos[treinoId] ?? []).includes(exercicioId);
    },
    [exerciciosConcluidos]
  );

  const salvarPerfil = useCallback((novoPerfil: PerfilUsuario) => {
    setPerfil({ ...novoPerfil, atualizadoEm: new Date().toISOString() });
  }, []);

  // --- Melhoria 2: rastreamento de data/hora ---

  const iniciarExecucaoTreino = useCallback((treinoId: string) => {
    const hoje = new Date().toISOString().slice(0, 10);
    setExecucoesTreino((prev) => {
      const jaExisteHoje = prev.find((e) => e.treinoId === treinoId && e.data === hoje && !e.horaFim);
      if (jaExisteHoje) return prev;
      const nova: ExecucaoTreino = {
        treinoId,
        data: hoje,
        horaInicio: new Date().toISOString(),
        execucoesExercicios: [],
      };
      return [...prev, nova];
    });
  }, []);

  const marcarInicioExercicio = useCallback((treinoId: string, exercicioId: string) => {
    const hoje = new Date().toISOString().slice(0, 10);
    setExecucoesTreino((prev) =>
      prev.map((execucao) => {
        if (execucao.treinoId !== treinoId || execucao.data !== hoje || execucao.horaFim) {
          return execucao;
        }
        const jaIniciado = execucao.execucoesExercicios.find(
          (e) => e.exercicioId === exercicioId
        );
        if (jaIniciado) return execucao;

        const novaExecucao: ExecucaoExercicio = {
          exercicioId,
          data: hoje,
          horaInicio: new Date().toISOString(),
        };
        return {
          ...execucao,
          execucoesExercicios: [...execucao.execucoesExercicios, novaExecucao],
        };
      })
    );
  }, []);

  const marcarFimExercicio = useCallback((treinoId: string, exercicioId: string) => {
    const hoje = new Date().toISOString().slice(0, 10);
    setExecucoesTreino((prev) =>
      prev.map((execucao) => {
        if (execucao.treinoId !== treinoId || execucao.data !== hoje) return execucao;
        return {
          ...execucao,
          execucoesExercicios: execucao.execucoesExercicios.map((e) =>
            e.exercicioId === exercicioId && !e.horaFim
              ? { ...e, horaFim: new Date().toISOString() }
              : e
          ),
        };
      })
    );
  }, []);

  const finalizarTreino = useCallback((treinoId: string) => {
    const hoje = new Date().toISOString().slice(0, 10);

    setTreinosFinalizados((prev) => (prev.includes(treinoId) ? prev : [...prev, treinoId]));

    setExecucoesTreino((prev) =>
      prev.map((execucao) =>
        execucao.treinoId === treinoId && execucao.data === hoje && !execucao.horaFim
          ? { ...execucao, horaFim: new Date().toISOString() }
          : execucao
      )
    );

    // desbloqueia automaticamente a conquista de primeiro treino
    setConquistasDesbloqueadas((prev) =>
      prev.includes('primeiro-treino') ? prev : [...prev, 'primeiro-treino']
    );

    // Melhoria 6: mensagem motivacional ao concluir
    const mensagem = mensagemAleatoria();
    setUltimaMensagemMotivacional(mensagem.texto);
    notificarConquista(mensagem.texto).catch(() => {
      // notificações podem estar desativadas; segue sem bloquear o fluxo
    });
  }, []);

  const toggleConquista = useCallback((conquistaId: string) => {
    setConquistasDesbloqueadas((prev) =>
      prev.includes(conquistaId) ? prev.filter((id) => id !== conquistaId) : [...prev, conquistaId]
    );
  }, []);

  const salvarRegistroSemanal = useCallback((registro: RegistroSemanal) => {
    setRegistros((prev) => {
      const semExistente = prev.filter((r) => r.semana !== registro.semana);
      return [...semExistente, registro].sort((a, b) => a.semana - b.semana);
    });
  }, []);

  // --- Melhoria 3: notificações ---

  const ativarNotificacoes = useCallback(async (horaPreferida = 20) => {
    await agendarLembreteDiario(horaPreferida, 0);
    setNotificacoesAtivas(true);
  }, []);

  const desativarNotificacoes = useCallback(async () => {
    await cancelarLembreteDiario();
    setNotificacoesAtivas(false);
  }, []);

  const value: AppContextData = {
    faseAtual,
    setFaseAtual,
    exerciciosConcluidos,
    toggleExercicio,
    isExercicioConcluido,
    treinosFinalizados,
    conquistasDesbloqueadas,
    toggleConquista,
    registros,
    salvarRegistroSemanal,
    perfil,
    salvarPerfil,
    execucoesTreino,
    iniciarExecucaoTreino,
    marcarInicioExercicio,
    marcarFimExercicio,
    finalizarTreino,
    notificacoesAtivas,
    ativarNotificacoes,
    desativarNotificacoes,
    ultimaMensagemMotivacional,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextData {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um <AppProvider>');
  }
  return context;
}
