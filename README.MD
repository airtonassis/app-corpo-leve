# Força Leve 🌿 — app corpo leve

App mobile (Expo SDK 57 + React 19 + React Native + TypeScript) que transforma
o e-book "Força Leve" em um guia interativo de calistenia feminina, baseado
no Método 4F (Fundamento, Força, Forma, Flow).

Base alinhada ao projeto validado publicado em `airtonassis/app-corpo-leve`.

## Estrutura de pastas

```
app-corpo-leve/
├── app/
│   ├── _layout.tsx               # Stack raiz + AppProvider + SafeAreaProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Início / Planner / Perfil
│   │   ├── index.tsx             # Dashboard
│   │   ├── planner.tsx           # Planner & Conquistas
│   │   └── perfil.tsx            # Perfil, IMC, notificações, histórico
│   ├── perfil/
│   │   └── quiz.tsx              # Cadastro do usuário + cálculo de IMC
│   └── treino/
│       └── [id].tsx              # Execução do treino (data/hora por exercício)
├── src/
│   ├── components/
│   ├── context/AppContext.tsx
│   ├── constants/
│   │   ├── theme.ts
│   │   ├── data.ts
│   │   └── motivacional.ts       # Mensagens por tema (força, foco, disciplina, resultados)
│   ├── hooks/useResponsive.ts    # Breakpoints Android/iOS/tablet
│   ├── types/index.ts
│   └── utils/
│       ├── imc.ts
│       └── notifications.ts      # Lembretes locais (expo-notifications)
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Como rodar (Expo Go)

```bash
npm install
npx expo start
```

## Correções aplicadas nesta versão (evitando os erros já resolvidos por você)

Comparei este pacote com o seu projeto publicado e validado antes de reaplicar
as melhorias. Os ajustes abaixo foram feitos para não reintroduzir problemas
já corrigidos:

1. **Versões alinhadas ao Expo SDK 57** (não 51). `expo-notifications` fixado
   em `~57.0.17`, a única faixa compatível com `expo@^57` — a versão que eu
   tinha usado antes (`~0.28.19`) é de SDK antigo e quebraria o build.
2. **`app.json` sem referências a assets inexistentes** (`icon`, `splash`,
   `adaptiveIcon`, `favicon`) — como a pasta `assets/` não tem esses arquivos
   no seu projeto, mantive a config enxuta que você já validou, incluindo o
   plugin `expo-notifications` **sem** a chave `icon` (evita erro de asset
   não encontrado no build).
3. **Splash via plugin `expo-splash-screen`**, no padrão que você já usa,
   em vez da chave `"splash"` no nível raiz (formato antigo/depreciado).
4. **`tsconfig.json` simplificado**, sem `include` de `.expo/types` e
   `expo-env.d.ts` (arquivos que não existem no seu projeto e causariam
   erro de include).
5. **`SafeAreaProvider`** foi reintroduzido no layout raiz — testei que
   `react-native-safe-area-context@~5.7.0` (a versão que você já tem) é
   compatível com Expo SDK 57, então essa melhoria de responsividade pôde
   voltar sem risco.
6. Nenhuma dependência de UI (`react-native-reanimated`, `react-native-worklets`,
   `react-native-screens`) foi tocada — mantive exatamente as versões do seu
   `package.json` validado.

## Melhorias funcionais incluídas

1. **Cadastro/quiz do usuário** (`app/perfil/quiz.tsx`) com cálculo de IMC
   em tempo real (`src/utils/imc.ts`), acessível pela aba **Perfil**.
2. **Data/hora de início e término por exercício e por treino**
   (`AppContext.tsx`), visível no histórico da aba Perfil.
3. **Notificações locais** (`src/utils/notifications.ts`): lembrete diário
   configurável (padrão 20h) com toggle na aba Perfil, mais notificação
   motivacional ao concluir um treino.
4. **Imagem por exercício** — campo `imagemUrl` em `Exercicio`, exibido em
   `ExercicioItem.tsx`. Os links atuais são placeholders do Unsplash; troque
   pelas suas fotos/gifs antes de publicar.
5. **Responsividade Android/iOS** via `src/hooks/useResponsive.ts` +
   `SafeAreaProvider`.
6. **Mensagens motivacionais por tema** (força, foco, disciplina, resultados)
   em `src/constants/motivacional.ts`, exibidas ao finalizar um treino.

### Pendências para produção

- **Notificações em iOS** exigem build nativo (EAS Build) — o Expo Go tem
  suporte limitado a partir do SDK 53+. Teste com
  `eas build --profile development`.
- **Imagens dos exercícios**: substitua os placeholders do Unsplash por
  fotos/gifs próprios antes de publicar nas lojas.
- **Persistência**: perfil, execuções e notificações ainda vivem em memória
  (Context API). Para manter dados entre sessões, migre os `useState` do
  `AppContext` para `AsyncStorage`.

## Como estender

- **Novos treinos**: adicione um objeto `Treino` em `src/constants/data.ts`
  e registre-o no mapa `TREINOS_POR_ID` em `app/treino/[id].tsx`.
- **Novas fases/conquistas**: edite `FASES` e `CONQUISTAS_BASE` em
  `src/constants/data.ts`.
