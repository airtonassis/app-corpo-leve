import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, typography, radius, shadow } from '../../src/constants/theme';
import { loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { loadProgramExecutions } from '../../src/services/workout/executionStorage';
import { buildJourneyProgramState } from '../../src/services/program/journeyProgramEngine';
import { generateProgramForCycle } from '../../src/services/program/programResolver';
import { refreshLongitudinalJourneyMemory } from '../../src/services/journey/journeyMemoryStorage';
import { loadContinuousJourneyState } from '../../src/services/journey/continuousJourneyStorage';
import { JourneyProgramState, ProgramDefinition } from '../../src/types/program';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<JourneyProgramState | null>(null);
  const [program, setProgram] = useState<ProgramDefinition | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    Promise.all([
      loadAssessmentResult(),
      loadProgramExecutions(),
      refreshLongitudinalJourneyMemory(),
      loadContinuousJourneyState(),
    ])
      .then(([assessment, executions, memory, continuousState]) => {
        const state = buildJourneyProgramState(executions);
        setJourney(state);
        setHasAssessment(!!assessment);
        if (assessment) {
          setProgram(generateProgramForCycle(assessment.profile, state.currentCycle, memory, continuousState));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentProgress = useMemo(
    () => journey?.cycles.find((item) => item.current),
    [journey],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.welcomeBox}>
        <Text style={styles.eyebrow}>CORPO LEVE</Text>
        <Text style={typography.h1}>Movimento que encontra espaço na sua rotina.</Text>
        <Text style={styles.welcomeSubtitle}>
          Começar, adaptar e retornar fazem parte da mesma jornada.
        </Text>
      </View>

      {!hasAssessment ? (
        <View style={[styles.heroCard, shadow.card]}>
          <Text style={styles.cardEyebrow}>PRIMEIRO PASSO</Text>
          <Text style={styles.heroTitle}>Conheça seu ponto de partida.</Text>
          <Text style={styles.heroText}>
            O quiz ajuda o Corpo Leve a organizar a primeira etapa sem comparar você com outras pessoas.
          </Text>
          <PrimaryButton
            label="Fazer avaliação inicial"
            onPress={() => router.push('/perfil/quiz')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      ) : currentProgress ? (
        <View style={[styles.heroCard, shadow.card]}>
          <Text style={styles.cardEyebrow}>CICLO {currentProgress.definition.cycle}</Text>
          <Text style={styles.heroTitle}>{currentProgress.definition.name}</Text>
          <Text style={styles.heroQuote}>{currentProgress.definition.userMessage}</Text>
          <Text style={styles.heroText}>{currentProgress.definition.purpose}</Text>

          {currentProgress.definition.durationDays ? (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${currentProgress.completionRate}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentProgress.completedDays}/{currentProgress.definition.durationDays} dias registrados
              </Text>
            </>
          ) : null}

          {currentProgress.definition.key === 'continua' ? (
            <PrimaryButton
              label="Abrir Jornada Contínua"
              onPress={() => router.push('/jornada/continua')}
              style={{ marginTop: spacing.md }}
            />
          ) : program ? (
            <PrimaryButton
              label="Ir para atividade do ciclo"
              onPress={() => {
                const nextDay = Math.min(
                  (currentProgress.completedDays || 0) + 1,
                  program.durationDays,
                );
                router.push(`/programa/dia/${Math.max(1, nextDay)}?cycle=${journey.currentCycle}`);
              }}
              style={{ marginTop: spacing.md }}
            />
          ) : (
            <View style={styles.architectureNote}>
              <Text style={styles.architectureTitle}>Próxima etapa modelada</Text>
              <Text style={styles.architectureText}>
                A jornada já reconhece este ciclo, mas o gerador específico de sessões ainda será construído antes de liberar sua execução.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Sua jornada</Text>
      <Text style={styles.sectionSubtitle}>
        Os ciclos organizam a experiência; eles não são prazos biológicos para “formar um hábito”.
      </Text>

      {journey?.cycles.map((item) => (
        <View
          key={item.definition.key}
          style={[
            styles.cycleCard,
            item.current && styles.cycleCardCurrent,
            !item.unlocked && styles.cycleCardLocked,
          ]}
        >
          <View style={styles.cycleHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cycleEyebrow}>
                {item.definition.key === 'continua' ? 'APÓS OS CICLOS' : `CICLO ${item.definition.cycle}`}
              </Text>
              <Text style={styles.cycleTitle}>{item.definition.name}</Text>
            </View>
            <Text style={styles.cycleStatus}>
              {item.completed ? 'Concluído' : item.current ? 'Atual' : item.unlocked ? 'Disponível' : 'Depois'}
            </Text>
          </View>
          <Text style={styles.cycleMessage}>{item.definition.userMessage}</Text>
          {item.definition.durationDays ? (
            <Text style={styles.cycleMeta}>
              {item.definition.durationDays} dias de estrutura · {item.completedDays} registrados
            </Text>
          ) : (
            <Text style={styles.cycleMeta}>Continuidade sem prazo fixo</Text>
          )}
        </View>
      ))}

      <PrimaryButton
        label="Ver Minha Jornada"
        onPress={() => router.push('/(tabs)/jornada')}
        variant="outline"
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  welcomeBox: { marginBottom: spacing.lg },
  eyebrow: { ...typography.caption, color: colors.primaryDark, letterSpacing: 2, marginBottom: spacing.xs, fontWeight: '900' },
  welcomeSubtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  cardEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.9 },
  heroTitle: { ...typography.h2, marginTop: spacing.xs },
  heroQuote: { ...typography.body, color: colors.primaryDark, fontWeight: '800', marginTop: spacing.xs },
  heroText: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, marginTop: spacing.sm },
  progressTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginTop: spacing.md },
  progressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
  progressText: { ...typography.caption, marginTop: spacing.xs },
  architectureNote: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  architectureTitle: { ...typography.body, fontWeight: '800', color: colors.primaryDark },
  architectureText: { ...typography.caption, color: colors.text, lineHeight: 18, marginTop: 4 },
  sectionTitle: { ...typography.h2, marginBottom: spacing.xs },
  sectionSubtitle: { ...typography.bodyMuted, lineHeight: 20, marginBottom: spacing.md },
  cycleCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cycleCardCurrent: { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight },
  cycleCardLocked: { opacity: 0.58 },
  cycleHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  cycleEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.6 },
  cycleTitle: { ...typography.h3, marginTop: 2 },
  cycleStatus: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },
  cycleMessage: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: spacing.sm },
  cycleMeta: { ...typography.caption, marginTop: spacing.xs },
});
