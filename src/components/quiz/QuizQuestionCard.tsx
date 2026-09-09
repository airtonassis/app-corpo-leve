import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { QuizAnswerValue, QuizQuestion } from '../../types/quiz';
import { colors, radius, shadow, spacing, typography } from '../../constants/theme';

interface Props {
  question: QuizQuestion;
  value: QuizAnswerValue | undefined;
  onChange: (value: QuizAnswerValue) => void;
}

export function QuizQuestionCard({ question, value, onChange }: Props) {
  const numericValue = value === undefined || value === null ? '' : String(value);

  return (
    <View style={[styles.card, shadow.card]}>
      <Text style={styles.category}>{categoryLabel(question.category)}</Text>
      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {!!question.helperText && <Text style={styles.helper}>{question.helperText}</Text>}

      {(question.type === 'single' || question.type === 'boolean' || question.type === 'scale') && (
        <View style={styles.options}>
          {question.options?.map((option) => {
            const selected = String(value ?? '') === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(question.type === 'scale' ? Number(option.value) : option.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {question.type === 'multi' && (
        <View style={styles.options}>
          {question.options?.map((option) => {
            const current = Array.isArray(value) ? value.map(String) : [];
            const selected = current.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  const next = selected
                    ? current.filter((item) => item !== option.value)
                    : [...current, option.value];
                  onChange(next);
                }}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {(question.type === 'number' || question.type === 'text') && (
        <View style={styles.inputRow}>
          <TextInput
            value={numericValue}
            onChangeText={(text) => {
              if (question.type === 'number') {
                const normalized = text.replace(',', '.');
                onChange(normalized === '' ? null : Number(normalized));
              } else {
                onChange(text);
              }
            }}
            placeholder={question.placeholder ?? (question.type === 'number' ? 'Digite um valor' : 'Digite sua resposta')}
            placeholderTextColor={colors.textMuted}
            keyboardType={question.type === 'number' ? 'decimal-pad' : 'default'}
            style={styles.input}
          />
          {!!question.unit && <Text style={styles.unit}>{question.unit}</Text>}
        </View>
      )}

      {!question.required && <Text style={styles.optional}>Pergunta opcional</Text>}
    </View>
  );
}

function categoryLabel(category: QuizQuestion['category']): string {
  const labels: Record<QuizQuestion['category'], string> = {
    perfil: 'Perfil',
    objetivo: 'Objetivo',
    seguranca: 'Segurança',
    capacidade_fisica: 'Capacidade física',
    mobilidade: 'Mobilidade',
    habitos: 'Hábitos',
    recuperacao: 'Recuperação',
    energia: 'Energia',
    motivacao: 'Motivação',
    barreiras: 'Barreiras',
    preferencias: 'Preferências',
  };
  return labels[category];
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  category: { ...typography.caption, textTransform: 'uppercase', color: colors.primaryDark, fontWeight: '800', letterSpacing: 0.7 },
  title: { ...typography.h2, marginTop: spacing.xs },
  prompt: { ...typography.body, lineHeight: 24 },
  helper: { ...typography.bodyMuted, lineHeight: 20 },
  options: { gap: spacing.sm, marginTop: spacing.sm },
  option: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionText: { ...typography.body, flex: 1 },
  optionTextSelected: { fontWeight: '700', color: colors.primaryDark },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  check: { color: colors.textInverse, fontWeight: '800' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  input: { flex: 1, minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, ...typography.body, backgroundColor: colors.surfaceAlt },
  unit: { ...typography.body, fontWeight: '700', minWidth: 44 },
  optional: { ...typography.caption, marginTop: spacing.xs },
});
