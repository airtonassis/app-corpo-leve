import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { AvatarCoachRegion, AvatarMotionKey, AvatarMovementPhaseKey, AvatarTechniquePoint, AvatarVariant, ExerciseDefinition } from '../types/program';

type Props = {
  variant: AvatarVariant;
  exercise: ExerciseDefinition;
  active?: boolean;
  compact?: boolean;
  phaseKey?: AvatarMovementPhaseKey;
  phaseDurationMs?: number;
  coachPoints?: AvatarTechniquePoint[];
};

type Pose = {
  rootRotate: number;
  rootX: number;
  rootY: number;
  torsoRotate: number;
  shoulderL: number;
  elbowL: number;
  shoulderR: number;
  elbowR: number;
  hipL: number;
  kneeL: number;
  hipR: number;
  kneeR: number;
};

type PoseSet = Record<AvatarMovementPhaseKey, Pose>;

const BASE_POSE: Pose = {
  rootRotate: 0, rootX: 0, rootY: 0, torsoRotate: 0,
  shoulderL: 8, elbowL: 4, shoulderR: -8, elbowR: -4,
  hipL: 4, kneeL: 2, hipR: -4, kneeR: -2,
};

const POSES: Record<AvatarMotionKey, PoseSet> = {
  warmup: {
    preparar: { ...BASE_POSE, shoulderL: 12, shoulderR: -12, hipL: 6, hipR: -6 },
    executar: { ...BASE_POSE, rootY: -7, shoulderL: -35, elbowL: -18, shoulderR: 35, elbowR: 18, hipL: -23, kneeL: 35, hipR: 20, kneeR: -30 },
    retornar: { ...BASE_POSE, rootY: 1, shoulderL: 28, elbowL: 12, shoulderR: -28, elbowR: -12, hipL: 18, kneeL: -26, hipR: -20, kneeR: 32 },
  },
  pushup: {
    preparar: { ...BASE_POSE, rootRotate: 69, rootX: -12, rootY: 6, torsoRotate: -2, shoulderL: -55, elbowL: 35, shoulderR: -55, elbowR: 35, hipL: -4, hipR: 4 },
    executar: { ...BASE_POSE, rootRotate: 69, rootX: -2, rootY: 18, torsoRotate: 0, shoulderL: -18, elbowL: 88, shoulderR: -18, elbowR: 88, hipL: -2, hipR: 2 },
    retornar: { ...BASE_POSE, rootRotate: 69, rootX: -12, rootY: 6, torsoRotate: -2, shoulderL: -55, elbowL: 35, shoulderR: -55, elbowR: 35, hipL: -4, hipR: 4 },
  },
  squat: {
    preparar: { ...BASE_POSE, shoulderL: -70, elbowL: 6, shoulderR: 70, elbowR: -6 },
    executar: { ...BASE_POSE, rootY: 25, torsoRotate: 9, shoulderL: -78, shoulderR: 78, hipL: 42, kneeL: -76, hipR: -42, kneeR: 76 },
    retornar: { ...BASE_POSE, shoulderL: -70, elbowL: 6, shoulderR: 70, elbowR: -6 },
  },
  lunge: {
    preparar: { ...BASE_POSE, rootY: 2, hipL: -16, kneeL: 10, hipR: 24, kneeR: -12 },
    executar: { ...BASE_POSE, rootY: 24, torsoRotate: 4, hipL: 38, kneeL: -72, hipR: -42, kneeR: 68, shoulderL: 14, shoulderR: -14 },
    retornar: { ...BASE_POSE, rootY: 3, hipL: -16, kneeL: 10, hipR: 24, kneeR: -12 },
  },
  pull: {
    preparar: { ...BASE_POSE, rootY: 16, shoulderL: 172, elbowL: 4, shoulderR: -172, elbowR: -4, hipL: 2, hipR: -2 },
    executar: { ...BASE_POSE, rootY: -14, shoulderL: 130, elbowL: -78, shoulderR: -130, elbowR: 78, hipL: 3, hipR: -3 },
    retornar: { ...BASE_POSE, rootY: 14, shoulderL: 172, elbowL: 4, shoulderR: -172, elbowR: -4 },
  },
  plank: {
    preparar: { ...BASE_POSE, rootRotate: 72, rootX: -5, rootY: 9, shoulderL: -64, elbowL: 42, shoulderR: -64, elbowR: 42, hipL: -3, hipR: 3 },
    executar: { ...BASE_POSE, rootRotate: 72, rootX: -2, rootY: 10, shoulderL: -64, elbowL: 42, shoulderR: -64, elbowR: 42, hipL: -3, hipR: 3 },
    retornar: { ...BASE_POSE, rootRotate: 72, rootX: 1, rootY: 11, shoulderL: -64, elbowL: 42, shoulderR: -64, elbowR: 42, hipL: -3, hipR: 3 },
  },
  'core-floor': {
    preparar: { ...BASE_POSE, rootRotate: 86, rootX: -4, rootY: 17, shoulderL: -18, shoulderR: 18, hipL: 42, kneeL: -62, hipR: -42, kneeR: 62 },
    executar: { ...BASE_POSE, rootRotate: 86, rootX: 0, rootY: 14, shoulderL: -92, elbowL: 0, shoulderR: 25, elbowR: 12, hipL: 10, kneeL: -12, hipR: -68, kneeR: 28 },
    retornar: { ...BASE_POSE, rootRotate: 86, rootX: -4, rootY: 17, shoulderL: -18, shoulderR: 18, hipL: 42, kneeL: -62, hipR: -42, kneeR: 62 },
  },
  mobility: {
    preparar: { ...BASE_POSE },
    executar: { ...BASE_POSE, torsoRotate: -10, rootX: -7, shoulderL: 82, elbowL: 10, shoulderR: -32, elbowR: -8, hipL: 8, hipR: -8 },
    retornar: { ...BASE_POSE, torsoRotate: 10, rootX: 7, shoulderL: 32, elbowL: 8, shoulderR: -82, elbowR: -10, hipL: -8, hipR: 8 },
  },
  cardio: {
    preparar: { ...BASE_POSE },
    executar: { ...BASE_POSE, rootY: -8, shoulderL: -38, elbowL: -18, shoulderR: 38, elbowR: 18, hipL: -34, kneeL: 58, hipR: 18, kneeR: -22 },
    retornar: { ...BASE_POSE, rootY: -2, shoulderL: 34, elbowL: 16, shoulderR: -34, elbowR: -16, hipL: 20, kneeL: -28, hipR: -34, kneeR: 56 },
  },
  default: {
    preparar: { ...BASE_POSE },
    executar: { ...BASE_POSE, rootY: -5, shoulderL: -18, shoulderR: 18, hipL: -10, hipR: 10 },
    retornar: { ...BASE_POSE },
  },
};


