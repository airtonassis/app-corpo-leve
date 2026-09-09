import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { loadAssessmentResult } from '../../src/services/storage/assessmentStorage';
import { loadProgramExecutions } from '../../src/services/workout/executionStorage';
import { refreshLongitudinalJourneyMemory } from '../../src/services/journey/journeyMemoryStorage';
import {
  loadContinuousJourneyState,
  updateContinuousJourneyFocus,
} from '../../src/services/journey/continuousJourneyStorage';
import { generateContinuousJourneyBlock } from '../../src/services/program/continuousJourneyEngine';
import {
  ContinuousJourneyFocus,
  ContinuousJourneyState,
  LongitudinalJourneyMemory,
  ProgramDefinition,
} from '../../src/types/program';
import { AssessmentProfile } from '../../src/types/assessment';

const FOCUS: Array<{ key: ContinuousJourneyFocus; label: string; description: string }> = [
  { key: 'manter', label: 'Manter minha prática', description: 'Continuar com equilíbrio usando minha referência atual.' },
  { key: 'forca', label: 'Explorar força', description: 'Dar mais espaço a práticas de força sem obrigação de aumentar volume.' },
  { key: 'condicionamento', label: 'Explorar condicionamento', description: 'Dar mais espaço a práticas de condicionamento compatíveis.' },
  { key: 'mobilidade', label: 'Explorar mobilidade', description: 'Priorizar mobilidade, controle e movimento.' },
  { key: 'bem_estar', label: 'Movimento e bem-estar', description: 'Manter uma prática leve, funcional e sustentável.' },
];

