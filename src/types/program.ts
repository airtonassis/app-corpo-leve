import { AvatarVariant, ObjetivoPrincipal, NivelCalculado } from './assessment';
export type { AvatarVariant } from './assessment';

export type ExerciseCategory = 'aquecimento' | 'empurrar' | 'pernas' | 'puxar' | 'core' | 'mobilidade' | 'condicionamento';
export type ExerciseEquipment = 'nenhum' | 'parede' | 'cadeira' | 'banco' | 'barra' | 'elastico' | 'colchonete' | 'degrau';
export type ProgramDayKind = 'treino' | 'recuperacao' | 'checkin';
export type ExerciseExecutionMode = 'repeticoes' | 'tempo';
export type EffortFeedback = 'leve' | 'adequado' | 'dificil' | 'interrompido';
export type AvatarMotionKey = 'warmup' | 'pushup' | 'squat' | 'lunge' | 'pull' | 'plank' | 'core-floor' | 'mobility' | 'cardio' | 'default';
export type AvatarMovementPhaseKey = 'preparar' | 'executar' | 'retornar';

export interface AvatarMovementPhase {
  key: AvatarMovementPhaseKey;
  title: string;
  cue: string;
  durationMs: number;
}

export type AvatarCoachRegion = 'cabeca' | 'ombros' | 'tronco' | 'quadril' | 'joelhos' | 'pes' | 'maos' | 'respiracao' | 'geral';

export interface AvatarTechniquePoint {
  id: string;
  label: string;
  region: AvatarCoachRegion;
  phases?: AvatarMovementPhaseKey[];
  priority?: 1 | 2 | 3;
  cue?: string;
}

export interface AvatarMovementDefinition {
  key: string;
  motionKey: AvatarMotionKey;
  phases: AvatarMovementPhase[];
  techniquePoints: AvatarTechniquePoint[];
  commonMistakes: string[];
  tempoLabel?: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  levels: NivelCalculado[];
  objectives: ObjetivoPrincipal[];
  equipment: ExerciseEquipment[];
  instructions: string[];
  safetyCues: string[];
  imageKey: string;
  avatarMotionKey?: AvatarMotionKey;
  progressionGroup?: string;
  progressionOrder?: number;
  avoidWhen?: string[];
}

export interface ExercisePrescription {
  exerciseId: string;
  sets: number;
  reps?: number;
  seconds?: number;
  executionMode: ExerciseExecutionMode;
  restBetweenSetsSeconds: number;
  restAfterExerciseSeconds: number;
  note?: string;
}

export interface ProgramDay {
  day: number;
  kind: ProgramDayKind;
  title: string;
  focus: string;
  estimatedMinutes: number;
  exercises: ExercisePrescription[];
  disciplineMessage: string;
}

export interface ProgramEligibility {
  objetivos?: ObjetivoPrincipal[];
  niveis?: NivelCalculado[];
  requiresProgramId?: string;
}

export interface ProgramDefinition {
  id: string;
  name: string;
  description: string;
  cycle: number;
  durationDays: number;
  objective: ObjetivoPrincipal;
  level: NivelCalculado;
  premium: boolean;
  days: ProgramDay[];
  generatedAt: string;
  eligibility?: ProgramEligibility;
}

export interface SetExecutionRecord {
  setNumber: number;
  startedAt: string;
  completedAt?: string;
  activeSeconds: number;
  plannedReps?: number;
  completedReps?: number;
  plannedSeconds?: number;
  restSeconds: number;
}

export interface ExerciseExecutionRecord {
  exerciseId: string;
  startedAt: string;
  completedAt?: string;
  activeSeconds: number;
  restSeconds: number;
  sets: SetExecutionRecord[];
  effort?: EffortFeedback;
}

export type SessionAvailabilityOption = '8_min' | '12_min' | '20_min' | 'completo';

export interface SessionCompositionMeta {
  availability: SessionAvailabilityOption;
  plannedMinutes: number;
  targetMinutes: number;
  adapted: boolean;
  selectedExerciseIds: string[];
  omittedExerciseIds: string[];
  prioritizedFamilies: string[];
  reasons: string[];
}


export type DailyAvailabilityStatus = 'disponivel' | 'indisponivel';

export interface DailyAvailabilityRecord {
  id: string;
  programId: string;
  day: number;
  status: DailyAvailabilityStatus;
  option?: SessionAvailabilityOption;
  plannedMinutes: number;
  availableMinutes?: number;
  recordedAt: string;
}

export interface JourneyContinuitySummary {
  shortSessions: number;
  fullSessions: number;
  unavailableDays: number;
  returnCount: number;
  averageAvailableMinutes?: number;
  preferredWindowMinutes?: number;
  lastAvailabilityStatus?: DailyAvailabilityStatus;
}



export type FreeSessionIntent =
  | 'tecnica'
  | 'mobilidade'
  | 'explorar'
  | 'montar_pratica';


export type FreeModeGuidanceLevel = 'alto' | 'moderado' | 'leve';

