import React from 'react';
import { ScrollView, Text, View, StyleSheet, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { calcularImc, mensagemContextoImc } from '../../src/utils/imc';
import { solicitarPermissaoNotificacoes, notificacoesDisponiveis } from '../../src/utils/notifications';
import { useResponsive } from '../../src/hooks/useResponsive';
import { colors, spacing, typography, radius, shadow } from '../../src/constants/theme';

export default function PerfilScreen() {
  const { perfil, notificacoesAtivas, ativarNotificacoes, desativarNotificacoes, execucoesTreino } =
    useApp();
  const { maxContentWidth } = useResponsive();

  const imc = perfil?.pesoKg && perfil?.alturaCm ? calcularImc(perfil.pesoKg, perfil.alturaCm) : null;

  async function handleToggleNotificacoes(valor: boolean) {
    if (valor) {
      if (!notificacoesDisponiveis()) {
        Alert.alert(
          'Disponível em breve por aqui',
          'Notificações completas exigem um "development build" — no Expo Go elas ficam desativadas. ' +
            'Gere um build com "eas build --profile development" para ativá-las.'
        );
        return;
      }
      const concedida = await solicitarPermissaoNotificacoes();
      if (!concedida) {
        Alert.alert(
          'Permissão necessária',
          'Para te lembrar dos treinos, ative as notificações nas configurações do dispositivo.'
        );
        return;
      }
      await ativarNotificacoes(20); // lembrete padrão às 20h
    } else {
      await desativarNotificacoes();
    }
  }

  const treinosConcluidosComHorario = execucoesTreino.filter((e) => e.horaFim);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
        <Text style={typography.h1}>Seu Perfil</Text>

        {!perfil?.quizConcluido ? (
          <View style={[styles.card, shadow.card, { marginTop: spacing.lg }]}>
            <Text style={styles.cardTitulo}>Complete seu perfil</Text>
            <Text style={styles.cardTexto}>
              Faça a Avaliação Adaptativa para criar seu ponto de partida e personalizar sua jornada.
            </Text>
            <PrimaryButton
              label="Fazer avaliação"
              onPress={() => router.push('/perfil/quiz')}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <>
            <View style={[styles.card, shadow.card, { marginTop: spacing.lg }]}>
              <Text style={styles.cardTitulo}>Olá, {perfil.nome} 👋</Text>
              <Text style={styles.cardTexto}>
                {perfil.idade} anos{perfil.pesoKg ? ` · ${perfil.pesoKg}kg` : ''}{perfil.alturaCm ? ` · ${perfil.alturaCm}cm` : ''}
              </Text>

              {imc && (
                <View style={styles.imcBox}>
                  <Text style={styles.imcValor}>IMC: {imc.valor}</Text>
                  <Text style={styles.imcClassificacao}>{imc.classificacao}</Text>
                  <Text style={styles.imcContexto}>{mensagemContextoImc(imc.classificacao)}</Text>
                </View>
              )}

              <PrimaryButton
                label="Atualizar avaliação"
                variant="outline"
                onPress={() => router.push('/perfil/quiz')}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </>
        )}

        {/* Melhoria 3: controle de notificações */}
        <View style={[styles.card, shadow.card, { marginTop: spacing.lg }]}>
          <View style={styles.linhaNotificacao}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitulo}>Lembretes diários</Text>
              <Text style={styles.cardTexto}>
                Receba um aviso às 20h se ainda não tiver concluído o treino do dia.
              </Text>
            </View>
            <Switch
              value={notificacoesAtivas}
              onValueChange={handleToggleNotificacoes}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Melhoria 2: histórico de execuções com data/hora */}
        {treinosConcluidosComHorario.length > 0 && (
          <View style={[styles.card, shadow.card, { marginTop: spacing.lg }]}>
            <Text style={styles.cardTitulo}>Histórico de treinos</Text>
            {treinosConcluidosComHorario
              .slice()
              .reverse()
              .slice(0, 5)
              .map((execucao, index) => (
                <View key={`${execucao.treinoId}-${index}`} style={styles.historicoItem}>
                  <Text style={styles.historicoData}>
                    {new Date(execucao.data).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.historicoHorario}>
                    {formatarHora(execucao.horaInicio)} - {formatarHora(execucao.horaFim!)}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  cardTitulo: { ...typography.h3 },
  cardTexto: { ...typography.bodyMuted, marginTop: spacing.xs },
  imcBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  imcValor: { ...typography.h3 },
  imcClassificacao: { ...typography.body, fontWeight: '600', marginTop: 2 },
  imcContexto: { ...typography.bodyMuted, marginTop: spacing.xs },
  linhaNotificacao: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  historicoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historicoData: { ...typography.body, fontWeight: '600' },
  historicoHorario: { ...typography.bodyMuted },
});
