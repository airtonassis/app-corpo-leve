import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Fase } from '../types';
import { colors, radius, spacing, typography, shadow } from '../constants/theme';

interface FaseCardProps {
  fase: Fase;
  selecionada: boolean;
  onSelecionar: (id: Fase['id']) => void;
}

export function FaseCard({ fase, selecionada, onSelecionar }: FaseCardProps) {
  return (
    <Pressable
      onPress={() => onSelecionar(fase.id)}
      style={[
        styles.card,
        shadow.card,
        { backgroundColor: fase.cor },
        selecionada && styles.cardSelecionada,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>{fase.titulo}</Text>
        {selecionada && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Atual</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitulo}>{fase.subtitulo}</Text>
      <Text style={styles.descricao}>{fase.descricao}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelecionada: {
    borderColor: colors.primaryDark,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: { ...typography.h3 },
  subtitulo: { ...typography.bodyMuted, marginTop: 2, marginBottom: spacing.xs },
  descricao: { ...typography.body },
  badge: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
});
