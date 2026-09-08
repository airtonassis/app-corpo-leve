import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { CONQUISTAS_BASE } from '../../src/constants/data';
import { ConquistaItem } from '../../src/components/ConquistaItem';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, spacing, typography, radius, shadow } from '../../src/constants/theme';

export default function PlannerScreen() {
  const { conquistasDesbloqueadas, toggleConquista, registros, salvarRegistroSemanal } = useApp();

  const semanaAtual = registros.length + 1;
  const registroExistente = registros.find((r) => r.semana === semanaAtual);

  const [comoMeSenti, setComoMeSenti] = useState(registroExistente?.comoMeSenti ?? '');
  const [proximaMeta, setProximaMeta] = useState(registroExistente?.proximaMeta ?? '');

  function handleSalvar() {
    salvarRegistroSemanal({
      semana: semanaAtual,
      comoMeSenti,
      proximaMeta,
      dataAtualizacao: new Date().toISOString(),
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Planner semanal */}
        <Text style={typography.h2}>Planner Semanal</Text>
        <Text style={styles.sectionSubtitle}>
          Registre sua evolução — semana {semanaAtual}
        </Text>

        <View style={[styles.formCard, shadow.card]}>
          <Text style={styles.label}>Como me senti essa semana</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Ex: Mais disposta, senti evolução na prancha..."
            placeholderTextColor={colors.textMuted}
            value={comoMeSenti}
            onChangeText={setComoMeSenti}
          />

          <Text style={[styles.label, { marginTop: spacing.md }]}>Próxima meta</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Ex: Fazer 3 flexões completas"
            placeholderTextColor={colors.textMuted}
            value={proximaMeta}
            onChangeText={setProximaMeta}
          />

          <PrimaryButton
            label="Salvar Registro da Semana"
            onPress={handleSalvar}
            style={{ marginTop: spacing.lg }}
          />
        </View>

        {/* Histórico rápido */}
        {registros.length > 0 && (
          <View style={styles.historico}>
            <Text style={styles.historicoTitulo}>Histórico</Text>
            {registros
              .slice()
              .reverse()
              .map((r) => (
                <View key={r.semana} style={styles.historicoItem}>
                  <Text style={styles.historicoSemana}>Semana {r.semana}</Text>
                  <Text style={styles.historicoTexto}>{r.comoMeSenti}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Checklist de conquistas */}
        <Text style={[typography.h2, styles.sectionTitleConquistas]}>
          Conquistas
        </Text>
        <Text style={styles.sectionSubtitle}>Toque para marcar como conquistado.</Text>

        {CONQUISTAS_BASE.map((conquista) => (
          <ConquistaItem
            key={conquista.id}
            conquista={conquista}
            desbloqueada={conquistasDesbloqueadas.includes(conquista.id)}
            onToggle={toggleConquista}
          />
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
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
  sectionSubtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitleConquistas: {
    marginTop: spacing.xl,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historico: {
    marginTop: spacing.lg,
  },
  historicoTitulo: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  historicoItem: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historicoSemana: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  historicoTexto: {
    ...typography.body,
  },
});
