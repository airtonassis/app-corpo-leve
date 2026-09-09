import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { StoredAssessmentResult, loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { generateCycle1Program } from '../../src/services/program/cycle1Engine';
import { exerciseById } from '../../src/data/exercises/calisthenics';

export default function AssessmentResultScreen() {
  const [result, setResult] = useState<StoredAssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessmentResult()
      .then(setResult)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.center}>
        <Text style={typography.h2}>Ainda não há uma avaliação concluída.</Text>
        <PrimaryButton label="Fazer avaliação" onPress={() => router.replace('/perfil/quiz')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const { profile, recommendation } = result;
  const cycle1 = generateCycle1Program(profile);
  const firstDay = cycle1.days[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>AVALIAÇÃO CONCLUÍDA</Text>
      <Text style={typography.h1}>Seu perfil está pronto</Text>
      <Text style={styles.subtitle}>
        Este resumo usa suas respostas para definir o ponto de partida do programa. Ele não é diagnóstico médico nem uma nota sobre seu corpo.
      </Text>

      <View style={[styles.heroCard, shadow.card]}>
        <Text style={styles.heroLabel}>Programa recomendado</Text>
        <Text style={styles.heroTitle}>{recommendation.title}</Text>
        <Text style={styles.heroText}>Primeiro ciclo da sua jornada: Dias 1–21.</Text>
      </View>

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.sectionTitle}>Seu ponto de partida</Text>
        <Metric label="Objetivo" value={objectiveLabel(profile.objetivoPrincipal)} />
        <Metric label="Nível calculado" value={levelLabel(profile.nivelCalculado)} />
        <Metric label="Tempo por sessão" value={profile.disponibilidadeMinutos ? `≈ ${profile.disponibilidadeMinutos} min` : 'Adaptável'} />
        <Metric label="Frequência" value={profile.frequenciaSemanal ? `${profile.frequenciaSemanal} dias/semana` : 'Adaptável'} />
      </View>

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.sectionTitle}>Indicadores para acompanhar</Text>
        <Score label="Força" value={profile.scoreForca} />
        <Score label="Condicionamento" value={profile.scoreCondicionamento} />
        <Score label="Recuperação" value={profile.scoreRecuperacao} />
        <Score label="Energia" value={profile.scoreEnergia} />
        <Score label="Consistência" value={profile.scoreConsistencia} />
        <Text style={styles.note}>Os indicadores servem para comparar sua própria evolução entre ciclos, não para comparação com outras pessoas.</Text>
      </View>

      {profile.pontosAtencao.length > 0 && (
        <View style={[styles.card, styles.cautionCard]}>
          <Text style={styles.sectionTitle}>Pontos de atenção</Text>
          <Text style={styles.cautionText}>
            Algumas respostas indicam que o programa deve priorizar adaptações e progressão conservadora. O app não deve usar essas respostas para ultrapassar limitações informadas.
          </Text>
        </View>
      )}

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.sectionTitle}>Prévia do Dia 1</Text>
        <Text style={styles.metricValue}>{firstDay.focus} · ≈ {firstDay.estimatedMinutes} min</Text>
        {firstDay.exercises.map((item) => (
          <View key={item.exerciseId} style={styles.metricRow}>
            <Text style={styles.metricLabel}>{exerciseById[item.exerciseId]?.name ?? item.exerciseId}</Text>
            <Text style={styles.metricValue}>{item.reps ? `${item.sets}×${item.reps}` : `${item.sets}×${item.seconds ?? 0}s`}</Text>
          </View>
        ))}
        <Text style={styles.note}>{firstDay.disciplineMessage}</Text>
      </View>

      <View style={[styles.nextCard, shadow.card]}>
        <Text style={styles.nextLabel}>SUA JORNADA</Text>
        <Text style={styles.nextTitle}>21 → 42 → 63 dias</Text>
        <Text style={styles.nextText}>
          Ao concluir cada ciclo, uma nova avaliação curta poderá comparar seus indicadores e preparar a recomendação do próximo programa.
        </Text>
      </View>

      <PrimaryButton label="Começar meu Ciclo 1" onPress={() => router.push('/programa/dia/1')} style={{ marginTop: spacing.lg }} />
      <PrimaryButton label="Ir para o início" variant="outline" onPress={() => router.replace('/(tabs)')} style={{ marginTop: spacing.sm }} />
      <PrimaryButton label="Revisar meu perfil" variant="outline" onPress={() => router.replace('/perfil/quiz')} style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Score({ label, value }: { label: string; value?: number }) {
  const score = Math.max(0, Math.min(100, value ?? 0));
  return (
    <View style={styles.scoreBlock}>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{score}/100</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${score}%` }]} /></View>
    </View>
  );
}

function objectiveLabel(value?: string): string {
  const labels: Record<string, string> = {
    forca: 'Desenvolver força',
    condicionamento: 'Melhorar condicionamento',
    mobilidade: 'Mobilidade e movimento',
    consistencia: 'Criar consistência',
    bem_estar: 'Disposição e bem-estar',
  };
  return value ? labels[value] ?? value : 'Consistência';
}

function levelLabel(value: string): string {
  const labels: Record<string, string> = {
    iniciante: 'Iniciante',
    base: 'Base',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  };
  return labels[value] ?? value;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  eyebrow: { ...typography.caption, fontWeight: '800', color: colors.primaryDark, letterSpacing: 1, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  heroCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  heroLabel: { ...typography.caption, color: colors.textInverse, fontWeight: '800', opacity: 0.9 },
  heroTitle: { ...typography.h2, color: colors.textInverse, marginTop: spacing.xs },
  heroText: { ...typography.body, color: colors.textInverse, marginTop: spacing.sm, opacity: 0.92 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.sm },
  metricLabel: { ...typography.bodyMuted, flex: 1 },
  metricValue: { ...typography.body, fontWeight: '700', textAlign: 'right', flex: 1 },
  scoreBlock: { marginBottom: spacing.sm },
  track: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  note: { ...typography.caption, lineHeight: 18, marginTop: spacing.sm },
  cautionCard: { borderWidth: 1, borderColor: colors.accent },
  cautionText: { ...typography.bodyMuted, lineHeight: 21 },
  nextCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg },
  nextLabel: { ...typography.caption, color: colors.primaryDark, fontWeight: '800', letterSpacing: 0.8 },
  nextTitle: { ...typography.h2, color: colors.primaryDark, marginTop: spacing.xs },
  nextText: { ...typography.body, lineHeight: 23, marginTop: spacing.sm },
});
