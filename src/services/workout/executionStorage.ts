import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgramDayExecution } from '../../types/program';

const EXECUTIONS_KEY = '@corpo-leve/program-executions-v2';
const LEGACY_EXECUTIONS_KEY = '@forca-leve/program-executions-v2';

export async function loadProgramExecutions(): Promise<ProgramDayExecution[]> {
  const currentRaw = await AsyncStorage.getItem(EXECUTIONS_KEY);
  const legacyRaw = currentRaw ? null : await AsyncStorage.getItem(LEGACY_EXECUTIONS_KEY);
  const raw = currentRaw ?? legacyRaw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ProgramDayExecution[];
    if (!currentRaw && legacyRaw) {
      await AsyncStorage.setItem(EXECUTIONS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function saveProgramDayExecution(execution: ProgramDayExecution): Promise<void> {
  const current = await loadProgramExecutions();
  const withoutSameDay = current.filter(
    (item) => !(item.programId === execution.programId && item.day === execution.day),
  );
  await AsyncStorage.setItem(EXECUTIONS_KEY, JSON.stringify([...withoutSameDay, execution]));
}

export async function loadProgramDayExecution(programId: string, day: number): Promise<ProgramDayExecution | null> {
  const all = await loadProgramExecutions();
  return all.find((item) => item.programId === programId && item.day === day) ?? null;
}