function withPose(base: Pose, patch: Partial<Pose>): Pose { return { ...base, ...patch }; }

function resolvePoseSet(exercise: ExerciseDefinition, motionKey: AvatarMotionKey): PoseSet {
  const base = POSES[motionKey];

  if (exercise.id === 'push-wall') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 18, rootX: 20, rootY: 2, shoulderL: -70, shoulderR: -70, elbowL: 18, elbowR: 18 }),
      executar: withPose(base.executar, { rootRotate: 18, rootX: 30, rootY: 5, shoulderL: -36, shoulderR: -36, elbowL: 82, elbowR: 82 }),
      retornar: withPose(base.retornar, { rootRotate: 18, rootX: 20, rootY: 2, shoulderL: -70, shoulderR: -70, elbowL: 18, elbowR: 18 }),
    };
  }
  if (exercise.id === 'push-incline-high') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 38, rootX: 7, rootY: 4 }),
      executar: withPose(base.executar, { rootRotate: 38, rootX: 15, rootY: 14 }),
      retornar: withPose(base.retornar, { rootRotate: 38, rootX: 7, rootY: 4 }),
    };
  }
  if (exercise.id === 'push-incline') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 50, rootX: 1, rootY: 5 }),
      executar: withPose(base.executar, { rootRotate: 50, rootX: 8, rootY: 16 }),
      retornar: withPose(base.retornar, { rootRotate: 50, rootX: 1, rootY: 5 }),
    };
  }
  if (exercise.id === 'push-knee') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 61, rootY: 13, hipL: 25, kneeL: -72, hipR: -25, kneeR: 72 }),
      executar: withPose(base.executar, { rootRotate: 61, rootY: 24, hipL: 25, kneeL: -72, hipR: -25, kneeR: 72 }),
      retornar: withPose(base.retornar, { rootRotate: 61, rootY: 13, hipL: 25, kneeL: -72, hipR: -25, kneeR: 72 }),
    };
  }
  if (exercise.id === 'squat-chair') {
    return {
      preparar: withPose(base.preparar, { rootY: 0 }),
      executar: withPose(base.executar, { rootY: 29, torsoRotate: 12, hipL: 48, kneeL: -82, hipR: -48, kneeR: 82 }),
      retornar: withPose(base.retornar, { rootY: 0 }),
    };
  }
  if (exercise.id === 'split-static-supported' || exercise.id === 'split-supported') {
    return {
      preparar: withPose(base.preparar, { shoulderR: -72, elbowR: 8 }),
      executar: withPose(base.executar, { shoulderR: -72, elbowR: 8 }),
      retornar: withPose(base.retornar, { shoulderR: -72, elbowR: 8 }),
    };
  }
  if (exercise.id === 'plank-wall') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 18, rootX: 18, rootY: 0, shoulderL: -65, shoulderR: -65, elbowL: 75, elbowR: 75 }),
      executar: withPose(base.executar, { rootRotate: 18, rootX: 18, rootY: 0, shoulderL: -65, shoulderR: -65, elbowL: 75, elbowR: 75 }),
      retornar: withPose(base.retornar, { rootRotate: 18, rootX: 18, rootY: 0, shoulderL: -65, shoulderR: -65, elbowL: 75, elbowR: 75 }),
    };
  }
  if (exercise.id === 'side-plank-knee' || exercise.id === 'side-plank') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 88, rootY: 14, shoulderL: -82, elbowL: 82, shoulderR: 95, elbowR: 4, hipL: exercise.id === 'side-plank-knee' ? 28 : 0, kneeL: exercise.id === 'side-plank-knee' ? -65 : 0 }),
      executar: withPose(base.executar, { rootRotate: 88, rootY: 8, shoulderL: -82, elbowL: 82, shoulderR: 95, elbowR: 4, hipL: exercise.id === 'side-plank-knee' ? 28 : 0, kneeL: exercise.id === 'side-plank-knee' ? -65 : 0 }),
      retornar: withPose(base.retornar, { rootRotate: 88, rootY: 14, shoulderL: -82, elbowL: 82, shoulderR: 95, elbowR: 4, hipL: exercise.id === 'side-plank-knee' ? 28 : 0, kneeL: exercise.id === 'side-plank-knee' ? -65 : 0 }),
    };
  }
  if (exercise.id.includes('row') || exercise.id === 'scapular-row') {
    return {
      preparar: withPose(base.preparar, { rootRotate: 62, rootX: -6, rootY: 12, shoulderL: -76, shoulderR: -76, elbowL: 15, elbowR: 15 }),
      executar: withPose(base.executar, { rootRotate: 62, rootX: 2, rootY: 1, shoulderL: -38, shoulderR: -38, elbowL: 84, elbowR: 84 }),
      retornar: withPose(base.retornar, { rootRotate: 62, rootX: -6, rootY: 12, shoulderL: -76, shoulderR: -76, elbowL: 15, elbowR: 15 }),
    };
  }
  if (exercise.id === 'glute-bridge') {
    return {
      preparar: withPose(POSES['core-floor'].preparar, { rootRotate: 88, rootY: 22, hipL: 50, kneeL: -78, hipR: -50, kneeR: 78 }),
      executar: withPose(POSES['core-floor'].executar, { rootRotate: 76, rootY: 4, hipL: 42, kneeL: -72, hipR: -42, kneeR: 72 }),
      retornar: withPose(POSES['core-floor'].retornar, { rootRotate: 88, rootY: 22, hipL: 50, kneeL: -78, hipR: -50, kneeR: 78 }),
    };
  }
  if (exercise.id === 'bird-dog') {
    return {
      preparar: withPose(POSES.plank.preparar, { rootRotate: 72, rootY: 18, shoulderL: -72, elbowL: 78, shoulderR: -72, elbowR: 78, hipL: 34, kneeL: -82, hipR: -34, kneeR: 82 }),
      executar: withPose(POSES.plank.executar, { rootRotate: 72, rootX: 2, rootY: 10, shoulderL: -150, elbowL: 5, shoulderR: -72, elbowR: 78, hipL: -12, kneeL: 4, hipR: -34, kneeR: 82 }),
      retornar: withPose(POSES.plank.retornar, { rootRotate: 72, rootY: 18, shoulderL: -72, elbowL: 78, shoulderR: -72, elbowR: 78, hipL: 34, kneeL: -82, hipR: -34, kneeR: 82 }),
    };
  }
  if (exercise.id === 'mob-catcow') {
    return {
      preparar: withPose(POSES.plank.preparar, { rootRotate: 72, rootY: 18, torsoRotate: 0, shoulderL: -72, elbowL: 78, shoulderR: -72, elbowR: 78, hipL: 34, kneeL: -82, hipR: -34, kneeR: 82 }),
      executar: withPose(POSES.plank.executar, { rootRotate: 72, rootY: 15, torsoRotate: -14, shoulderL: -72, elbowL: 78, shoulderR: -72, elbowR: 78, hipL: 38, kneeL: -82, hipR: -38, kneeR: 82 }),
      retornar: withPose(POSES.plank.retornar, { rootRotate: 72, rootY: 19, torsoRotate: 12, shoulderL: -72, elbowL: 78, shoulderR: -72, elbowR: 78, hipL: 30, kneeL: -82, hipR: -30, kneeR: 82 }),
    };
  }
  if (exercise.id === 'mob-shoulder-wall') {
    return {
      preparar: withPose(POSES.mobility.preparar, { rootRotate: 6, rootX: 18, shoulderL: -82, elbowL: 8, shoulderR: -82, elbowR: 8 }),
      executar: withPose(POSES.mobility.executar, { rootRotate: 6, rootX: 18, shoulderL: -150, elbowL: 4, shoulderR: -150, elbowR: 4 }),
      retornar: withPose(POSES.mobility.retornar, { rootRotate: 6, rootX: 18, shoulderL: -82, elbowL: 8, shoulderR: -82, elbowR: 8 }),
    };
  }
  if (exercise.id === 'mob-ankle') {
    return {
      preparar: withPose(POSES.lunge.preparar, { rootRotate: 4, rootX: 14, shoulderR: -70, elbowR: 12, hipL: -10, kneeL: 8, hipR: 22, kneeR: -15 }),
      executar: withPose(POSES.lunge.executar, { rootRotate: 4, rootX: 20, rootY: 7, shoulderR: -70, elbowR: 12, hipL: 18, kneeL: -28, hipR: -10, kneeR: 14 }),
      retornar: withPose(POSES.lunge.retornar, { rootRotate: 4, rootX: 14, shoulderR: -70, elbowR: 12, hipL: -10, kneeL: 8, hipR: 22, kneeR: -15 }),
    };
  }
  if (exercise.id === 'warm-hip') {
    return {
      preparar: withPose(POSES.mobility.preparar, { shoulderR: -58, elbowR: 18 }),
      executar: withPose(POSES.mobility.executar, { rootX: -7, torsoRotate: -4, hipL: 10, hipR: -12, shoulderR: -58, elbowR: 18 }),
      retornar: withPose(POSES.mobility.retornar, { rootX: 7, torsoRotate: 4, hipL: -10, hipR: 12, shoulderR: -58, elbowR: 18 }),
    };
  }
  if (exercise.id === 'cardio-step-touch' || exercise.id === 'cardio-step') {
    return {
      preparar: withPose(POSES.cardio.preparar, { rootX: 0 }),
      executar: withPose(POSES.cardio.executar, { rootX: 10, rootY: -2, hipL: -18, kneeL: 16, hipR: 28, kneeR: -16 }),
      retornar: withPose(POSES.cardio.retornar, { rootX: -10, rootY: -2, hipL: 28, kneeL: -16, hipR: -18, kneeR: 16 }),
    };
  }
  return base;
}

