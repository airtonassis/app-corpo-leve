export type ObjetivoPrincipal =
  | 'forca'
  | 'condicionamento'
  | 'mobilidade'
  | 'consistencia'
  | 'bem_estar';

export type NivelCalculado = 'iniciante' | 'base' | 'intermediario' | 'avancado';

export interface AssessmentProfile {
  objetivoPrincipal?: ObjetivoPrincipal;
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
  pontosAtencao: string[];
  generatedAt: string;
}
