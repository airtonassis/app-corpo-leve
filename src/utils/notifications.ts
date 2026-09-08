import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Define como as notificações se comportam quando o app está aberto em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ID_LEMBRETE_DIARIO = 'forca-leve-lembrete-diario';

/**
 * Solicita permissão de notificações ao usuário.
 * Deve ser chamado a partir de uma interação (ex: tela de perfil/onboarding).
 */
export async function solicitarPermissaoNotificacoes(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('lembretes', {
      name: 'Lembretes de treino',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  let statusFinal = statusAtual;

  if (statusAtual !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    statusFinal = status;
  }

  return statusFinal === 'granted';
}

/**
 * Agenda um lembrete diário (padrão 20h) para o caso da usuária ainda não
 * ter concluído o treino do dia. Reagende sempre que o treino for finalizado
 * ou quando o horário preferido mudar.
 */
export async function agendarLembreteDiario(hora = 20, minuto = 0): Promise<void> {
  await cancelarLembreteDiario();

  await Notifications.scheduleNotificationAsync({
    identifier: ID_LEMBRETE_DIARIO,
    content: {
      title: 'Força Leve 🌿',
      body: 'Você ainda não concluiu o treino de hoje. Que tal 15 minutos agora?',
    },
    trigger: {
      hour: hora,
      minute: minuto,
      repeats: true,
    },
  });
}

export async function cancelarLembreteDiario(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_DIARIO).catch(() => {
    // sem problema se ainda não existir um lembrete agendado
  });
}

/**
 * Dispara uma notificação motivacional imediata (usada ao concluir um desafio).
 */
export async function notificarConquista(texto: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Parabéns! 🏆',
      body: texto,
    },
    trigger: null, // dispara imediatamente
  });
}
