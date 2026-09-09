import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContinuousJourneyFocus, ContinuousJourneyState } from '../../types/program';

const KEY = '@corpo-leve/continuous-journey-v1';

export async function loadContinuousJourneyState(): Promise<ContinuousJourneyState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ContinuousJourneyState;
      if (parsed?.version === 1) return parsed;
    } catch {}
  }

  const now = new Date().toISOString();
  return {
    version: 1,
    activeBlockIndex: 1,
    completedBlocks: 0,
    focus: 'manter',
    startedAt: now,
    updatedAt: now,
  };
}

export async function saveContinuousJourneyState(
  state: ContinuousJourneyState,
): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function updateContinuousJourneyFocus(
  focus: ContinuousJourneyFocus,
): Promise<ContinuousJourneyState> {
  const current = await loadContinuousJourneyState();
  if (current.focus === focus) return current;

  // Alterar o foco abre um novo bloco. Isso impede que uma mudança de objetivo
  // altere o ID de um bloco que já possui execuções registradas.
  const next = {
    ...current,
    activeBlockIndex: current.activeBlockIndex + 1,
    focus,
    updatedAt: new Date().toISOString(),
  };
  await saveContinuousJourneyState(next);
  return next;
}

export async function completeContinuousJourneyBlock(
  blockIndex: number,
): Promise<ContinuousJourneyState> {
  const current = await loadContinuousJourneyState();

  // Idempotente: só avança se o bloco concluído ainda for o bloco ativo.
  if (current.activeBlockIndex !== blockIndex) return current;

  const next = {
    ...current,
    activeBlockIndex: current.activeBlockIndex + 1,
    completedBlocks: current.completedBlocks + 1,
    updatedAt: new Date().toISOString(),
  };
  await saveContinuousJourneyState(next);
  return next;
}