export default function ContinuousJourneyScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AssessmentProfile | null>(null);
  const [memory, setMemory] = useState<LongitudinalJourneyMemory | null>(null);
  const [state, setState] = useState<ContinuousJourneyState | null>(null);
  const [program, setProgram] = useState<ProgramDefinition | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  async function reload(nextState?: ContinuousJourneyState) {
    const [assessment, journeyMemory, continuousState, executions] = await Promise.all([
      loadAssessmentResult(),
      refreshLongitudinalJourneyMemory(),
      nextState ? Promise.resolve(nextState) : loadContinuousJourneyState(),
      loadProgramExecutions(),
    ]);

    if (!assessment) return;
    const block = generateContinuousJourneyBlock(assessment.profile, journeyMemory, continuousState);
    const done = executions
      .filter((item) => item.programId === block.id && !!item.completedAt)
      .map((item) => item.day);

    setProfile(assessment.profile);
    setMemory(journeyMemory);
    setState(continuousState);
    setProgram(block);
    setCompletedDays([...new Set(done)].sort((a, b) => a - b));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const nextDay = useMemo(() => {
    if (!program) return 1;
    return program.days.find((item) => !completedDays.includes(item.day))?.day ?? program.durationDays;
  }, [program, completedDays]);

  async function chooseFocus(focus: ContinuousJourneyFocus) {
    const next = await updateContinuousJourneyFocus(focus);
    await reload(next);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryDark} /></View>;
  }

  if (!profile || !memory || !state || !program) {
    return (
      <View style={styles.center}>
        <Text style={typography.h2}>Não foi possível carregar a Jornada Contínua.</Text>
        <PrimaryButton label="Voltar" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>JORNADA CONTÍNUA</Text>
      <Text style={typography.h1}>Eu sei como continuar.</Text>
      <Text style={styles.subtitle}>
        Não existe prazo final aqui. Você escolhe o foco, o Corpo Leve usa sua memória para organizar opções coerentes e cada nova prática continua a mesma história.
      </Text>

      <View style={[styles.heroCard, shadow.card]}>
        <Text style={styles.cardEyebrow}>BLOCO ATUAL DE REGISTRO</Text>
        <Text style={styles.heroTitle}>Bloco {state.activeBlockIndex}</Text>
        <Text style={styles.heroText}>
          {completedDays.length}/14 práticas registradas neste bloco. O bloco serve para preservar identidade e histórico; não é um desafio de 14 dias.
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, completedDays.length / 14 * 100)}%` }]} />
        </View>
        <PrimaryButton
          label={completedDays.length >= 14 ? 'Renovar bloco' : 'Fazer próxima prática'}
          onPress={() => {
            if (completedDays.length >= 14) {
              router.push(`/programa/dia/14?cycle=5&block=${state.activeBlockIndex}`);
            } else {
              router.push(`/programa/dia/${nextDay}?cycle=5&block=${state.activeBlockIndex}`);
            }
          }}
          style={{ marginTop: spacing.md }}
        />
      </View>

      <Text style={styles.sectionTitle}>O que quero priorizar agora</Text>
      <Text style={styles.sectionSubtitle}>
        Mudar o foco reorganiza as próximas práticas; não apaga o que você construiu nem redefine sua capacidade do zero.
      </Text>

      {FOCUS.map((item) => {
        const selected = state.focus === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => chooseFocus(item.key)}
            style={({ pressed }) => [
              styles.focusCard,
              selected && styles.focusCardSelected,
              pressed && { opacity: 0.78 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.focusTitle, selected && styles.focusTitleSelected]}>{item.label}</Text>
              <Text style={styles.focusText}>{item.description}</Text>
            </View>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={selected ? colors.primaryDark : colors.textMuted}
            />
          </Pressable>
        );
      })}

      <View style={[styles.memoryCard, shadow.card]}>
        <Text style={styles.cardEyebrow}>SUA MEMÓRIA CONTINUA ATIVA</Text>
        <Text style={styles.memoryTitle}>{memory.totalCompletedSessions} sessões planejadas acumuladas</Text>
        <Text style={styles.memoryText}>
          {memory.families.length} famílias com referências registradas · {memory.movement.freeAssistedSessions} práticas no Modo Livre Assistido · {memory.movement.complementaryActivities} atividades complementares.
        </Text>
        {memory.availability.preferredWindowMinutes ? (
          <Text style={styles.memoryInsight}>
            Sua janela de tempo mais frequente continua sendo {memory.availability.preferredWindowMinutes} min.
          </Text>
        ) : null}
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleTitle}>Como funciona daqui para frente</Text>
        <Text style={styles.ruleText}>• Blocos são renovados sem prazo final.</Text>
        <Text style={styles.ruleText}>• Cada bloco recebe um ID próprio para nunca sobrescrever o histórico anterior.</Text>
        <Text style={styles.ruleText}>• Você pode mudar o foco sem perder referências funcionais.</Text>
        <Text style={styles.ruleText}>• Sessões curtas, retomadas e recuperação continuam válidas.</Text>
        <Text style={styles.ruleText}>• O app não declara “hábito formado” por contagem de dias.</Text>
      </View>

      <PrimaryButton label="Ver Minha Jornada" variant="outline" onPress={() => router.push('/(tabs)/jornada')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  eyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 1.4, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  cardEyebrow: { ...typography.caption, color: colors.primaryDark, fontWeight: '900', letterSpacing: 0.8 },
  heroTitle: { ...typography.h2, marginTop: spacing.xs },
  heroText: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, marginTop: spacing.sm },
  progressTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginTop: spacing.md },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  sectionTitle: { ...typography.h2, marginBottom: spacing.xs },
  sectionSubtitle: { ...typography.bodyMuted, lineHeight: 20, marginBottom: spacing.md },
  focusCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  focusCardSelected: { borderColor: colors.primaryDark, backgroundColor: colors.primaryLight },
  focusTitle: { ...typography.body, fontWeight: '800', color: colors.text },
  focusTitleSelected: { color: colors.primaryDark },
  focusText: { ...typography.caption, color: colors.textMuted, lineHeight: 18, marginTop: 3 },
  memoryCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.md },
  memoryTitle: { ...typography.h3, marginTop: spacing.xs },
  memoryText: { ...typography.bodyMuted, color: colors.text, lineHeight: 20, marginTop: spacing.sm },
  memoryInsight: { ...typography.body, color: colors.primaryDark, fontWeight: '800', marginTop: spacing.md },
  ruleCard: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  ruleTitle: { ...typography.h3, color: colors.primaryDark, marginBottom: spacing.sm },
  ruleText: { ...typography.bodyMuted, color: colors.text, lineHeight: 21, marginTop: 4 },
});