const MOTION_CUES: Record<AvatarMotionKey, string> = {
  warmup: 'Movimento leve e progressivo', pushup: 'Desça e suba com controle', squat: 'Controle a descida e mantenha estabilidade',
  lunge: 'Desça com controle e use apoio quando previsto', pull: 'Puxe com controle, sem usar impulso',
  plank: 'Mantenha o tronco alinhado e respire normalmente', 'core-floor': 'Mova os membros sem perder estabilidade do tronco',
  mobility: 'Use amplitude confortável, sem forçar', cardio: 'Mantenha um ritmo controlável', default: 'Execute com controle e atenção à técnica',
};

export function resolveAvatarMotionKey(exercise: ExerciseDefinition): AvatarMotionKey {
  if (exercise.avatarMotionKey) return exercise.avatarMotionKey;
  const group = exercise.progressionGroup ?? '';
  if (group.includes('push')) return 'pushup';
  if (group.includes('squat') || group.includes('stepup')) return 'squat';
  if (group.includes('lunge') || group.includes('split')) return 'lunge';
  if (group.includes('pull') || group.includes('row')) return 'pull';
  if (group.includes('plank') || exercise.id.includes('plank')) return 'plank';
  if (group.includes('core') || exercise.category === 'core') return 'core-floor';
  if (exercise.category === 'mobilidade') return 'mobility';
  if (exercise.category === 'condicionamento') return 'cardio';
  if (exercise.category === 'aquecimento') return 'warmup';
  return 'default';
}

