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

  if (question.adultOnly && (age === undefined || age < 18)) return false;
  if (question.minAge !== undefined && (age === undefined || age < question.minAge)) return false;
  if (question.maxAge !== undefined && (age === undefined || age > question.maxAge)) return false;

  return evaluateGroup(question.includeWhen, answers);
}

export function getEligibleQuestions(answers: QuizAnswerMap): QuizQuestion[] {
  return QUIZ_QUESTIONS
    .filter((question) => isQuestionEligible(question, answers))
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}

export function getNextQuestion(
  answers: QuizAnswerMap,
  askedQuestionIds: string[] = []
): QuizQuestion | undefined {
  const asked = new Set(askedQuestionIds);
  return getEligibleQuestions(answers).find(
    (question) => !asked.has(question.id) && answers[question.id] === undefined
  );
}

export function getRequiredPendingQuestions(answers: QuizAnswerMap): QuizQuestion[] {
  return getEligibleQuestions(answers).filter(
    (question) => question.required && answers[question.id] === undefined
  );
}

export function canCompleteQuiz(answers: QuizAnswerMap): boolean {
  return getRequiredPendingQuestions(answers).length === 0;
}
