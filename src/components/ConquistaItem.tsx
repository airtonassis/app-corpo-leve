import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Conquista } from '../types';
import { colors, radius, spacing, typography, shadow } from '../constants/theme';

interface ConquistaItemProps {
  conquista: Conquista;
  desbloqueada: boolean;
  onToggle: (id: string) => void;
}

export function ConquistaItem({ conquista, desbloqueada, onToggle }: ConquistaItemProps) {
  return (
    <Pressable
      onPress={() => onToggle(conquista.id)}
      style={[styles.container, shadow.card, desbloqueada && styles.containerDesbloqueada]}
    >
      <View style={[styles.icone, desbloqueada && styles.iconeDesbloqueado]}>
        <Text style={styles.iconeTexto}>{desbloqueada ? '🏆' : '☆'}</Text>
      </View>
      <Text style={[styles.titulo, desbloqueada && styles.tituloDesbloqueado]}>
        {conquista.titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  containerDesbloqueada: {
    backgroundColor: colors.primaryLight,
  },
  icone: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeDesbloqueado: {
    backgroundColor: colors.accent,
  },
  iconeTexto: {
    fontSize: 16,
  },
  titulo: { ...typography.body, flex: 1 },
  tituloDesbloqueado: { fontWeight: '700' },
});