function variantLabel(variant: AvatarVariant): string {
  if (variant === 'feminino') return 'Avatar feminino';
  if (variant === 'masculino') return 'Avatar masculino';
  return 'Avatar neutro';
}



function pointsForRegion(points: AvatarTechniquePoint[], region: AvatarCoachRegion) {
  return points
    .filter((point) => point.region === region)
    .sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3));
}

function hasRegion(points: AvatarTechniquePoint[], region: AvatarCoachRegion) {
  return points.some((point) => point.region === region);
}


type TrajectoryKind = 'down' | 'up' | 'forward' | 'back' | 'hold' | 'diagonal-down' | 'diagonal-up';

function resolveTrajectory(motionKey: AvatarMotionKey, phase: AvatarMovementPhaseKey): TrajectoryKind {
  if (phase === 'preparar') return 'hold';
  if (motionKey === 'squat' || motionKey === 'lunge') return phase === 'executar' ? 'down' : 'up';
  if (motionKey === 'pushup') return phase === 'executar' ? 'diagonal-down' : 'diagonal-up';
  if (motionKey === 'pull') return phase === 'executar' ? 'up' : 'down';
  if (motionKey === 'plank') return 'hold';
  if (motionKey === 'core-floor') return phase === 'executar' ? 'forward' : 'back';
  if (motionKey === 'mobility') return phase === 'executar' ? 'forward' : 'back';
  if (motionKey === 'cardio' || motionKey === 'warmup') return phase === 'executar' ? 'up' : 'down';
  return phase === 'executar' ? 'forward' : 'back';
}

