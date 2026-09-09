import AsyncStorage from '@react-native-async-storage/async-storage';
import { ComplementaryActivity } from '../../types/program';

const KEY = '@corpo-leve/complementary-activities-v1';

export async function loadComplementaryActivities(): Promise<ComplementaryActivity[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ComplementaryActivity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function upsertComplementaryActivity(activity: ComplementaryActivity): Promise<void> {
  const current = await loadComplementaryActivities();
  const next = current.filter((item) => item.id !== activity.id);
  await AsyncStorage.setItem(KEY, JSON.stringify([...next, activity]));
}
