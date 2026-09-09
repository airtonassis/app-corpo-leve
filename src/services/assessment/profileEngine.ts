import { AssessmentProfile, NivelCalculado, ObjetivoPrincipal } from '../../types/assessment';
import { QuizAnswerMap } from '../../types/quiz';

const n = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function levelFromPerformance(answers: QuizAnswerMap): NivelCalculado {
  const pushups = n(answers.FIT_001);
  const plank = n(answers.FIT_003);
  const experience = String(answers.PERF_008 ?? 'nenhuma');

  if (experience === 'avancada' && (pushups >= 25 || plank >= 90)) return 'avancado';
  if ((experience === 'regular' || experience === 'avancada') && (pushups >= 12 || plank >= 60)) return 'intermediario';
  if (pushups >= 5 || plank >= 30 || experience === 'ocasional') return 'base';
  return 'iniciante';
}

function avatarVariantFromAnswers(answers: QuizAnswerMap): AssessmentProfile['avatarVariant'] {
  const informed = String(answers.PERF_004 ?? 'nao_informar');
  if (informed === 'feminino') return 'feminino';
  if (informed === 'masculino') return 'masculino';
  return 'neutro';
}

export function buildAssessmentProfile(answers: QuizAnswerMap): AssessmentProfile {
  const objective = answers.OBJ_001 as ObjetivoPrincipal | undefined;
  const pushups = n(answers.FIT_001);
  const plank = n(answers.FIT_003);
  const squat = n(answers.FIT_004);
  const resistance = n(answers.FIT_009, 3);
  const stairs = n(answers.FIT_006, 3);
  const sleepQuality = n(answers.REC_002, 3);
  const wakeEnergy = n(answers.REC_003, 3);
  const dailyEnergy = n(answers.REC_007, 3);
  const consistency = n(answers.MOT_003, 3);
  const motivation = n(answers.MOT_001, 3);

  const barriers = answers.MOT_006 ? [String(answers.MOT_006)] : [];
  const preferences = Array.isArray(answers.OBJ_010) ? answers.OBJ_010.map(String) : [];
  const resources = Array.isArray(answers.PERF_010) ? answers.PERF_010.map(String) : [];
  const attentionRegions = Array.isArray(answers.SAFE_002) ? answers.SAFE_002.map(String) : [];
  const attention: string[] = [];

  if (answers.SAFE_001 === 'sim') attention.push('dor_ou_desconforto_atual');
  if (answers.SAFE_003 === 'sim') attention.push('lesao_recente');
  if (answers.SAFE_004 === 'sim') attention.push('restricao_profissional');
  if (answers.SAFE_006 === 'sim') attention.push('mal_estar_no_esforco');

  return {
    objetivoPrincipal: objective,
    avatarVariant: avatarVariantFromAnswers(answers),
    nivelCalculado: levelFromPerformance(answers),
    disponibilidadeMinutos: n(answers.OBJ_006) || undefined,
    frequenciaSemanal: n(answers.OBJ_007) || undefined,
    scoreForca: clamp((Math.min(pushups, 30) / 30) * 45 + (Math.min(plank, 120) / 120) * 35 + (resistance / 5) * 20),
    scoreCondicionamento: clamp((Math.min(squat, 50) / 50) * 55 + (stairs / 5) * 45),
    scoreRecuperacao: clamp((sleepQuality / 5) * 55 + (wakeEnergy / 5) * 45),
    scoreConsistencia: clamp((consistency / 5) * 60 + (motivation / 5) * 40),
    scoreEnergia: clamp(((wakeEnergy + dailyEnergy) / 10) * 100),
    barreiras: barriers,
    preferencias: preferences,
    recursosDisponiveis: resources,
    regioesAtencao: attentionRegions,
    pontosAtencao: attention,
    generatedAt: new Date().toISOString(),
  };
}
