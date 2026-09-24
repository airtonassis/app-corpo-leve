import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import {
  QuizAnswerMap,
  QuizAnswerValue,
  QuizCondition,
  QuizConditionGroup,
  QuizQuestion,
} from '../../types/quiz';

function asComparable(value: QuizAnswerValue): string | number | boolean | null {
  if (value === null || Array.isArray(value)) return null;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

function evaluateCondition(condition: QuizCondition, answers: QuizAnswerMap): boolean {
  const current = answers[condition.questionId];
  const expected = condition.value;

  // An unanswered dependency must never activate a conditional branch.
  if (current === undefined || current === null || current === '') return false;

  switch (condition.operator) {
    case 'exists':
      return current !== undefined && current !== null && current !== '';
    case 'equals':
      return current === expected || asComparable(current) === asComparable(expected as QuizAnswerValue);
    case 'not_equals':
      return !(current === expected || asComparable(current) === asComparable(expected as QuizAnswerValue));
    case 'in':
      return Array.isArray(expected) && expected.some((item) => asComparable(item) === asComparable(current));
    case 'not_in':
      return Array.isArray(expected) && !expected.some((item) => asComparable(item) === asComparable(current));
    case 'gte': {
      const a = Number(asComparable(current));
      const b = Number(asComparable(expected as QuizAnswerValue));
      return Number.isFinite(a) && Number.isFinite(b) && a >= b;
    }
    case 'lte': {
      const a = Number(asComparable(current));
      const b = Number(asComparable(expected as QuizAnswerValue));
      return Number.isFinite(a) && Number.isFinite(b) && a <= b;
    }
    case 'contains':
      return Array.isArray(current) && current.includes(String(expected));
    default:
      return false;
  }
}

function evaluateGroup(group: QuizConditionGroup | undefined, answers: QuizAnswerMap): boolean {
  if (!group) return true;
  const all = group.all?.every((condition) => evaluateCondition(condition, answers)) ?? true;
  const any = group.any?.some((condition) => evaluateCondition(condition, answers)) ?? true;
  return all && any;
}

export function getUserAge(answers: QuizAnswerMap): number | undefined {
  const raw = answers.PERF_001;
  const age = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(age) ? age : undefined;
}

export function isQuestionEligible(question: QuizQuestion, answers: QuizAnswerMap): boolean {
  const age = getUserAge(answers);

  if (age !== undefined && age < 18 && ['PERF_002', 'PERF_003', 'PERF_004'].includes(question.id)) return false;

  if (question.adultOnly && (age === undefined || age < 18)) return false;
  if (question.minAge !== undefined && (age === undefined || age < question.minAge)) return false;
  if (question.maxAge !== undefined && (age === undefined || age > question.maxAge)) return false;

  return evaluateGroup(question.includeWhen, answers);
}

export function getEligibleQuestions(answers: QuizAnswerMap): QuizQuestion[] {
  return QUIZ_QUESTIONS
    .filter((question) => isQuestionEligible(question, answers))
    .sort((a, b) => (a.id === 'PERF_001' ? -1 : b.id === 'PERF_001' ? 1 :
      a.category === 'seguranca' && b.category !== 'seguranca' ? -1 :
      b.category === 'seguranca' && a.category !== 'seguranca' ? 1 :
      a.priority - b.priority || a.id.localeCompare(b.id)));
}

export const QUIZ_MIN = 25;
export const QUIZ_TARGET = 30;
export const QUIZ_MAX = 35;
const ESSENTIAL_OPTIONAL_IDS = ['PERF_010', 'FIT_001', 'FIT_003', 'FIT_004'];

export function pruneIneligibleAnswers(answers: QuizAnswerMap): QuizAnswerMap {
  let valid = { ...answers };
  // Dependencies can become invalid in successive layers.
  for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
    const next = Object.fromEntries(Object.entries(valid).filter(([id]) => {
      const question = QUIZ_QUESTIONS.find((item) => item.id === id);
      return question && (id === 'PERF_001' || isQuestionEligible(question, valid));
    })) as QuizAnswerMap;
    if (Object.keys(next).length === Object.keys(valid).length) return next;
    valid = next;
  }
  return valid;
}

export function shouldCompleteQuiz(answers: QuizAnswerMap, askedIds: string[]): boolean {
  const count = new Set(askedIds).size;
  const essentialPending = getEligibleQuestions(answers).some((question) =>
    ESSENTIAL_OPTIONAL_IDS.includes(question.id) && !askedIds.includes(question.id));
  return count >= QUIZ_MIN && canCompleteQuiz(answers) &&
    (count >= QUIZ_MAX || (!essentialPending && (count >= QUIZ_TARGET || !getNextQuestion(answers, askedIds))));
}

export function getNextQuestion(
  answers: QuizAnswerMap,
  askedQuestionIds: string[] = []
): QuizQuestion | undefined {
  const asked = new Set(askedQuestionIds);
  const pending = getEligibleQuestions(answers).filter(
    (question) => !asked.has(question.id) && answers[question.id] === undefined
  );
  if (asked.size >= QUIZ_MAX) return undefined;
  // Required questions and safety follow-ups take the reserved slots first.
  const required = pending.find((question) => question.required);
  if (required) return required;
  const priorityOption = ESSENTIAL_OPTIONAL_IDS.map((id) => pending.find((q) => q.id === id)).find(Boolean);
  if (priorityOption) return priorityOption;
  if (asked.size >= QUIZ_TARGET) return undefined;
  return pending.find((question) => question.priority <= 3 && !question.sensitive && !question.doNotScore);
}

export function getRequiredPendingQuestions(answers: QuizAnswerMap): QuizQuestion[] {
  return getEligibleQuestions(answers).filter(
    (question) => question.required && answers[question.id] === undefined
  );
}

export function canCompleteQuiz(answers: QuizAnswerMap): boolean {
  return getRequiredPendingQuestions(answers).length === 0;
}
