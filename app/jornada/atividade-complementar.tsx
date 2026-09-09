import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { generateCycle1Program } from '../../src/services/program/cycle1Engine';
import { loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { upsertComplementaryActivity } from '../../src/services/journey/complementaryActivityStorage';
import { ComplementaryActivityType } from '../../src/types/program';

const ACTIVITIES: { type: ComplementaryActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'caminhada', label: 'Caminhada', icon: 'walk-outline' },
  { type: 'corrida', label: 'Corrida', icon: 'fitness-outline' },
  { type: 'bicicleta', label: 'Bicicleta', icon: 'bicycle-outline' },
  { type: 'natacao', label: 'Natação', icon: 'water-outline' },
  { type: 'outro', label: 'Outra', icon: 'add-outline' },
];

export default function ComplementaryActivityScreen() {
  const [loading, setLoading] = useState(true);
  const [programId, setProgramId] = useState<string | undefined>();
  const [activityType, setActivityType] = useState<ComplementaryActivityType>('caminhada');
  const [durationText, setDurationText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadAssessmentResult()
      .then((assessment) => {
        if (!assessment) return;
        setProgramId(generateCycle1Program(assessment.profile).id);
      })
      .finally(() => setLoading(false));
  }, []);

  const minutes = useMemo(() => {
    const parsed = Number(durationText.replace(/[^0-9]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [durationText]);

  const canSave = minutes > 0 && minutes <= 240;

  async function save() {
    if (!canSave) return;

    const completedAt = new Date();
    const startedAt = new Date(completedAt.getTime() - minutes * 60 * 1000);
    const id = `manual:${activityType}:${completedAt.getTime()}`;

    await upsertComplementaryActivity({
      id,
      programId,
      activityType,
      source: 'manual',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationSeconds: minutes * 60,
    });

    setSaved(true);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryDark} /></View>;
  }

  if (saved) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.successCard, shadow.card]}>
          <Ionicons name="checkmark-circle-outline" size={34} color={colors.primaryDark} />
          <Text style={styles.successTitle}>Atividade registrada</Text>
          <Text style={styles.successText}>
            Ela passa a fazer parte da sua jornada de movimento, mas não substitui a atividade planejada do Corpo Leve para hoje.
          </Text>
          <Pressable onPress={() => router.replace('/(tabs)/jornada')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Voltar para Minha Jornada</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      <Text style={styles.eyebrow}>ATIVIDADE COMPLEMENTAR</Text>
      <Text style={typography.h1}>O que você fez?</Text>
      <Text style={styles.subtitle}>
        Registre movimentos que aconteceram além da atividade planejada. Eles ajudam o Corpo Leve a compreender sua rotina sem alterar a conclusão do programa.
      </Text>

      <View style={styles.activityGrid}>
        {ACTIVITIES.map((item) => {
          const selected = item.type === activityType;
          return (
            <Pressable
              key={item.type}
              onPress={() => setActivityType(item.type)}
              style={[styles.activityOption, selected && styles.activityOptionSelected]}
            >
              <Ionicons name={item.icon} size={23} color={selected ? colors.primaryDark : colors.text} />
              <Text style={[styles.activityLabel, selected && styles.activityLabelSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.durationCard, shadow.card]}>
        <Text style={styles.fieldLabel}>Duração realizada</Text>
        <View style={styles.durationRow}>
          <TextInput
            value={durationText}
            onChangeText={setDurationText}
            keyboardType="number-pad"
            placeholder="Ex.: 30"
            placeholderTextColor={colors.textMuted}
            style={styles.durationInput}
            maxLength={3}
          />
          <Text style={styles.minuteLabel}>minutos</Text>
        </View>
        <Text style={styles.fieldHint}>
          Informe o que realmente realizou. Esta duração é um registro da jornada, não uma meta a ser superada.
        </Text>
      </View>

      <View style={styles.ruleCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primaryDark} />
        <Text style={styles.ruleText}>
          Caminhada, corrida, bicicleta, natação ou outra atividade complementar não concluem automaticamente a atividade planejada do dia.
        </Text>
      </View>

      <Pressable
        disabled={!canSave}
        onPress={save}
        style={[styles.primaryButton, !canSave && styles.primaryButtonDisabled]}
      >
        <Text style={styles.primaryButtonText}>Registrar na jornada</Text>
      </Pressable>

      {minutes > 240 ? (
        <Text style={styles.validationText}>
          Confira a duração informada antes de registrar.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg, alignSelf: 'flex-start' },
  backText: { ...typography.body, fontWeight: '700' },
  eyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 1.3, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  activityOption: { width: '31%', minWidth: 96, flexGrow: 1, alignItems: 'center', gap: 6, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  activityOptionSelected: { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight },
  activityLabel: { ...typography.caption, color: colors.text, fontWeight: '700', textAlign: 'center' },
  activityLabelSelected: { color: colors.primaryDark, fontWeight: '900' },
  durationCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  fieldLabel: { ...typography.body, fontWeight: '800' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  durationInput: { minWidth: 110, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 24, fontWeight: '800', color: colors.text },
  minuteLabel: { ...typography.bodyMuted, color: colors.text },
  fieldHint: { ...typography.caption, lineHeight: 18, marginTop: spacing.sm },
  ruleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primaryLight, marginTop: spacing.md },
  ruleText: { ...typography.bodyMuted, color: colors.text, flex: 1, lineHeight: 20 },
  primaryButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.md, marginTop: spacing.lg },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { ...typography.body, color: '#FFFFFF', fontWeight: '900' },
  validationText: { ...typography.caption, textAlign: 'center', marginTop: spacing.sm },
  successCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.xxl, alignItems: 'center' },
  successTitle: { ...typography.h2, marginTop: spacing.sm, textAlign: 'center' },
  successText: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm },
});
