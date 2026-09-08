export type QuizCategory =
  | 'perfil'
  | 'objetivo'
  | 'seguranca'
  | 'capacidade_fisica'
  | 'mobilidade'
  | 'habitos'
  | 'recuperacao'
  | 'energia'
  | 'motivacao'
  | 'barreiras'
  | 'preferencias';

export type QuizQuestionType =
  | 'single'
  | 'multi'
  | 'number'
  | 'scale'
  | 'boolean'
  | 'text';

export type QuizAnswerValue = string | number | boolean | string[] | null;

export interface QuizOption {
  value: string;
  label: string;
  score?: number;
}

export type QuizConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'gte'
  | 'lte'
  | 'exists'
  | 'contains';

export interface QuizCondition {
  questionId: string;
  operator: QuizConditionOperator;
  value?: QuizAnswerValue | QuizAnswerValue[];
}

export interface QuizConditionGroup {
  all?: QuizCondition[];
  any?: QuizCondition[];
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  title: string;
  prompt: string;
  type: QuizQuestionType;
  required: boolean;
  options?: QuizOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helperText?: string;
  placeholder?: string;
  includeWhen?: QuizConditionGroup;
  minAge?: number;
  maxAge?: number;
  adultOnly?: boolean;
  sensitive?: boolean;
  doNotScore?: boolean;
  priority: number;
  tags: string[];
  influences: string[];
}

export interface QuizAnswer {
  questionId: string;
  value: QuizAnswerValue;
  answeredAt: string;
}

export type QuizAnswerMap = Record<string, QuizAnswerValue>;

export interface QuizSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  answers: QuizAnswerMap;
  askedQuestionIds: string[];
}
