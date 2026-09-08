import { AssessmentProfile } from '../../types/assessment';

export interface ProgramRecommendation {
  programKey: string;
  title: string;
  reasons: string[];
  caution: boolean;
}

export function recommendInitialProgram(profile: AssessmentProfile): ProgramRecommendation {
  const caution = profile.pontosAtencao.length > 0;
  const objective = profile.objetivoPrincipal ?? 'consistencia';

  const titleByObjective: Record<string, string> = {
    forca: '21 Dias — Fundação de Força',
    condicionamento: '21 Dias — Base de Condicionamento',
    mobilidade: '21 Dias — Movimento e Mobilidade',
    consistencia: '21 Dias — Consistência',
    bem_estar: '21 Dias — Movimento e Disposição',
  };

  return {
    programKey: `cycle-1-${objective}-${profile.nivelCalculado}`,
    title: titleByObjective[objective],
    caution,
    reasons: [
      `Objetivo principal: ${objective}`,
      `Nível calculado: ${profile.nivelCalculado}`,
      profile.disponibilidadeMinutos
        ? `Tempo disponível: cerca de ${profile.disponibilidadeMinutos} min por sessão`
        : 'Tempo de sessão será ajustado durante o primeiro ciclo',
    ],
  };
}
