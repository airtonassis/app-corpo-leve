export type ObjetivoPrincipal =
  | 'forca'
  | 'condicionamento'
  | 'mobilidade'
  | 'consistencia'
  | 'bem_estar';

export type NivelCalculado = 'iniciante' | 'base' | 'intermediario' | 'avancado';

export type AvatarVariant = 'feminino' | 'masculino' | 'neutro';

export interface AssessmentProfile {
  objetivoPrincipal?: ObjetivoPrincipal;
  avatarVariant: AvatarVariant;
  nivelCalculado: NivelCalculado;
  disponibilidadeMinutos?: number;
  frequenciaSemanal?: number;
  scoreForca?: number;
  scoreCondicionamento?: number;
  scoreMobilidade?: number;
  scoreRecuperacao?: number;
  scoreConsistencia?: number;
  scoreEnergia?: number;
  barreiras: string[];
  preferencias: string[];
  recursosDisponiveis: string[];
  regioesAtencao: string[];
  pontosAtencao: string[];
  generatedAt: string;
}