export interface FreeModePolicy {
  cycle: number;
  stageLabel: string;
  guidanceLevel: FreeModeGuidanceLevel;
  maxExercises: number;
  maxMinutes: number;
  allowWorkedFamilyWithGuidance: boolean;
  allowBuildPracticeIntent: boolean;
  explanation: string;
}

export type FreeExerciseAvailability =
  | 'recomendado'
  | 'disponivel'
  | 'nao_recomendado'
  | 'bloqueado';

export interface FreeExerciseOption {
  exerciseId: string;
  availability: FreeExerciseAvailability;
  reasons: string[];
  family: string;
}

export interface FreeSessionGuardResult {
  allowed: boolean;
  plannedActivityCompletedToday: boolean;
  maxExercises: number;
  maxMinutes: number;
  policy: FreeModePolicy;
  options: FreeExerciseOption[];
  messages: string[];
}

export interface FreeSessionExecution {
  id: string;
  programId: string;
  source: 'modo_livre_assistido';
  intent: FreeSessionIntent;
  startedAt: string;
  completedAt: string;
  selectedExerciseIds: string[];
  durationSeconds: number;
  guardSnapshot: {
    cycle: number;
    guidanceLevel: FreeModeGuidanceLevel;
    maxExercises: number;
    maxMinutes: number;
    plannedActivityCompletedToday: boolean;
  };
}

export type ComplementaryActivityType =
  | 'caminhada'
  | 'corrida'
  | 'bicicleta'
  | 'natacao'
  | 'outro';

export type ComplementaryActivitySource =
  | 'manual'
  | 'strava'
  | 'health_connect'
  | 'apple_health'
  | 'other';

export interface ComplementaryActivity {
  id: string;
  programId?: string;
  activityType: ComplementaryActivityType;
  source: ComplementaryActivitySource;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  distanceMeters?: number;
  averageHeartRate?: number;
  providerActivityId?: string;
  importedAt?: string;
  note?: string;
}

export type AutonomyStage =
  | 'descobrindo'
  | 'construindo_consistencia'
  | 'ganhando_autonomia'
  | 'movimento_integrado';

export interface BehaviorAutonomySnapshot {
  stage: AutonomyStage;
  observedSignals: string[];
  completedProgramSessions: number;
  complementaryActivities: number;
  complementaryMinutes: number;
  returnCount: number;
  shortSessionCount: number;
  freeAssistedSessions: number;
  message: string;
}

export interface ProgramDayExecution {
  programId: string;
  day: number;
  startedAt: string;
  completedAt?: string;
  totalSeconds: number;
  activeSeconds: number;
  restSeconds: number;
  exercises: ExerciseExecutionRecord[];
  sessionComposition?: SessionCompositionMeta;
}

export interface UserJourney {
  currentProgramId?: string;
  currentDay?: number;
  completedProgramIds: string[];
  completedDays: number[];
  totalDays: number;
  totalWorkouts: number;
  totalWorkoutSeconds: number;
  startedAt: string;
  updatedAt: string;
}


export type AdaptationReason =
  | 'feedback_interrompido'
  | 'dificuldade_repetida'
  | 'feedback_dificil'
  | 'tres_feedbacks_estaveis'
  | 'manutencao';

export interface AdaptationDecision {
  id: string;
  programId: string;
  targetDay: number;
  exerciseFamily: string;
  previousExerciseId: string;
  newExerciseId: string;
  reason: AdaptationReason;
  recentEfforts: EffortFeedback[];
  volumeBefore: { sets: number; reps?: number; seconds?: number };
  volumeAfter: { sets: number; reps?: number; seconds?: number };
  createdAt: string;
}

export interface ExerciseFamilyJourney {
  progressionGroup: string;
  firstExerciseId?: string;
  currentExerciseId?: string;
  highestExerciseId?: string;
  sessions: number;
  completedSets: number;
  activeSeconds: number;
  effortCounts: Record<EffortFeedback, number>;
  progressionCount: number;
  regressionCount: number;
  exerciseHistory: string[];
  lastPerformedAt?: string;
}

export interface CycleJourneySummary {
  programId: string;
  cycle: number;
  durationDays: number;
  completedDays: number;
  completionRate: number;
  activeSeconds: number;
  restSeconds: number;
  exerciseFamilies: ExerciseFamilyJourney[];
  adaptationCount: number;
  progressionCount: number;
  regressionCount: number;
  updatedAt: string;
  continuity: JourneyContinuitySummary;
  behavior: BehaviorAutonomySnapshot;
}


export type ExerciseJourneyTransition = 'inicio' | 'manteve' | 'avancou' | 'regrediu';

export interface ExerciseJourneyTimelineItem {
  day: number;
  date: string;
  exerciseId: string;
  previousExerciseId?: string;
  transition: ExerciseJourneyTransition;
  effort?: EffortFeedback;
  setsCompleted: number;
  activeSeconds: number;
  repsCompleted?: number;
  plannedSeconds?: number;
  adaptation?: AdaptationDecision;
}
