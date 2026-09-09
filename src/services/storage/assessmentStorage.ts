import AsyncStorage from '@react-native-async-storage/async-storage';
import { AssessmentProfile } from '../../types/assessment';
import { QuizAnswerMap, QuizSession } from '../../types/quiz';
import { ProgramRecommendation } from '../assessment/recommendationEngine';

const SESSION_KEY = '@forca-leve/assessment-session-v2';
const RESULT_KEY = '@forca-leve/assessment-result-v2';

export interface StoredAssessmentResult {
  answers: QuizAnswerMap;
  profile: AssessmentProfile;
  recommendation: ProgramRecommendation;
  completedAt: string;
}

export async function loadAssessmentSession(): Promise<QuizSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizSession;
  } catch {
    return null;
  }
}

export async function saveAssessmentSession(session: QuizSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearAssessmentSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function saveAssessmentResult(result: StoredAssessmentResult): Promise<void> {
  await AsyncStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export async function loadAssessmentResult(): Promise<StoredAssessmentResult | null> {
  const raw = await AsyncStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAssessmentResult;
  } catch {
    return null;
  }
}
