import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyAvailabilityRecord } from '../../types/program';

const KEY = '@corpo-leve/daily-availability-v1';

export async function loadDailyAvailability(): Promise<DailyAvailabilityRecord[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as DailyAvailabilityRecord[]; } catch { return []; }
}

export async function upsertDailyAvailability(record: DailyAvailabilityRecord): Promise<void> {
  const current = await loadDailyAvailability();
  const next = current.filter((item) => item.id !== record.id);
  await AsyncStorage.setItem(KEY, JSON.stringify([...next, record]));
}
