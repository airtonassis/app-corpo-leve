import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { QuizProgress } from '../../src/components/quiz/QuizProgress';
import { QuizQuestionCard } from '../../src/components/quiz/QuizQuestionCard';
import { colors, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { QuizAnswerMap, QuizAnswerValue, QuizQuestion, QuizSession } from '../../src/types/quiz';
import {
  canCompleteQuiz,
  getEligibleQuestions,
  getNextQuestion,
  isQuestionEligible,
} from '../../src/services/assessment/quizEngine';
import { buildAssessmentProfile } from '../../src/services/assessment/profileEngine';
import { recommendInitialProgram } from '../../src/services/assessment/recommendationEngine';
import {
  clearAssessmentSession,
  loadAssessmentSession,
  saveAssessmentResult,
  saveAssessmentSession,
} from '../../src/services/storage/assessmentStorage';

const TARGET_MIN = 20;
const TARGET_MAX = 35;

function createSession(): QuizSession {
  return {
    id: `assessment-${Date.now()}`,
    startedAt: new Date().toISOString(),
    answers: {},
    askedQuestionIds: [],
  };
}

export default function QuizPerfilScreen() {
  const { perfil, salvarPerfil } = useApp();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<QuizSession>(() => createSession());
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState(perfil?.nome ?? '');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Regra de produto: avaliações incompletas não são retomadas.
    // Ao entrar novamente no questionário, qualquer rascunho parcial é descartado
    // e uma nova sessão começa desde a primeira pergunta. Apenas o resultado de
    // uma avaliação finalizada é considerado válido pelo restante do aplicativo.
    loadAssessmentSession()
      .then(async (stored) => {
        if (!mounted) return;

        if (stored && !stored.completedAt) {
          await clearAssessmentSession();
        }

        if (!mounted) return;
        const fresh = createSession();
        setSession(fresh);
        setDisplayName(perfil?.nome ?? '');
        setHistory([]);
        setCurrentQuestionId(null);
        setStarted(false);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [perfil?.nome]);

  const currentQuestion = useMemo<QuizQuestion | undefined>(() => {
    if (!currentQuestionId) return undefined;
    return getEligibleQuestions(session.answers).find((question) => question.id === currentQuestionId);
  }, [currentQuestionId, session.answers]);

  const answeredCount = Object.values(session.answers).filter(hasValue).length;
  const estimatedTotal = Math.min(TARGET_MAX, Math.max(TARGET_MIN, getEligibleQuestions(session.answers).filter((q) => q.required || q.priority <= 4).length));

  function persist(next: QuizSession) {
    setSession(next);
    saveAssessmentSession(next).catch(() => {
      // Persistência não deve bloquear o questionário.
    });
  }

  function startQuiz() {
    if (!displayName.trim()) {
      Alert.alert('Como podemos te chamar?', 'Informe um nome ou apelido para personalizar sua jornada.');
      return;
    }
    const next = { ...session, displayName: displayName.trim() };
    persist(next);
    const first = getNextQuestion(next.answers, next.askedQuestionIds);
    if (!first) return;
    setHistory([first.id]);
    setCurrentQuestionId(first.id);
    persist({ ...next, askedQuestionIds: [first.id] });
    setStarted(true);
  }

  function updateAnswer(value: QuizAnswerValue) {
    if (!currentQuestion) return;
    const rawAnswers: QuizAnswerMap = { ...session.answers, [currentQuestion.id]: value };

    // Remove respostas de ramos que deixaram de ser elegíveis quando o usuário volta e muda algo.
    const validIds = new Set(
      getEligibleQuestions(rawAnswers)
        .filter((question) => isQuestionEligible(question, rawAnswers))
        .map((question) => question.id)
    );
    const prunedAnswers: QuizAnswerMap = {};
    Object.entries(rawAnswers).forEach(([id, answer]) => {
      if (validIds.has(id) || id === currentQuestion.id) prunedAnswers[id] = answer;
    });

    persist({ ...session, displayName: displayName.trim(), answers: prunedAnswers });
  }

  function validateCurrent(): boolean {
    if (!currentQuestion) return false;
    const value = session.answers[currentQuestion.id];
    if (!currentQuestion.required || hasValue(value)) {
      if (currentQuestion.type === 'number' && hasValue(value)) {
        const numberValue = Number(value);
        if (currentQuestion.min !== undefined && numberValue < currentQuestion.min) {
          Alert.alert('Confira sua resposta', `O valor mínimo esperado é ${currentQuestion.min}${currentQuestion.unit ? ` ${currentQuestion.unit}` : ''}.`);
          return false;
        }
        if (currentQuestion.max !== undefined && numberValue > currentQuestion.max) {
          Alert.alert('Confira sua resposta', `O valor máximo esperado é ${currentQuestion.max}${currentQuestion.unit ? ` ${currentQuestion.unit}` : ''}.`);
          return false;
        }
      }
      return true;
    }
    Alert.alert('Resposta necessária', 'Responda esta pergunta para continuar.');
    return false;
  }

  async function nextQuestion() {
    if (!validateCurrent() || !currentQuestion) return;

    const asked = Array.from(new Set([...session.askedQuestionIds, currentQuestion.id]));
    const next = getNextQuestion(session.answers, asked);

    // O fluxo adaptativo encerra quando não há mais perguntas relevantes ou quando
    // já há informação suficiente e todas as obrigatórias foram respondidas.
    const enoughAnswers = answeredCount >= TARGET_MIN && canCompleteQuiz(session.answers);
    const shouldFinish = !next || (enoughAnswers && next.priority >= 7);

    if (shouldFinish) {
      await finishQuiz();
      return;
    }

    const nextHistory = [...history.filter((id) => id !== next.id), next.id];
    setHistory(nextHistory);
    setCurrentQuestionId(next.id);
    persist({ ...session, askedQuestionIds: Array.from(new Set([...asked, next.id])) });
  }

  function previousQuestion() {
    if (history.length <= 1) return;
    const nextHistory = history.slice(0, -1);
    const previous = nextHistory[nextHistory.length - 1];
    setHistory(nextHistory);
    setCurrentQuestionId(previous);
  }

  async function finishQuiz() {
    if (!canCompleteQuiz(session.answers)) {
      const pending = getEligibleQuestions(session.answers).find(
        (question) => question.required && !hasValue(session.answers[question.id])
      );
      if (pending) {
        setCurrentQuestionId(pending.id);
        setHistory((prev) => [...prev.filter((id) => id !== pending.id), pending.id]);
        Alert.alert('Falta só um pouco', 'Ainda temos uma pergunta essencial para completar seu perfil.');
      }
      return;
    }

    const profile = buildAssessmentProfile(session.answers);
    const recommendation = recommendInitialProgram(profile);
    const completedAt = new Date().toISOString();

    await saveAssessmentResult({
      answers: session.answers,
      profile,
      recommendation,
      completedAt,
    });

    const age = toNumber(session.answers.PERF_001);
    const weight = toNumber(session.answers.PERF_003);
    const height = toNumber(session.answers.PERF_002);

    salvarPerfil({
      nome: displayName.trim() || session.displayName || 'Usuário',
      idade: age ?? 0,
      pesoKg: weight,
      alturaCm: height,
      nivelExperiencia:
        profile.nivelCalculado === 'avancado'
          ? 'avancada'
          : profile.nivelCalculado === 'intermediario'
            ? 'intermediaria'
            : 'iniciante',
      objetivo: objectiveLabel(profile.objetivoPrincipal),
      quizConcluido: true,
      atualizadoEm: completedAt,
    });

    await clearAssessmentSession();
    router.replace('/perfil/resultado');
  }

  async function restartQuiz() {
    await clearAssessmentSession();
    const fresh = createSession();
    setSession(fresh);
    setHistory([]);
    setCurrentQuestionId(null);
    setStarted(false);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparando sua avaliação...</Text>
      </View>
    );
  }

  if (!started) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={typography.h1}>Avaliação Adaptativa</Text>
          <Text style={styles.subtitle}>
            O Corpo Leve escolhe as próximas perguntas conforme suas respostas. O objetivo é entender seu ponto de partida, rotina e expectativa sem fazer perguntas desnecessárias.
          </Text>

          <View style={[styles.introCard, shadow.card]}>
            <Text style={styles.introTitle}>Como podemos te chamar?</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nome ou apelido"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
              autoCapitalize="words"
            />
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Como funciona</Text>
              <Text style={styles.infoText}>• banco com 90 perguntas;</Text>
              <Text style={styles.infoText}>• você responde apenas as relevantes ao seu perfil;</Text>
              <Text style={styles.infoText}>• em geral, cerca de 20 a 35 perguntas;</Text>
              <Text style={styles.infoText}>• você pode voltar e corrigir respostas;</Text>
              <Text style={styles.infoText}>• respostas opcionais podem ser ignoradas.</Text>
            </View>
            <PrimaryButton label="Começar avaliação" onPress={startQuiz} style={{ marginTop: spacing.md }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.loading}>
        <Text style={typography.h2}>Perfil pronto para finalizar</Text>
        <PrimaryButton label="Ver meu resultado" onPress={finishQuiz} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <QuizProgress current={Math.max(answeredCount + 1, 1)} estimatedTotal={estimatedTotal} />

        <View style={{ marginTop: spacing.lg }}>
          <QuizQuestionCard
            question={currentQuestion}
            value={session.answers[currentQuestion.id]}
            onChange={updateAnswer}
          />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={previousQuestion} disabled={history.length <= 1} style={[styles.backButton, history.length <= 1 && styles.disabled]}>
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <View style={styles.nextWrap}>
            <PrimaryButton label="Continuar" onPress={nextQuestion} />
          </View>
        </View>

        {!currentQuestion.required && (
          <Pressable onPress={nextQuestion} style={styles.skipButton}>
            <Text style={styles.skipText}>Prefiro não responder agora</Text>
          </Pressable>
        )}

        <Pressable onPress={restartQuiz} style={styles.restartButton}>
          <Text style={styles.restartText}>Recomeçar avaliação</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function hasValue(value: QuizAnswerValue | undefined): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function toNumber(value: QuizAnswerValue | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function objectiveLabel(value?: string): string {
  const labels: Record<string, string> = {
    forca: 'Desenvolver força',
    condicionamento: 'Melhorar condicionamento',
    mobilidade: 'Melhorar mobilidade',
    consistencia: 'Criar consistência',
    bem_estar: 'Mais disposição e bem-estar',
  };
  return value ? labels[value] ?? value : 'Criar consistência';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...typography.bodyMuted, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.lg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  loadingText: { ...typography.bodyMuted, marginTop: spacing.md },
  introCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  introTitle: { ...typography.h3 },
  nameInput: { minHeight: 54, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, ...typography.body, marginTop: spacing.sm },
  infoBox: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg, gap: spacing.xs },
  infoTitle: { ...typography.body, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.xs },
  infoText: { ...typography.bodyMuted, color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  backButton: { minHeight: 52, minWidth: 96, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  backText: { ...typography.body, fontWeight: '700' },
  nextWrap: { flex: 1 },
  disabled: { opacity: 0.4 },
  skipButton: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: { ...typography.bodyMuted, textDecorationLine: 'underline' },
  restartButton: { alignItems: 'center', paddingVertical: spacing.lg },
  restartText: { ...typography.caption, color: colors.textMuted },
});