function trajectoryLabel(kind: TrajectoryKind): string {
  switch (kind) {
    case 'down': return 'DESCER';
    case 'up': return 'SUBIR';
    case 'forward': return 'AVANÇAR';
    case 'back': return 'RETORNAR';
    case 'diagonal-down': return 'APROXIMAR';
    case 'diagonal-up': return 'AFASTAR';
    default: return 'SUSTENTAR';
  }
}

function trajectoryTransform(kind: TrajectoryKind) {
  switch (kind) {
    case 'down': return [{ rotate: '90deg' }];
    case 'up': return [{ rotate: '-90deg' }];
    case 'back': return [{ rotate: '180deg' }];
    case 'diagonal-down': return [{ rotate: '45deg' }];
    case 'diagonal-up': return [{ rotate: '-135deg' }];
    default: return [{ rotate: '0deg' }];
  }
}

const JOINT_KEYS: (keyof Pose)[] = ['rootRotate','rootX','rootY','torsoRotate','shoulderL','elbowL','shoulderR','elbowR','hipL','kneeL','hipR','kneeR'];

export function ExerciseAvatar({ variant, exercise, active = true, compact = false, phaseKey, phaseDurationMs, coachPoints = [] }: Props) {
  const motionKey = resolveAvatarMotionKey(exercise);
  const poseSet = useMemo(() => resolvePoseSet(exercise, motionKey), [exercise, motionKey]);
  const [internalPhase, setInternalPhase] = useState<AvatarMovementPhaseKey>('preparar');
  const currentPhase = phaseKey ?? internalPhase;
  const values = useRef(Object.fromEntries(JOINT_KEYS.map((key) => [key, new Animated.Value(poseSet.preparar[key])])) as Record<keyof Pose, Animated.Value>).current;
  const coachPulse = useRef(new Animated.Value(0)).current;
  const trajectoryPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phaseKey || !active) return;
    const order: AvatarMovementPhaseKey[] = ['preparar', 'executar', 'retornar'];
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % order.length;
      setInternalPhase(order[index]);
    }, 1200);
    return () => clearInterval(timer);
  }, [active, phaseKey, exercise.id]);

  useEffect(() => {
    if (!active || !coachPoints.length) {
      coachPulse.stopAnimation();
      coachPulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(coachPulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(coachPulse, { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, coachPoints.length, coachPulse]);

  useEffect(() => {
    trajectoryPulse.stopAnimation();
    trajectoryPulse.setValue(0);
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(trajectoryPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(trajectoryPulse, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, currentPhase, trajectoryPulse]);

  useEffect(() => {
    const target = poseSet[currentPhase];
    const fallbackDuration = currentPhase === 'preparar' ? 650 : 900;
    const duration = phaseDurationMs
      ? Math.max(420, Math.round(phaseDurationMs * 0.88))
      : fallbackDuration;
    const animations = JOINT_KEYS.map((key) => Animated.timing(values[key], {
      toValue: target[key], duration, useNativeDriver: true,
    }));
    const parallel = Animated.parallel(animations);
    if (active) parallel.start();
    else JOINT_KEYS.forEach((key) => values[key].setValue(target[key]));
    return () => parallel.stop();
  }, [active, currentPhase, exercise.id, phaseDurationMs, poseSet, values]);

  const torsoWidth = variant === 'feminino' ? 34 : variant === 'masculino' ? 40 : 37;
  const shoulderWidth = variant === 'feminino' ? 45 : variant === 'masculino' ? 53 : 49;
  const hipWidth = variant === 'feminino' ? 39 : variant === 'masculino' ? 36 : 38;
  const hairStyle = variant === 'feminino' ? styles.hairLong : variant === 'masculino' ? styles.hairShort : styles.hairNeutral;

  const rot = (v: Animated.Value) => v.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });
  const rootTransform = useMemo(() => ([
    { translateX: values.rootX }, { translateY: values.rootY }, { rotate: rot(values.rootRotate) },
  ]), [values]);

  const surfaceKind = exercise.id.includes('wall') ? 'wall' : (exercise.id.includes('incline') || exercise.id === 'squat-chair' || exercise.id.includes('supported')) ? 'bench' : null;
  const showAlignment = coachPoints.some((point) => point.region === 'tronco' && (point.priority ?? 3) <= 2);
  const trajectoryKind = resolveTrajectory(motionKey, currentPhase);
  const trajectoryTravel = trajectoryPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });
  const trajectoryOpacity = trajectoryPulse.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.25, 0.95, 0.45] });
  const pulseScale = coachPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.16] });
  const pulseOpacity = coachPulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const jointMarker = (region: AvatarCoachRegion, style?: object) => {
    const point = pointsForRegion(coachPoints, region)[0];
    if (!point) return null;
    return (
      <Animated.View
        pointerEvents="none"
        accessibilityLabel={`Ponto técnico: ${point.label}`}
        style={[
          styles.jointCoachMarker,
          style,
          (point.priority ?? 3) === 1 && styles.jointCoachMarkerPrimary,
          { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
        ]}
      >
        <View style={styles.jointCoachCore} />
      </Animated.View>
    );
  };

  return (
    <View style={[styles.card, compact && styles.cardCompact]} accessibilityLabel={`${variantLabel(variant)} demonstrando ${exercise.name}`}>
      <View style={styles.stage}>
        <View style={styles.ground} />
        {motionKey === 'pull' && <><View style={styles.pullBar} /><View style={styles.pullPostLeft} /><View style={styles.pullPostRight} /></>}
        {surfaceKind === 'wall' && <View style={styles.wallSurface} />}
        {surfaceKind === 'bench' && <View style={styles.benchSurface} />}

        <Animated.View style={[styles.skeleton, { transform: rootTransform }]}>
          <Animated.View style={[styles.torsoRoot, { width: torsoWidth, transform: [{ rotate: rot(values.torsoRotate) }] }]}>
            <View style={styles.headWrap}>
              <View style={styles.head} />
              <View style={hairStyle} />
              {jointMarker('cabeca', styles.markerHead)}
            </View>
            <View style={[styles.torso, { width: torsoWidth }]}>
              {jointMarker('tronco', styles.markerTorso)}
              {jointMarker('respiracao', styles.markerBreath)}
              {jointMarker('geral', styles.markerGeneral)}
              {showAlignment && (
                <View pointerEvents="none" style={styles.bodyAlignmentGuide}>
                  <View style={styles.bodyAlignmentDash} />
                </View>
              )}
            </View>
            <View style={[styles.shoulderLine, { width: shoulderWidth }]} />
            <View style={[styles.hipLine, { width: hipWidth }]} />

            <Animated.View style={[styles.joint, styles.shoulderLeft, { transform: [{ rotate: rot(values.shoulderL) }] }]}>
              {jointMarker('ombros', styles.markerShoulder)}
              <View style={styles.upperArm} />
              <Animated.View style={[styles.elbowJoint, { transform: [{ rotate: rot(values.elbowL) }] }]}>
                <View style={styles.forearm} />
                <View style={styles.hand}>{jointMarker('maos', styles.markerHand)}</View>
              </Animated.View>
            </Animated.View>
            <Animated.View style={[styles.joint, styles.shoulderRight, { transform: [{ rotate: rot(values.shoulderR) }] }]}>
              {jointMarker('ombros', styles.markerShoulder)}
              <View style={styles.upperArm} />
              <Animated.View style={[styles.elbowJoint, { transform: [{ rotate: rot(values.elbowR) }] }]}>
                <View style={styles.forearm} />
                <View style={styles.hand}>{jointMarker('maos', styles.markerHand)}</View>
              </Animated.View>
            </Animated.View>

            <Animated.View style={[styles.joint, styles.hipLeft, { transform: [{ rotate: rot(values.hipL) }] }]}>
              {jointMarker('quadril', styles.markerHip)}
              <View style={styles.thigh} />
              <Animated.View style={[styles.kneeJoint, { transform: [{ rotate: rot(values.kneeL) }] }]}>
                {jointMarker('joelhos', styles.markerKnee)}
                <View style={styles.shin} />
                <View style={styles.foot}>{jointMarker('pes', styles.markerFoot)}</View>
              </Animated.View>
            </Animated.View>
            <Animated.View style={[styles.joint, styles.hipRight, { transform: [{ rotate: rot(values.hipR) }] }]}>
              {jointMarker('quadril', styles.markerHip)}
              <View style={styles.thigh} />
              <Animated.View style={[styles.kneeJoint, { transform: [{ rotate: rot(values.kneeR) }] }]}>
                {jointMarker('joelhos', styles.markerKnee)}
                <View style={styles.shin} />
                <View style={styles.foot}>{jointMarker('pes', styles.markerFoot)}</View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <View pointerEvents="none" style={styles.trajectoryWrap}>
          <Animated.View
            style={[
              styles.trajectory,
              {
                opacity: trajectoryOpacity,
                transform: [
                  ...trajectoryTransform(trajectoryKind),
                  { translateX: trajectoryKind === 'hold' ? 0 : trajectoryTravel },
                ],
              },
            ]}
          >
            <View style={styles.trajectoryShaft} />
            <View style={styles.trajectoryArrowHead} />
          </Animated.View>
          <Text style={styles.trajectoryLabel}>{trajectoryLabel(trajectoryKind)}</Text>
        </View>

        <View style={styles.phaseBadge}><Text style={styles.phaseBadgeText}>{currentPhase.toUpperCase()}</Text></View>
      </View>
      {!compact && (
        <View style={styles.caption}>
          <Text style={styles.avatarLabel}>{variantLabel(variant)} · avatar articulado</Text>
          <Text style={styles.cue}>{MOTION_CUES[motionKey]}</Text>
          <Text style={styles.disclaimer}>Referência visual do movimento. A qualidade da execução e as orientações técnicas são mais importantes que a velocidade.</Text>
        </View>
      )}
    </View>
  );
}

