/**
 * Corpo Leve — catálogo de imagens locais para os 49 exercícios oficiais.
 * Imagens são rascunhos: revisão profissional pendente.
 * Gerado a partir do inventário fornecido pelo usuário; confira warm-hip e plank-high.
 */
import type { ImageSourcePropType } from 'react-native';

export type ExerciseImagePhase = 'preparar' | 'executar' | 'retornar' | 'sustentar';
export interface ExerciseImageFrame {
  phase: ExerciseImagePhase;
  source: ImageSourcePropType;
}
export type ExerciseImageCatalog = Record<string, readonly ExerciseImageFrame[]>;

export const exerciseImageCatalog: ExerciseImageCatalog = {
  'warm-march': [
    { phase: 'preparar', source: require('../../../assets/exercises/warm-march/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/warm-march/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/warm-march/retornar.png') },
  ],
  'warm-shoulder': [
    { phase: 'preparar', source: require('../../../assets/exercises/warm-shoulder/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/warm-shoulder/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/warm-shoulder/retornar.png') },
  ],
  'warm-hip': [
    { phase: 'preparar', source: require('../../../assets/exercises/warm-hip/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/warm-hip/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/warm-hip/retornar.png') },
  ],
  'push-wall': [
    { phase: 'preparar', source: require('../../../assets/exercises/push-wall/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/push-wall/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/push-wall/retornar.png') },
  ],
  'push-incline': [
    { phase: 'preparar', source: require('../../../assets/exercises/push-incline/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/push-incline/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/push-incline/retornar.png') },
  ],
  'push-knee': [
    { phase: 'preparar', source: require('../../../assets/exercises/push-knee/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/push-knee/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/push-knee/retornar.png') },
  ],
  'push-standard': [
    { phase: 'preparar', source: require('../../../assets/exercises/push-standard/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/push-standard/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/push-standard/retornar.png') },
  ],
  'squat-chair': [
    { phase: 'preparar', source: require('../../../assets/exercises/squat-chair/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/squat-chair/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/squat-chair/retornar.png') },
  ],
  'squat-body': [
    { phase: 'preparar', source: require('../../../assets/exercises/squat-body/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/squat-body/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/squat-body/retornar.png') },
  ],
  'split-supported': [
    { phase: 'preparar', source: require('../../../assets/exercises/split-supported/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/split-supported/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/split-supported/retornar.png') },
  ],
  'lunge-reverse': [
    { phase: 'preparar', source: require('../../../assets/exercises/lunge-reverse/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/lunge-reverse/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/lunge-reverse/retornar.png') },
  ],
  'calf-raise': [
    { phase: 'preparar', source: require('../../../assets/exercises/calf-raise/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/calf-raise/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/calf-raise/retornar.png') },
  ],
  'glute-bridge': [
    { phase: 'preparar', source: require('../../../assets/exercises/glute-bridge/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/glute-bridge/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/glute-bridge/retornar.png') },
  ],
  'core-deadbug': [
    { phase: 'preparar', source: require('../../../assets/exercises/core-deadbug/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/core-deadbug/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/core-deadbug/retornar.png') },
  ],
  'plank-high': [
    { phase: 'preparar', source: require('../../../assets/exercises/plank-high/preparar.png') },
    { phase: 'sustentar', source: require('../../../assets/exercises/plank-high/sustentar.png') },
  ],
  'plank-knee': [
    { phase: 'preparar', source: require('../../../assets/exercises/plank-knee/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/plank-knee/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/plank-knee/retornar.png') },
  ],
  'bird-dog': [
    { phase: 'preparar', source: require('../../../assets/exercises/bird-dog/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/bird-dog/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/bird-dog/retornar.png') },
  ],
  'row-bar-supported': [
    { phase: 'preparar', source: require('../../../assets/exercises/row-bar-supported/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/row-bar-supported/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/row-bar-supported/retornar.png') },
  ],
  'pullup-assisted': [
    { phase: 'preparar', source: require('../../../assets/exercises/pullup-assisted/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/pullup-assisted/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/pullup-assisted/retornar.png') },
  ],
  'pullup': [
    { phase: 'preparar', source: require('../../../assets/exercises/pullup/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/pullup/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/pullup/retornar.png') },
  ],
  'cardio-step': [
    { phase: 'preparar', source: require('../../../assets/exercises/cardio-step/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/cardio-step/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/cardio-step/retornar.png') },
  ],
  'cardio-march-fast': [
    { phase: 'preparar', source: require('../../../assets/exercises/cardio-march-fast/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/cardio-march-fast/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/cardio-march-fast/retornar.png') },
  ],
  'mountain-slow': [
    { phase: 'preparar', source: require('../../../assets/exercises/mountain-slow/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mountain-slow/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mountain-slow/retornar.png') },
  ],
  'mob-catcow': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-catcow/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-catcow/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-catcow/retornar.png') },
  ],
  'mob-ankle': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-ankle/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-ankle/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-ankle/retornar.png') },
  ],
  'mob-thoracic': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-thoracic/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-thoracic/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-thoracic/retornar.png') },
  ],
  'mob-hip-flexor': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-hip-flexor/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-hip-flexor/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-hip-flexor/retornar.png') },
  ],
  'push-incline-high': [
    { phase: 'preparar', source: require('../../../assets/exercises/push-incline-high/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/push-incline-high/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/push-incline-high/retornar.png') },
  ],
  'push-decline-light': [
    { phase: 'preparar', source: require('../../../assets/exercises/push-decline-light/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/push-decline-light/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/push-decline-light/retornar.png') },
  ],
  'squat-partial': [
    { phase: 'preparar', source: require('../../../assets/exercises/squat-partial/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/squat-partial/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/squat-partial/retornar.png') },
  ],
  'squat-tempo': [
    { phase: 'preparar', source: require('../../../assets/exercises/squat-tempo/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/squat-tempo/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/squat-tempo/retornar.png') },
  ],
  'split-static-supported': [
    { phase: 'preparar', source: require('../../../assets/exercises/split-static-supported/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/split-static-supported/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/split-static-supported/retornar.png') },
  ],
  'step-up-low': [
    { phase: 'preparar', source: require('../../../assets/exercises/step-up-low/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/step-up-low/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/step-up-low/retornar.png') },
  ],
  'step-up-controlled': [
    { phase: 'preparar', source: require('../../../assets/exercises/step-up-controlled/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/step-up-controlled/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/step-up-controlled/retornar.png') },
  ],
  'core-deadbug-full': [
    { phase: 'preparar', source: require('../../../assets/exercises/core-deadbug-full/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/core-deadbug-full/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/core-deadbug-full/retornar.png') },
  ],
  'plank-wall': [
    { phase: 'preparar', source: require('../../../assets/exercises/plank-wall/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/plank-wall/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/plank-wall/retornar.png') },
  ],
  'plank-forearm': [
    { phase: 'preparar', source: require('../../../assets/exercises/plank-forearm/preparar.png') },
    { phase: 'sustentar', source: require('../../../assets/exercises/plank-forearm/sustentar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/plank-forearm/retornar.png') },
  ],
  'side-plank-knee': [
    { phase: 'preparar', source: require('../../../assets/exercises/side-plank-knee/preparar.png') },
    { phase: 'sustentar', source: require('../../../assets/exercises/side-plank-knee/sustentar.png') },
  ],
  'side-plank': [
    { phase: 'preparar', source: require('../../../assets/exercises/side-plank/preparar.png') },
    { phase: 'sustentar', source: require('../../../assets/exercises/side-plank/sustentar.png') },
  ],
  'scapular-row': [
    { phase: 'preparar', source: require('../../../assets/exercises/scapular-row/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/scapular-row/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/scapular-row/retornar.png') },
  ],
  'row-bar-high': [
    { phase: 'preparar', source: require('../../../assets/exercises/row-bar-high/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/row-bar-high/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/row-bar-high/retornar.png') },
  ],
  'pullup-negative': [
    { phase: 'preparar', source: require('../../../assets/exercises/pullup-negative/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/pullup-negative/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/pullup-negative/retornar.png') },
  ],
  'cardio-step-touch': [
    { phase: 'preparar', source: require('../../../assets/exercises/cardio-step-touch/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/cardio-step-touch/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/cardio-step-touch/retornar.png') },
  ],
  'cardio-knee-lift': [
    { phase: 'preparar', source: require('../../../assets/exercises/cardio-knee-lift/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/cardio-knee-lift/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/cardio-knee-lift/retornar.png') },
  ],
  'cardio-shadow': [
    { phase: 'preparar', source: require('../../../assets/exercises/cardio-shadow/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/cardio-shadow/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/cardio-shadow/retornar.png') },
  ],
  'mob-shoulder-wall': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-shoulder-wall/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-shoulder-wall/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-shoulder-wall/retornar.png') },
  ],
  'mob-hip-90-90': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-hip-90-90/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-hip-90-90/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-hip-90-90/retornar.png') },
  ],
  'mob-hamstring-dynamic': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-hamstring-dynamic/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-hamstring-dynamic/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-hamstring-dynamic/retornar.png') },
  ],
  'mob-wrist': [
    { phase: 'preparar', source: require('../../../assets/exercises/mob-wrist/preparar.png') },
    { phase: 'executar', source: require('../../../assets/exercises/mob-wrist/executar.png') },
    { phase: 'retornar', source: require('../../../assets/exercises/mob-wrist/retornar.png') },
  ],
};

export function getExerciseImages(exerciseId: string): readonly ExerciseImageFrame[] {
  return exerciseImageCatalog[exerciseId] ?? [];
}
