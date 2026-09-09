import { AssessmentProfile } from '../../types/assessment';
import { ContinuousJourneyState, LongitudinalJourneyMemory, ProgramDefinition } from '../../types/program';
import { generateCycle1Program } from './cycle1Engine';
import { generateCycle2Program } from './cycle2Engine';
import { generateCycle3Program } from './cycle3Engine';
import { generateCycle4Program } from './cycle4Engine';
import { generateContinuousJourneyBlock } from './continuousJourneyEngine';

export function generateProgramForCycle(
  profile: AssessmentProfile,
  cycle: number,
  journeyMemory?: LongitudinalJourneyMemory,
  continuousState?: ContinuousJourneyState,
): ProgramDefinition | null {
  if (cycle === 1) return generateCycle1Program(profile);
  if (cycle === 2) {
    if (!journeyMemory) return null;
    return generateCycle2Program(profile, journeyMemory);
  }
  if (cycle === 3) {
    if (!journeyMemory) return null;
    return generateCycle3Program(profile, journeyMemory);
  }
  if (cycle === 4) {
    if (!journeyMemory) return null;
    return generateCycle4Program(profile, journeyMemory);
  }
  if (cycle >= 5) {
    if (!journeyMemory || !continuousState) return null;
    return generateContinuousJourneyBlock(profile, journeyMemory, continuousState);
  }

  return null;
}
