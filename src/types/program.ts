import { AvatarVariant, ObjetivoPrincipal, NivelCalculado } from './assessment';
export type { AvatarVariant } from './assessment';


export type JourneyCycleKey =
  | 'fundamentos'
  | 'consistencia'
  | 'evolucao'
  | 'autonomia'
  | 'continua';

export type JourneyCycleAvailability =
  | 'disponivel'
  | 'proximo'
  | 'planejado'
  | 'continuo';

export interface JourneyCycleDefinition {
  cycle: number;
  key: JourneyCycleKey;
  name: string;
  durationDays?: number;
  purpose: string;
  userMessage: string;
  availability: JourneyCycleAvailability;
  generatorReady: boolean;
}

export interface JourneyCycleProgress {
  definition: JourneyCycleDefinition;
  completedDays: number;
  completionRate: number;
  completed: boolean;
  unlocked: boolean;
  current: boolean;
}

export interface JourneyProgramState {
  currentCycle: number;
  currentCycleKey: JourneyCycleKey;
  cycles: JourneyCycleProgress[];
  totalCompletedProgramDays: number;
  nextCycle?: JourneyCycleDefinition;
  message: string;
}


export interface JourneyMemoryFamily {
  progressionGroup: string;
  firstExerciseId?: string;
  currentExerciseId?: string;
  highestExerciseId?: string;
  exerciseHistory: string[];
  cyclesSeen: number[];
  sessions: number;
  completedSets: number;
  activeSeconds: number;
  effortCounts: Record<EffortFeedback, number>;
  recentEfforts: EffortFeedback[];
  progressionCount: number;
  regressionCount: number;
  lastPerformedAt?: string;
}

export interface JourneyAvailabilityMemory {
  recordedChoices: number;
  shortSessions: number;
  fullSessions: number;
  unavailableRecords: number;
  averageAvailableMinutes?: number;
  preferredWindowMinutes?: number;
  recentAvailableMinutes: number[];
}

export interface JourneyMovementMemory {
  complementaryActivities: number;
  complementaryMinutes: number;
  activityTypes: Partial<Record<ComplementaryActivityType, number>>;
  freeAssistedSessions: number;
  freeAssistedMinutes: number;
  freeIntents: Partial<Record<FreeSessionIntent, number>>;
}

export interface JourneyCycleMemory {
  cycle: number;
  programIds: string[];
  completedDays: number;
  completedSessions: number;
  activeSeconds: number;
  startedAt?: string;
  lastActivityAt?: string;
}

export interface LongitudinalJourneyMemory {
  version: 1;
  generatedAt: string;
  totalCompletedSessions: number;
  totalActiveSeconds: number;
  totalRestSeconds: number;
  totalAdaptationDecisions: number;
  families: JourneyMemoryFamily[];
  availability: JourneyAvailabilityMemory;
  movement: JourneyMovementMemory;
  cycles: JourneyCycleMemory[];
  behaviorSignals: string[];
}

export interface CycleTransitionContext {
  fromCycle: number;
  toCycle: number;
  generatedAt: string;
  inheritedSignals: string[];
  familyPriorities: {
    progressionGroup: string;
    recommendation: 'preservar_referencia' | 'observar' | 'priorizar_exposicao';
    reason: string;
  }[];
  preferredSessionMinutes?: number;
  guidance: string[];
}


export type ContinuousJourneyFocus =
  | 'manter'
  | 'forca'
  | 'condicionamento'
  | 'mobilidade'
  | 'consistencia'
  | 'bem_estar';

export interface ContinuousJourneyState {
  version: 1;
  activeBlockIndex: number;
  completedBlocks: number;
  focus: ContinuousJourneyFocus;
  startedAt: string;
  updatedAt: string;
}

export interface ContinuousJourneyBlockMeta {
  blockIndex: number;
  sessionCount: number;
  focus: ContinuousJourneyFocus;
  renewable: true;
  message: string;
}

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

export type ExerciseStartPosition =
  | 'em_pe'
  | 'sentado'
  | 'deitado_costas'
  | 'deitado_lado'
  | 'quatro_apoios'
  | 'prancha'
  | 'suspenso'
  | 'base_dividida';

export type ExerciseVisualMatchStatus = 'mapped' | 'reference_only' | 'hidden';
export type ExerciseTechnicalValidationStatus = 'pending' | 'approved' | 'revision_required';

export interface ExerciseInstructionGuide {
  startPosition: ExerciseStartPosition;
  startPositionLabel: string;
  supportLabel: string;
  preparation: string[];
  execution: string[];
  returnInstructions: string[];
  breathing: string[];
  attentionPoints: string[];
  environmentCheck?: string[];
}

export interface ExerciseVisualGuide {
  status: ExerciseVisualMatchStatus;
  note: string;
}

export interface ExerciseProfessionalReview {
  status: ExerciseTechnicalValidationStatus;
  version: string;
  reviewedAt?: string;
  reviewer?: string;
  professionalRegistration?: string;
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
  instructionGuide?: ExerciseInstructionGuide;
  visualGuide?: ExerciseVisualGuide;
  professionalReview?: ExerciseProfessionalReview;
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


export interface PlannedAutonomyOption {
  slotId: string;
  family: string;
  defaultExerciseId: string;
  alternativeExerciseIds: string[];
  reason: string;
}

export interface PlannedAutonomyMeta {
  enabled: boolean;
  guidance: 'moderada' | 'leve';
  maxUserChoices: number;
  options: PlannedAutonomyOption[];
  message: string;
}

export interface ProgramDay {
  day: number;
  kind: ProgramDayKind;
  title: string;
  focus: string;
  estimatedMinutes: number;
  exercises: ExercisePrescription[];
  disciplineMessage: string;
  autonomy?: PlannedAutonomyMeta;
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
  continuous?: ContinuousJourneyBlockMeta;
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
