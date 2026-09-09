import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { FASES } from '../../src/constants/data';
import { FaseCard } from '../../src/components/FaseCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, typography, radius, shadow } from '../../src/constants/theme';

export default function DashboardScreen() {
  const { faseAtual, setFaseAtual } = useApp();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Boas-vindas */}
      <View style={styles.welcomeBox}>
        <Text style={styles.eyebrow}>CORPO LEVE</Text>
        <Text style={typography.h1}>
          Você não precisa estar forte{'\n'}para começar.
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Precisa começar para ficar forte. Vamos, no seu tempo. 🌿
        </Text>
      </View>

      {/* Desafio 21 dias */}
      <View style={[styles.challengeCard, shadow.card]}>
        <Text style={styles.challengeTitle}>Desafio 21 Dias</Text>
        <Text style={styles.challengeText}>
          21 dias de consistência para transformar hábitos em força.
        </Text>
        <PrimaryButton
          label="Começar o Desafio"
          onPress={() => router.push('/treino/treino-a')}
          style={{ marginTop: spacing.md }}
        />
      </View>

      {/* Método 4F */}
      <Text style={[typography.h2, styles.sectionTitle]}>Seu Método 4F</Text>
      <Text style={styles.sectionSubtitle}>Escolha a fase em que você está agora.</Text>

      {FASES.map((fase) => (
        <FaseCard
          key={fase.id}
          fase={fase}
          selecionada={faseAtual === fase.id}
          onSelecionar={setFaseAtual}
        />
      ))}

      {/* CTA para o treino do dia */}
      <PrimaryButton
        label="Ir para o Treino de Hoje"
        onPress={() => router.push('/treino/treino-a')}
        variant="outline"
        style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
      />
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
  welcomeBox: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primaryDark,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  challengeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  challengeTitle: {
    ...typography.h2,
    color: colors.textInverse,
  },
  challengeText: {
    ...typography.body,
    color: colors.textInverse,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodyMuted,
    marginBottom: spacing.md,
  },
});
