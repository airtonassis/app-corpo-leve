import { ImageSourcePropType } from 'react-native';
import { AvatarMovementPhaseKey } from '../../types/program';

export type ExerciseVisualAssets =
  Partial<Record<AvatarMovementPhaseKey, ImageSourcePropType>>;

export const exerciseVisualAssetCatalog: Record<
  string,
  ExerciseVisualAssets
> = {
  'squat-body': {
    preparar: require('../../../assets/exercises/squat-body/preparar.png'),
    executar: require('../../../assets/exercises/squat-body/executar.png'),
    retornar: require('../../../assets/exercises/squat-body/retornar.png'),
  },

  'push-incline': {
    preparar: require('../../../assets/exercises/push-incline/preparar.png'),
    executar: require('../../../assets/exercises/push-incline/executar.png'),
    retornar: require('../../../assets/exercises/push-incline/retornar.png'),
  },

  'plank-forearm': {
    preparar: require('../../../assets/exercises/plank-forearm/preparar.png'),
    executar: require('../../../assets/exercises/plank-forearm/executar.png'),
  },
};