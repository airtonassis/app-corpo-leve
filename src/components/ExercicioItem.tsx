import React from 'react';
import { Pressable, Text, View, Image, StyleSheet } from 'react-native';
import { Exercicio } from '../types';
import { colors, radius, spacing, typography, shadow } from '../constants/theme';

interface ExercicioItemProps {
  exercicio: Exercicio;
  concluido: boolean;
  onToggle: (id: string) => void;
}

export function ExercicioItem({ exercicio, concluido, onToggle }: ExercicioItemProps) {
  return (
    <Pressable
      onPress={() => onToggle(exercicio.id)}
      style={[styles.container, shadow.card, concluido && styles.containerConcluido]}
      hitSlop={4}
    >
      {/* Melhoria 4: imagem demonstrativa do exercício */}
      {exercicio.imagemUrl && (
        <Image
          source={{ uri: exercicio.imagemUrl }}
          style={styles.imagem}
          accessibilityLabel={`Demonstração do exercício ${exercicio.nome}`}
        />
      )}

      <View style={[styles.checkbox, concluido && styles.checkboxMarcado]}>
        {concluido && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.info}>
        <Text style={[styles.nome, concluido && styles.textoConcluido]}>{exercicio.nome}</Text>
        <Text style={styles.seriesRepeticoes}>{exercicio.seriesRepeticoes}</Text>
        {exercicio.instrucao && <Text style={styles.instrucao}>{exercicio.instrucao}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  containerConcluido: {
    backgroundColor: colors.primaryLight,
  },
  imagem: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxMarcado: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nome: { ...typography.h3 },
  textoConcluido: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  seriesRepeticoes: { ...typography.bodyMuted, marginTop: 2, fontWeight: '600' },
  instrucao: { ...typography.caption, marginTop: spacing.xs },
});
