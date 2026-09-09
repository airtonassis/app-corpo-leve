import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { ExerciseDefinition } from '../types/program';

type Props = {
  exercise: ExerciseDefinition;
  compact?: boolean;
};

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.itemRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ExerciseInstructionPanel({ exercise, compact = false }: Props) {
  const guide = exercise.instructionGuide;
  if (!guide) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>COMO FAZER</Text>
        {exercise.instructions.map((instruction) => (
          <Text key={instruction} style={styles.fallback}>• {instruction}</Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>ANTES DE COMEÇAR</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaLabel}>POSIÇÃO</Text>
          <Text style={styles.metaValue}>{guide.startPositionLabel}</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaLabel}>APOIO</Text>
          <Text style={styles.metaValue}>{guide.supportLabel}</Text>
        </View>
      </View>

      <Section title="1 · Prepare a posição" items={guide.preparation} />
      {!compact ? <Section title="2 · Faça o movimento" items={guide.execution} /> : null}
      {!compact ? <Section title="3 · Retorne com controle" items={guide.returnInstructions} /> : null}
      {!compact ? <Section title="Respiração" items={guide.breathing} /> : null}
      <Section title="Observe durante o exercício" items={guide.attentionPoints} />
      {!compact ? <Section title="Antes de iniciar, confira" items={guide.environmentCheck} /> : null}

      <View style={styles.reviewBox}>
        <Text style={styles.reviewTitle}>CONTEÚDO TÉCNICO EM REVISÃO</Text>
        <Text style={styles.reviewText}>
          Esta orientação faz parte da versão de desenvolvimento do Corpo Leve e ainda será revisada por Profissional de Educação Física antes da versão de produção.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: '#101820', borderWidth: 1, borderColor: '#293742' },
  eyebrow: { ...typography.caption, color: colors.primary, fontWeight: '900', letterSpacing: 0.7 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  metaChip: { flexGrow: 1, minWidth: 130, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#17222C' },
  metaLabel: { ...typography.caption, color: '#8E9AA6', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  metaValue: { ...typography.body, color: '#FFFFFF', fontWeight: '800', marginTop: 3 },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.body, color: '#FFFFFF', fontWeight: '900', marginBottom: 5 },
  itemRow: { flexDirection: 'row', gap: 7, alignItems: 'flex-start', marginTop: 4 },
  bullet: { color: colors.primary, fontWeight: '900', lineHeight: 20 },
  itemText: { ...typography.bodyMuted, color: '#D6DEE6', lineHeight: 20, flex: 1 },
  fallback: { ...typography.bodyMuted, color: '#D6DEE6', marginTop: spacing.xs, lineHeight: 20 },
  reviewBox: { marginTop: spacing.md, padding: spacing.sm, borderRadius: radius.md, backgroundColor: '#15191D', borderWidth: 1, borderColor: '#383C42' },
  reviewTitle: { ...typography.caption, color: '#F2C66D', fontWeight: '900', letterSpacing: 0.4 },
  reviewText: { ...typography.caption, color: '#AEB8C1', lineHeight: 17, marginTop: 4 },
});
