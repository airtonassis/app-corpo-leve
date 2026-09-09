import AsyncStorage from '@react-native-async-storage/async-storage';
import { LongitudinalJourneyMemory } from '../../types/program';
import { loadProgramExecutions } from '../workout/executionStorage';
import { loadAdaptationDecisions } from './adaptationStorage';
import { loadDailyAvailability } from './availabilityStorage';
import { loadComplementaryActivities } from './complementaryActivityStorage';
import { loadFreeSessions } from './freeSessionStorage';
import { buildLongitudinalJourneyMemory } from './longitudinalJourneyMemoryEngine';

const SNAPSHOT_KEY = '@corpo-leve/journey-memory-snapshot-v1';

export async function refreshLongitudinalJourneyMemory(): Promise<LongitudinalJourneyMemory> {
  const [
    executions,
    decisions,
    availability,
    complementaryActivities,
    freeSessions,
  ] = await Promise.all([
    loadProgramExecutions(),
    loadAdaptationDecisions(),
    loadDailyAvailability(),
    loadComplementaryActivities(),
    loadFreeSessions(),
  ]);

  const memory = buildLongitudinalJourneyMemory(
    executions,
    decisions,
    availability,
    complementaryActivities,
    freeSessions,
  );

  // Snapshot derivado. Os registros brutos continuam sendo a fonte de verdade.
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(memory));
  return memory;
}

export async function loadCachedJourneyMemorySnapshot(): Promise<LongitudinalJourneyMemory | null> {
  const raw = await AsyncStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LongitudinalJourneyMemory;
  } catch {
    return null;
  }
}
