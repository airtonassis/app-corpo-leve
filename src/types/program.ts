import { ObjetivoPrincipal, NivelCalculado } from './assessment';

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
  eligibility?: ProgramEligibility;
}

export interface UserJourney {
  currentProgramId?: string;
  completedProgramIds: string[];
  totalDays: number;
  totalWorkouts: number;
  totalWorkoutSeconds: number;
  startedAt: string;
  updatedAt: string;
}
