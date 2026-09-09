import AsyncStorage from '@react-native-async-storage/async-storage';
import { FreeSessionExecution } from '../../types/program';

const KEY = '@corpo-leve/free-assisted-sessions-v1';

export async function loadFreeSessions(): Promise<FreeSessionExecution[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FreeSessionExecution[];
    if (!Array.isArray(parsed)) return [];
    // Registros da versão anterior não possuíam ciclo/grau de orientação
    // no snapshot. Mantemos leitura compatível sem reescrever o histórico.
    return parsed.map((item) => ({
      ...item,
      guardSnapshot: {
        cycle: item.guardSnapshot?.cycle ?? 1,
        guidanceLevel: item.guardSnapshot?.guidanceLevel ?? 'alto',
        maxExercises: item.guardSnapshot?.maxExercises ?? 2,
        maxMinutes: item.guardSnapshot?.maxMinutes ?? 10,
        plannedActivityCompletedToday:
          item.guardSnapshot?.plannedActivityCompletedToday ?? true,
      },
    }));
  } catch {
    return [];
  }
}

export async function saveFreeSession(execution: FreeSessionExecution): Promise<void> {
  const current = await loadFreeSessions();
  const next = current.filter((item) => item.id !== execution.id);
  await AsyncStorage.setItem(KEY, JSON.stringify([...next, execution]));
}
