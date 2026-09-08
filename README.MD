# Força Leve 🌿

App mobile (Expo + React Native + TypeScript) que transforma o e-book "Força Leve"
em um guia interativo de calistenia feminina, baseado no Método 4F
(Fundamento, Força, Forma, Flow).

## Estrutura de pastas

```
forca-leve/
├── app/                          # Rotas (Expo Router)
│   ├── _layout.tsx               # Stack raiz + AppProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Navegação por abas (Início / Planner)
│   │   ├── index.tsx             # Tela 1: Dashboard / Início
│   │   └── planner.tsx           # Tela 3: Planner & Conquistas
│   └── treino/
│       └── [id].tsx              # Tela 2: Execução do Treino (rota dinâmica)
├── src/
│   ├── components/
│   │   ├── PrimaryButton.tsx
│   │   ├── FaseCard.tsx
│   │   ├── ExercicioItem.tsx
│   │   └── ConquistaItem.tsx
│   ├── context/
│   │   └── AppContext.tsx        # Estado global (Context API)
│   ├── constants/
│   │   ├── theme.ts              # Cores, tipografia, espaçamento
│   │   └── data.ts               # Fases 4F, Treino A, Conquistas
│   └── types/
│       └── index.ts              # Tipos TypeScript compartilhados
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

Escaneie o QR code com o app **Expo Go** (Android/iOS) ou pressione `a` / `i`
no terminal para abrir em um emulador.

## Como estender

- **Novos treinos**: adicione um objeto `Treino` em `src/constants/data.ts`
  e registre-o no mapa `TREINOS_POR_ID` em `app/treino/[id].tsx`.
- **Persistência**: hoje o progresso vive em memória via Context API.
  Para persistir entre sessões, troque os `useState` do `AppContext` por
  `AsyncStorage` (`@react-native-async-storage/async-storage`).
- **Novas fases/conquistas**: edite `FASES` e `CONQUISTAS_BASE` em
  `src/constants/data.ts`.

## Identidade visual

Paleta definida em `src/constants/theme.ts`: verde oliva claro (`#8A9A5B`),
areia (`#FAF7F2`), branco e grafite (`#3A3A3A`), com componentes de toque
grandes (mínimo 52px de altura) pensados para uso durante o treino.
