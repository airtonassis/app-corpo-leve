import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Notificações (mesmo locais) têm suporte limitado dentro do Expo Go a
 * partir do SDK 53 — a funcionalidade completa exige um development build
 * (EAS Build). Para o app nunca quebrar rodando no Expo Go, detectamos o
 * ambiente e transformamos todas as funções abaixo em no-ops seguros
 * quando estamos dentro do Expo Go.
 *
 * Saiba mais: https://docs.expo.dev/develop/development-builds/introduction/
 */
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

const ID_LEMBRETE_DIARIO = 'forca-leve-lembrete-diario';

let handlerConfigurado = false;

/**
 * Import dinâmico: evita que o módulo nativo de notificações seja
 * inicializado (e lance erro) assim que o app carrega. Só é chamado quando
 * uma ação de notificação é realmente disparada, e nunca dentro do Expo Go.
 */
async function carregarModuloNotificacoes() {
  return import('expo-notifications');
}

async function configurarHandlerSeNecessario(
  Notifications: Awaited<ReturnType<typeof carregarModuloNotificacoes>>
) {
  if (handlerConfigurado) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerConfigurado = true;
}

/**
 * Solicita permissão de notificações ao usuário.
 * Retorna `false` de forma segura (sem lançar erro) quando rodando no Expo Go.
 */
export async function solicitarPermissaoNotificacoes(): Promise<boolean> {
  if (isExpoGo) {
    console.log(
      '[Corpo Leve] Notificações completas exigem um development build; ' +
        'no Expo Go elas ficam desativadas automaticamente.'
    );
    return false;
  }

  try {
    const Notifications = await carregarModuloNotificacoes();
    await configurarHandlerSeNecessario(Notifications);

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
  } catch (erro) {
    console.warn('[Corpo Leve] Não foi possível configurar notificações:', erro);
    return false;
  }
}

/**
 * Agenda um lembrete diário (padrão 20h). No Expo Go, não faz nada —
 * apenas evita quebrar o app.
 */
export async function agendarLembreteDiario(hora = 20, minuto = 0): Promise<void> {
  if (isExpoGo) return;

  try {
    const Notifications = await carregarModuloNotificacoes();
    await configurarHandlerSeNecessario(Notifications);
    await cancelarLembreteDiario();

    await Notifications.scheduleNotificationAsync({
      identifier: ID_LEMBRETE_DIARIO,
      content: {
        title: 'Corpo Leve 🌿',
        body: 'Você ainda não concluiu o treino de hoje. Que tal 15 minutos agora?',
      },
      trigger: {
        hour: hora,
        minute: minuto,
        repeats: true,
      },
    });
  } catch (erro) {
    console.warn('[Corpo Leve] Não foi possível agendar o lembrete diário:', erro);
  }
}

export async function cancelarLembreteDiario(): Promise<void> {
  if (isExpoGo) return;

  try {
    const Notifications = await carregarModuloNotificacoes();
    await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_DIARIO);
  } catch {
    // sem problema se ainda não existir um lembrete agendado
  }
}

/**
 * Dispara uma notificação motivacional imediata (usada ao concluir um desafio).
 * No Expo Go, não faz nada — a mensagem motivacional ainda aparece no Alert
 * da tela de treino normalmente, só a notificação push local é que fica ausente.
 */
export async function notificarConquista(texto: string): Promise<void> {
  if (isExpoGo) return;

  try {
    const Notifications = await carregarModuloNotificacoes();
    await configurarHandlerSeNecessario(Notifications);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Parabéns! 🏆',
        body: texto,
      },
      trigger: null, // dispara imediatamente
    });
  } catch (erro) {
    console.warn('[Corpo Leve] Não foi possível enviar notificação:', erro);
  }
}

export function notificacoesDisponiveis(): boolean {
  return !isExpoGo;
}
