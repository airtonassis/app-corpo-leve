import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { exerciseVisualDemoCatalog } from '../data/exercises/visualDemoCatalog';
import { AvatarVariant, ExerciseDefinition } from '../types/program';
import { colors, radius, spacing, typography } from '../constants/theme';
import { ExerciseAvatar } from './ExerciseAvatar';

type Props = { exercise: ExerciseDefinition; variant: AvatarVariant };

export function ExerciseVisualDemo({ exercise, variant }: Props) {
  const demo = exerciseVisualDemoCatalog[exercise.id];
  if (!demo || exercise.visualGuide?.status !== 'mapped') return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DEMONSTRAÇÃO VISUAL · PILOTO</Text>
        <Text style={styles.badge}>Rascunho · validação profissional pendente</Text>
      </View>
      <Text style={styles.hint}>Observe a sequência antes de iniciar. A variação do personagem é visual e não altera a prescrição.</Text>
      <View style={styles.frames}>
        {demo.frames.map((frame) => (
          <View key={frame.order} style={styles.frame}>
            <Text style={styles.number}>{String(frame.order).padStart(2,'0')}</Text>
            <ExerciseAvatar variant={variant} exercise={exercise} active={false} compact phaseKey={frame.phase} />
            <Text style={styles.label}>{frame.label}</Text>
            <Text style={styles.text}>{frame.instruction}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ marginVertical:spacing.md, padding:spacing.md, backgroundColor:colors.surfaceAlt, borderRadius:radius.md },
  header:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap:spacing.sm, flexWrap:'wrap' },
  eyebrow:{ ...typography.caption, fontWeight:'900', color:colors.primaryDark, letterSpacing:.6 },
  badge:{ ...typography.caption, fontSize:10, fontWeight:'800', color:colors.textMuted },
  hint:{ ...typography.caption, lineHeight:18, marginTop:spacing.xs },
  frames:{ flexDirection:'row', flexWrap:'wrap', gap:spacing.sm, marginTop:spacing.md },
  frame:{ flexGrow:1, flexBasis:150, minWidth:140, padding:spacing.sm, backgroundColor:colors.surface, borderRadius:radius.sm },
  number:{ ...typography.caption, fontWeight:'900', color:colors.primaryDark },
  label:{ ...typography.body, fontWeight:'800', marginTop:spacing.xs },
  text:{ ...typography.caption, lineHeight:17, marginTop:3 },
});
