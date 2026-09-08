import React, { useEffect, useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { TREINO_A } from '../../src/constants/data';
import { ExercicioItem } from '../../src/components/ExercicioItem';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useResponsive } from '../../src/hooks/useResponsive';
import { colors, spacing, typography, radius } from '../../src/constants/theme';

// Mapa simples de treinos disponíveis. Para adicionar Treino B, C etc.,
// basta criar o objeto em `constants/data.ts` e registrar aqui.
const TREINOS_POR_ID: Record<string, typeof TREINO_A> = {
  'treino-a': TREINO_A,
};

export default function TreinoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    exerciciosConcluidos,
    toggleExercicio,
    finalizarTreino,
    iniciarExecucaoTreino,
    marcarInicioExercicio,
    marcarFimExercicio,
    ultimaMensagemMotivacional,
  } = useApp();
  const { maxContentWidth, scale } = useResponsive();

  const treino = TREINOS_POR_ID[id ?? 'treino-a'] ?? TREINO_A;
  const concluidosDoTreino = exerciciosConcluidos[treino.id] ?? [];

  // Melhoria 2: registra automaticamente o início do treino ao abrir a tela
  useEffect(() => {
    iniciarExecucaoTreino(treino.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treino.id]);

  const progresso = useMemo(() => {
    if (treino.exercicios.length === 0) return 0;
    return concluidosDoTreino.length / treino.exercicios.length;
  }, [concluidosDoTreino, treino.exercicios.length]);

  function handleToggleExercicio(exercicioId: string) {
    const jaConcluido = concluidosDoTreino.includes(exercicioId);
    // Melhoria 2: marca hora de início na primeira marcação e hora de fim
    // quando o exercício é concluído (interação de data/hora por exercício).
    if (!jaConcluido) {
      marcarInicioExercicio(treino.id, exercicioId);
      marcarFimExercicio(treino.id, exercicioId);
    }
    toggleExercicio(treino.id, exercicioId);
  }

  function handleFinalizar() {
    finalizarTreino(treino.id);
    Alert.alert(
      'Treino concluído! 💪',
      ultimaMensagemMotivacional ?? 'Parabéns por mais um passo na sua jornada de força.',
      [{ text: 'Continuar', onPress: () => router.back() }]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Melhoria 5: largura máxima em telas grandes/tablets */}
      <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
        <Text style={[typography.h1, { fontSize: typography.h1.fontSize * scale }]}>
          {treino.nome}
        </Text>
        <Text style={styles.subtitle}>
          {concluidosDoTreino.length} de {treino.exercicios.length} exercícios concluídos
        </Text>

        {/* Barra de progresso */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progresso * 100}%` }]} />
        </View>

        <View style={styles.lista}>
          {treino.exercicios.map((exercicio) => (
            <ExercicioItem
              key={exercicio.id}
              exercicio={exercicio}
              concluido={concluidosDoTreino.includes(exercicio.id)}
              onToggle={handleToggleExercicio}
            />
          ))}
        </View>

        <PrimaryButton
          label="Finalizar Treino"
          onPress={handleFinalizar}
          style={styles.finalizarButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  lista: {
    marginBottom: spacing.lg,
  },
  finalizarButton: {
    marginTop: spacing.sm,
  },
});