const SKIN = '#D8DDE5';
const CLOTH = '#202934';
const LEG = '#2F3945';

const styles = StyleSheet.create({
  card: { backgroundColor: '#10161D', borderRadius: radius.lg, overflow: 'hidden', marginVertical: spacing.md },
  cardCompact: { marginVertical: spacing.sm },
  stage: { height: 248, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ground: { position: 'absolute', bottom: 28, width: '84%', height: 2, backgroundColor: '#2C3947' },
  pullBar: { position: 'absolute', top: 25, width: 178, height: 6, borderRadius: 3, backgroundColor: '#7E8A97' },
  pullPostLeft: { position: 'absolute', top: 25, left: '22%', width: 5, height: 185, backgroundColor: '#56616C' },
  pullPostRight: { position: 'absolute', top: 25, right: '22%', width: 5, height: 185, backgroundColor: '#56616C' },
  wallSurface: { position: 'absolute', right: 20, top: 35, width: 12, height: 182, borderRadius: 3, backgroundColor: '#55616C' },
  benchSurface: { position: 'absolute', right: 8, bottom: 28, width: 95, height: 62, borderRadius: 8, backgroundColor: '#303A44' },
  skeleton: { width: 150, height: 190, alignItems: 'center', justifyContent: 'center' },
  torsoRoot: { height: 105, alignItems: 'center' },
  headWrap: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', zIndex: 8, marginTop: -29 },
  head: { width: 34, height: 34, borderRadius: 17, backgroundColor: SKIN },
  hairShort: { position: 'absolute', top: 2, width: 32, height: 10, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#20242B' },
  hairLong: { position: 'absolute', top: 1, width: 34, height: 25, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomLeftRadius: 8, backgroundColor: '#20242B', zIndex: -1 },
  hairNeutral: { position: 'absolute', top: 2, width: 29, height: 8, borderRadius: 8, backgroundColor: '#39424D' },
  torso: { height: 69, borderRadius: 13, backgroundColor: CLOTH, marginTop: -2 },
  shoulderLine: { position: 'absolute', top: 12, height: 4, borderRadius: 2, backgroundColor: '#36414D' },
  hipLine: { position: 'absolute', top: 72, height: 4, borderRadius: 2, backgroundColor: '#36414D' },
  joint: { position: 'absolute', width: 16, height: 64, alignItems: 'center' },
  shoulderLeft: { top: 10, left: -10 }, shoulderRight: { top: 10, right: -10 },
  upperArm: { width: 14, height: 48, borderRadius: 8, backgroundColor: SKIN },
  elbowJoint: { position: 'absolute', top: 42, width: 16, height: 55, alignItems: 'center' },
  forearm: { width: 12, height: 43, borderRadius: 7, backgroundColor: SKIN },
  hand: { width: 17, height: 10, borderRadius: 6, backgroundColor: SKIN, marginTop: -2 },
  hipLeft: { top: 72, left: 1 }, hipRight: { top: 72, right: 1 },
  thigh: { width: 17, height: 54, borderRadius: 9, backgroundColor: LEG },
  kneeJoint: { position: 'absolute', top: 48, width: 18, height: 62, alignItems: 'center' },
  shin: { width: 15, height: 50, borderRadius: 8, backgroundColor: LEG },
  foot: { width: 27, height: 10, borderRadius: 6, backgroundColor: '#151B21', marginTop: -2, marginLeft: 9 },
  jointCoachMarker: {
    position: 'absolute',
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(102,227,156,0.16)',
    borderWidth: 1.5, borderColor: '#66E39C',
    zIndex: 30,
  },
  jointCoachMarkerPrimary: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(102,227,156,0.28)', borderWidth: 2,
  },
  jointCoachCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8CF0B2' },
  markerHead: { top: 10, left: 13 },
  markerTorso: { top: 24, left: '50%', marginLeft: -8 },
  markerBreath: { top: 12, left: '50%', marginLeft: -8 },
  markerGeneral: { top: 30, left: '50%', marginLeft: -8 },
  markerShoulder: { top: -5, left: 0 },
  markerHand: { top: -4, left: 2 },
  markerHip: { top: -5, left: 0 },
  markerKnee: { top: -5, left: 1 },
  markerFoot: { top: -3, left: 6 },
  bodyAlignmentGuide: {
    position: 'absolute', left: '50%', top: 2, bottom: 2,
    width: 2, marginLeft: -1, alignItems: 'center',
  },
  bodyAlignmentDash: {
    width: 2, height: '100%', borderRadius: 1,
    backgroundColor: 'rgba(102,227,156,0.28)',
  },
  trajectoryWrap: {
    position: 'absolute', right: 14, top: 86,
    width: 74, alignItems: 'center', justifyContent: 'center',
  },
  trajectory: {
    width: 44, height: 18, flexDirection: 'row', alignItems: 'center',
  },
  trajectoryShaft: {
    width: 31, height: 3, borderRadius: 2,
    backgroundColor: '#66E39C',
  },
  trajectoryArrowHead: {
    width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderLeftColor: '#66E39C',
  },
  trajectoryLabel: {
    ...typography.caption, marginTop: 6,
    color: '#8CF0B2', fontSize: 9, fontWeight: '900', letterSpacing: 0.6,
  },
    phaseBadge: { position: 'absolute', left: spacing.md, top: spacing.md, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: '#13271D', borderWidth: 1, borderColor: '#275C3B' },
  phaseBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '900', fontSize: 10 },
  caption: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  avatarLabel: { ...typography.caption, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
  cue: { ...typography.body, fontWeight: '700', color: '#FFFFFF', marginTop: spacing.xs },
  disclaimer: { ...typography.caption, color: '#AAB5C0', lineHeight: 17, marginTop: spacing.xs },
});
