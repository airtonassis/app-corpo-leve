import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FaseId, RegistroSemanal } from '../types';

interface AppContextData {
  faseAtual: FaseId;
  setFaseAtual: (fase: FaseId) => void;

  // exercícios concluídos por id de treino -> set de ids de exercício
  exerciciosConcluidos: Record<string, string[]>;
  toggleExercicio: (treinoId: string, exercicioId: string) => void;
  isExercicioConcluido: (treinoId: string, exercicioId: string) => boolean;
  finalizarTreino: (treinoId: string) => void;
  treinosFinalizados: string[];

  // conquistas
  conquistasDesbloqueadas: string[];
  toggleConquista: (conquistaId: string) => void;

  // planner semanal
  registros: RegistroSemanal[];
  salvarRegistroSemanal: (registro: RegistroSemanal) => void;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [faseAtual, setFaseAtual] = useState<FaseId>('F1');
  const [exerciciosConcluidos, setExerciciosConcluidos] = useState<Record<string, string[]>>({});
  const [treinosFinalizados, setTreinosFinalizados] = useState<string[]>([]);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState<string[]>([]);
  const [registros, setRegistros] = useState<RegistroSemanal[]>([]);

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

  const finalizarTreino = useCallback((treinoId: string) => {
    setTreinosFinalizados((prev) => (prev.includes(treinoId) ? prev : [...prev, treinoId]));
    // desbloqueia automaticamente a conquista de primeiro treino
    setConquistasDesbloqueadas((prev) =>
      prev.includes('primeiro-treino') ? prev : [...prev, 'primeiro-treino']
    );
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

  const value: AppContextData = {
    faseAtual,
    setFaseAtual,
    exerciciosConcluidos,
    toggleExercicio,
    isExercicioConcluido,
    finalizarTreino,
    treinosFinalizados,
    conquistasDesbloqueadas,
    toggleConquista,
    registros,
    salvarRegistroSemanal,
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
