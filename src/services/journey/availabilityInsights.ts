import { DailyAvailabilityRecord, SessionAvailabilityOption } from '../../types/program';

export interface AvailabilityInsight {
  suggestedOption?: SessionAvailabilityOption;
  suggestedMinutes?: number;
  confidence: 'insuficiente' | 'inicial' | 'consistente';
  sampleSize: number;
  reason: string;
}

const optionMinutes: Partial<Record<SessionAvailabilityOption, number>> = {
  '8_min': 8,
  '12_min': 12,
  '20_min': 20,
};

export function buildAvailabilityInsight(
  programId: string,
  records: DailyAvailabilityRecord[],
): AvailabilityInsight {
  const available = records
    .filter((item) => item.programId === programId && item.status === 'disponivel' && item.option)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  if (available.length < 2) {
    return {
      confidence: 'insuficiente',
      sampleSize: available.length,
      reason: 'Ainda há poucas escolhas registradas para sugerir uma duração.',
    };
  }

  const weighted = new Map<SessionAvailabilityOption, number>();
  available.forEach((item, index) => {
    const option = item.option!;
    // Choices later in the journey weigh a little more, without discarding earlier behavior.
    const recencyWeight = 1 + (index / Math.max(1, available.length - 1)) * 0.35;
    weighted.set(option, (weighted.get(option) ?? 0) + recencyWeight);
  });

  const [suggestedOption, score] = [...weighted.entries()]
    .sort((a, b) => b[1] - a[1])[0];

  const totalWeight = [...weighted.values()].reduce((sum, value) => sum + value, 0);
  const share = totalWeight ? score / totalWeight : 0;
  const confidence = available.length >= 5 && share >= 0.45 ? 'consistente' : 'inicial';
  const minutes = optionMinutes[suggestedOption];

  return {
    suggestedOption,
    suggestedMinutes: minutes,
    confidence,
    sampleSize: available.length,
    reason: minutes
      ? `${minutes} minutos aparece com maior frequência nas suas escolhas recentes.`
      : 'O treino completo aparece com maior frequência nas suas escolhas recentes.',
  };
}
