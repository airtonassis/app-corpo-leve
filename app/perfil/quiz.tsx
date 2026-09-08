import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { calcularImc, mensagemContextoImc } from '../../src/utils/imc';
import { NivelExperiencia } from '../../src/types';
import { colors, spacing, typography, radius, shadow } from '../../src/constants/theme';

const NIVEIS: { id: NivelExperiencia; label: string }[] = [
  { id: 'iniciante', label: 'Iniciante' },
  { id: 'intermediaria', label: 'Intermediária' },
  { id: 'avancada', label: 'Avançada' },
];

export default function QuizPerfilScreen() {
  const { perfil, salvarPerfil } = useApp();

  const [nome, setNome] = useState(perfil?.nome ?? '');
  const [idade, setIdade] = useState(perfil ? String(perfil.idade) : '');
  const [pesoKg, setPesoKg] = useState(perfil ? String(perfil.pesoKg) : '');
  const [alturaCm, setAlturaCm] = useState(perfil ? String(perfil.alturaCm) : '');
  const [nivel, setNivel] = useState<NivelExperiencia>(perfil?.nivelExperiencia ?? 'iniciante');
  const [objetivo, setObjetivo] = useState(perfil?.objetivo ?? '');

  const pesoNum = parseFloat(pesoKg.replace(',', '.'));
  const alturaNum = parseFloat(alturaCm.replace(',', '.'));
  const imc = calcularImc(pesoNum, alturaNum);

  function handleSalvar() {
    const idadeNum = parseInt(idade, 10);

    if (!nome.trim() || !idadeNum || !pesoNum || !alturaNum) {
      Alert.alert('Quase lá!', 'Preencha nome, idade, peso e altura para continuar.');
      return;
    }

    salvarPerfil({
      nome: nome.trim(),
      idade: idadeNum,
      pesoKg: pesoNum,
      alturaCm: alturaNum,
      nivelExperiencia: nivel,
      objetivo: objetivo.trim(),
      quizConcluido: true,
      atualizadoEm: new Date().toISOString(),
    });

    router.back();
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
        <Text style={typography.h1}>Vamos te conhecer</Text>
        <Text style={styles.subtitle}>
          Essas informações ajudam a acompanhar sua evolução ao longo do Método 4F.
        </Text>

        <View style={[styles.card, shadow.card]}>
          <Campo label="Nome">
            <TextInput
              style={styles.input}
              placeholder="Como podemos te chamar?"
              placeholderTextColor={colors.textMuted}
              value={nome}
              onChangeText={setNome}
            />
          </Campo>

          <Campo label="Idade">
            <TextInput
              style={styles.input}
              placeholder="Ex: 28"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={idade}
              onChangeText={setIdade}
            />
          </Campo>

          <View style={styles.linha}>
            <Campo label="Peso (kg)" style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 65"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={pesoKg}
                onChangeText={setPesoKg}
              />
            </Campo>
            <Campo label="Altura (cm)" style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Ex: 165"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={alturaCm}
                onChangeText={setAlturaCm}
              />
            </Campo>
          </View>

          {/* Cálculo de IMC em tempo real */}
          {imc.valor > 0 && (
            <View style={styles.imcBox}>
              <Text style={styles.imcValor}>IMC: {imc.valor}</Text>
              <Text style={styles.imcClassificacao}>{imc.classificacao}</Text>
              <Text style={styles.imcContexto}>{mensagemContextoImc(imc.classificacao)}</Text>
            </View>
          )}

          <Text style={[styles.label, { marginTop: spacing.md }]}>Nível de experiência</Text>
          <View style={styles.niveis}>
            {NIVEIS.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => setNivel(n.id)}
                style={[styles.nivelChip, nivel === n.id && styles.nivelChipAtivo]}
              >
                <Text style={[styles.nivelTexto, nivel === n.id && styles.nivelTextoAtivo]}>
                  {n.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Campo label="Seu objetivo" style={{ marginTop: spacing.md }}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ganhar força e confiança"
              placeholderTextColor={colors.textMuted}
              value={objetivo}
              onChangeText={setObjetivo}
            />
          </Campo>

          <PrimaryButton label="Salvar meu perfil" onPress={handleSalvar} style={{ marginTop: spacing.lg }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...typography.bodyMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  linha: { flexDirection: 'row', gap: spacing.md },
  label: { ...typography.caption, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imcBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  imcValor: { ...typography.h3 },
  imcClassificacao: { ...typography.body, fontWeight: '600', marginTop: 2 },
  imcContexto: { ...typography.bodyMuted, marginTop: spacing.xs },
  niveis: { flexDirection: 'row', gap: spacing.sm },
  nivelChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nivelChipAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  nivelTexto: { ...typography.bodyMuted, fontWeight: '600' },
  nivelTextoAtivo: { color: colors.textInverse },
});
