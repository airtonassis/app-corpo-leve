import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/context/AppContext';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    // SafeAreaProvider garante respeito ao notch/status bar tanto em
    // Android quanto em iOS (melhoria 5 — responsividade multiplataforma).
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="treino/[id]" options={{ title: 'Treino', presentation: 'card' }} />
          <Stack.Screen name="perfil/quiz" options={{ title: 'Seu Perfil' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
