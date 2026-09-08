import React, { useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { TREINO_A } from '../../src/constants/data';
import { ExercicioItem } from '../../src/components/ExercicioItem';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, typography, radius } from '../../src/constants/theme';

// Mapa simples de treinos disponíveis. Para adicionar Treino B, C etc.,
// basta criar o objeto em `constants/data.ts` e registrar aqui.
const TREINOS_POR_ID: Record<string, typeof TREINO_A> = {
  'treino-a': TREINO_A,
};

export default function TreinoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exerciciosConcluidos, toggleExercicio, finalizarTreino } = useApp();

  const treino = TREINOS_POR_ID[id ?? 'treino-a'] ?? TREINO_A;
  const concluidosDoTreino = exerciciosConcluidos[treino.id] ?? [];

  const progresso = useMemo(() => {
    if (treino.exercicios.length === 0) return 0;
    return concluidosDoTreino.length / treino.exercicios.length;
  }, [concluidosDoTreino, treino.exercicios.length]);

  function handleFinalizar() {
    finalizarTreino(treino.id);
    Alert.alert(
      'Treino concluído! 💪',
      'Parabéns por mais um passo na sua jornada de força.',
      [{ text: 'Continuar', onPress: () => router.back() }]
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={typography.h1}>{treino.nome}</Text>
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
            concluido={concludidoCheck(concluidosDoTreino, exercicio.id)}
            onToggle={(exercicioId) => toggleExercicio(treino.id, exercicioId)}
          />
        ))}
      </View>

      <PrimaryButton
        label="Finalizar Treino"
        onPress={handleFinalizar}
        style={styles.finalizarButton}
      />
    </ScrollView>
  );
}

// Pequeno helper para deixar a leitura do JSX mais limpa
function concludidoCheck(lista: string[], id: string) {
  return lista.includes(id);
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
