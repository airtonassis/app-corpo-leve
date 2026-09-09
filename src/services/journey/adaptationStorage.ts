import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdaptationDecision } from '../../types/program';

const KEY = '@corpo-leve/adaptation-decisions-v1';
const LEGACY_KEY = '@forca-leve/adaptation-decisions-v1';

export async function loadAdaptationDecisions(): Promise<AdaptationDecision[]> {
  const currentRaw = await AsyncStorage.getItem(KEY);
  const legacyRaw = currentRaw ? null : await AsyncStorage.getItem(LEGACY_KEY);
  const raw = currentRaw ?? legacyRaw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AdaptationDecision[];
    if (!currentRaw && legacyRaw) await AsyncStorage.setItem(KEY, JSON.stringify(parsed));
    return parsed;
  } catch { return []; }
}

export async function saveAdaptationDecisions(items: AdaptationDecision[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}


export async function upsertAdaptationDecisions(items: AdaptationDecision[]): Promise<void> {
  if (!items.length) return;
  const current = await loadAdaptationDecisions();
  const ids = new Set(items.map((item) => item.id));
  const merged = [...current.filter((item) => !ids.has(item.id)), ...items];
  await saveAdaptationDecisions(merged);
}
