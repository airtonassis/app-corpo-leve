# Corpo Leve 🌿 — app corpo leve

App mobile (Expo SDK 57 + React 19 + React Native + TypeScript) que transforma
o e-book "Corpo Leve" em um guia interativo de calistenia feminina, baseado
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

---

## V2 — Avaliação Adaptativa (implementada nesta versão)

A tela `app/perfil/quiz.tsx` foi convertida para um wizard adaptativo conectado ao banco de 90 perguntas em `src/data/quizQuestions.ts`.

### Fluxo

1. Nome/apelido para personalização.
2. Uma pergunta por tela.
3. Perguntas condicionais conforme respostas anteriores, idade, objetivo, experiência, limitações e equipamentos.
4. Respostas opcionais podem ser ignoradas.
5. O usuário pode voltar e corrigir respostas.
6. Ramos que deixam de ser relevantes são removidos do conjunto de respostas.
7. A sessão é salva localmente para permitir retomada.
8. Ao final, `profileEngine.ts` gera o perfil e `recommendationEngine.ts` recomenda o primeiro ciclo.
9. `app/perfil/resultado.tsx` apresenta o ponto de partida e a visão de jornada 21 → 42 → 63 dias.

### Persistência

Foi adicionada a dependência `@react-native-async-storage/async-storage` 2.2.0, suportada pelo Expo Go no SDK atual. Após extrair o projeto, execute:

```bash
npm install
```

Se preferir que o Expo confirme a versão compatível:

```bash
npx expo install @react-native-async-storage/async-storage
```

### Arquivos principais desta etapa

```text
app/perfil/quiz.tsx
app/perfil/resultado.tsx
src/components/quiz/QuizProgress.tsx
src/components/quiz/QuizQuestionCard.tsx
src/services/storage/assessmentStorage.ts
src/services/assessment/quizEngine.ts
src/services/assessment/profileEngine.ts
src/services/assessment/recommendationEngine.ts
src/data/quizQuestions.ts
```

### Próxima evolução sugerida

Conectar o resultado da avaliação ao modelo `Programa → Ciclo → Jornada`, gerando o primeiro plano de 21 dias de acordo com o objetivo, nível, disponibilidade, preferências e pontos de atenção do usuário.

## V2 — Ciclo 1 guiado (cronômetro + descanso + progressão)

Esta versão adiciona a execução guiada do primeiro ciclo de 21 dias:

- biblioteca expandida para 49 exercícios/variações de calistenia;
- famílias explícitas de progressão/regressão;
- `RestEngine` para intervalos adaptados ao perfil e ao tipo de exercício;
- cronômetro real por série/exercício;
- descanso automático entre séries e exercícios;
- feedback de esforço (`muito leve`, `adequado`, `difícil`, `precisei interromper`);
- persistência das execuções do programa em AsyncStorage;
- tela `/programa/dia/[day]` e CTA `Começar meu Ciclo 1` no resultado da avaliação.

O cronômetro é um instrumento de acompanhamento, não uma meta de velocidade. O programa mantém dias de recuperação ativa e progressão gradual.

## Avatar animado (Ciclo 1)

O treino guiado agora mostra um avatar em movimento para cada exercício. O avatar visual acompanha a opção de sexo informada no quiz; se o usuário preferir não informar, é usado um avatar neutro. Essa escolha é apenas visual e nunca altera dificuldade, progressão ou recomendação do treino.

Os mockups conceituais estão em `docs/design/avatar-flow-flexao.png` e `docs/design/avatar-flow-agachamento.png`.


## Avatar Motion Guide — catálogo de movimentos

O Ciclo 1 agora inclui uma camada de demonstração visual por exercício. O catálogo em `src/data/avatar/movementCatalog.ts` organiza os movimentos por família e permite sobrescritas específicas por variação. Cada movimento possui três fases (`preparar`, `executar`, `retornar`), tempo visual, pontos técnicos e erros comuns a evitar.

A tela `app/programa/dia/[day].tsx` usa `AvatarMovementGuide`, que sincroniza essas fases com o avatar escolhido a partir do perfil (`masculino`, `feminino` ou `neutro`). A representação visual não participa do cálculo de dificuldade ou progressão.

A arquitetura deixa o catálogo independente do renderizador: no futuro, o `ExerciseAvatar` pode ser substituído por animações 2D, Lottie, Rive ou personagem 3D mantendo o mesmo `movementCatalog` e o motor de treino.

## Ciclo 1 — Avatar articulado por movimento

Nesta evolução o avatar deixou de ser apenas um bloco visual que se desloca inteiro. O componente `ExerciseAvatar` passou a animar articulações separadamente (ombros, cotovelos, quadris e joelhos), sincronizadas com as fases `preparar → executar → retornar` do `AvatarMovementGuide`.

Famílias priorizadas nesta versão:
- flexões;
- agachamentos;
- afundos;
- puxadas/remadas;
- pranchas;
- core no solo;
- mobilidade;
- condicionamento/aquecimento.

Também existem poses específicas para variações importantes como flexão na parede, flexão inclinada, flexão com joelhos, agachamento na cadeira, afundo com apoio, prancha na parede, prancha lateral, remadas e ponte de glúteos.

A variante visual do avatar continua sendo resolvida pelo perfil (`masculino`, `feminino` ou `neutro`) e não participa do cálculo de dificuldade do treino.

### Arquitetura visual

`AvatarMovementGuide` controla a fase pedagógica e passa a fase atual ao `ExerciseAvatar`. O avatar interpola as articulações até a pose correspondente. Isso mantém a demonstração sincronizada com o texto técnico e permite substituir futuramente o renderizador atual por Rive/Lottie/3D sem alterar o motor do programa, cronômetro, descanso ou histórico.


## Avatar Coach

O guia articulado agora possui uma camada de coaching por fase. Pontos técnicos podem ser associados a preparar/executar/retornar, priorizados e exibidos junto ao avatar. A camada é visual e educativa; não altera a dificuldade do programa. Sexo informado no perfil continua definindo apenas a representação visual do avatar.


## Avatar Coach Visual

O avatar agora recebe marcadores visuais por região corporal e fase do movimento. Pontos prioritários aparecem diretamente sobre a representação do corpo e, quando o tronco é um ponto técnico prioritário, uma linha-guia de alinhamento é exibida. A camada usa os mesmos dados do movementCatalog e permanece desacoplada da prescrição do treino.


## Avatar Coach — Marcadores Articulados

Os pontos técnicos visuais deixaram de usar coordenadas fixas da tela. Marcadores de ombros, mãos, quadril, joelhos e pés agora são renderizados dentro das próprias articulações do avatar e herdam seus movimentos e rotações. Tronco, cabeça e respiração acompanham o torso. Os marcadores possuem pulso visual leve enquanto o exercício está ativo, e a linha de alinhamento do tronco acompanha a rotação corporal.


## Avatar Coach — Trajetória Visual

O avatar agora exibe uma seta animada de trajetória sincronizada com a fase do movimento. Agachamentos e afundos indicam descida/subida; flexões indicam aproximação/afastamento do apoio; puxadas indicam subida/retorno; pranchas indicam sustentação. A trajetória é educativa e não incentiva velocidade de execução.

## Avatar Coach — Cadência Visual Sincronizada

A demonstração usa `durationMs` do `movementCatalog` como fonte única de cadência por fase. O `AvatarMovementGuide` exibe tempo orientativo e uma barra de progresso; o `ExerciseAvatar` recebe a mesma duração para sincronizar a transição das articulações. A cadência é uma referência de controle do movimento, não uma meta de velocidade ou competição.

## Corpo Leve — Memória da Jornada

A base agora possui modelos para histórico por família de exercício, resumo do ciclo e decisões de adaptação. O histórico agrega sessões, séries concluídas, tempo ativo, feedbacks, variações já praticadas, maior variação alcançada, progressões e regressões. As novas chaves persistentes usam `@corpo-leve/...`; a leitura de execuções mantém fallback para a chave legada `@forca-leve/...` para evitar perda de histórico durante a transição de nome.

## Minha Jornada

Nova aba `Jornada` conectada ao histórico real do Ciclo 1. Exibe progresso do ciclo, tempo ativo, progressões, regressões, adaptações e evolução por família de exercício. Cada família mostra primeira variação, variação atual, maior variação alcançada, sessões, séries, tempo ativo e distribuição de feedbacks. O foco é comparação com o próprio histórico do usuário, sem rankings entre pessoas.

## Linha do tempo por família

Os cards da aba `Jornada` agora abrem `/jornada/[group]`. A tela detalha cada sessão da família com dia, data, variação, séries, tempo ativo, repetições, feedback e transição observada. Decisões do motor adaptativo passam a ser persistidas ao carregar um dia ajustado, registrando motivo, histórico recente e volume antes/depois. Isso permite explicar progressões e ajustes com base no histórico realmente usado pelo motor.

## Sessão adaptada ao tempo disponível

Antes de iniciar o treino do dia, o Corpo Leve pergunta quanto tempo o usuário possui: 8, 12, 20 minutos ou treino completo. O `SessionComposerEngine` recompõe a sessão usando o treino adaptativo já calculado e o histórico recente. Famílias menos presentes nas últimas sessões recebem prioridade relativa, enquanto feedbacks `dificil` e `interrompido` reduzem prioridade. Sessões curtas reduzem volume sem aumentar agressivamente a intensidade. A composição escolhida é persistida junto à execução (`sessionComposition`) para alimentar a Jornada e futuras análises.

## Continuidade, disponibilidade e retomada

A `Minha Jornada` agora diferencia sessões curtas, treinos completos, dias declarados sem disponibilidade e retomadas posteriores. A opção `Hoje não consigo` grava um `DailyAvailabilityRecord` sem classificar o dia como falha. Escolhas de 8/12/20 minutos também são persistidas e permitem estimar a janela de tempo mais utilizada. O objetivo é medir continuidade pela capacidade de retornar e manter prática compatível com a rotina, não por sequências perfeitas.

## Duração sugerida e formação de hábito

O Corpo Leve pode sugerir primeiro a duração que aparece com maior frequência nas escolhas recentes do usuário, sem remover as demais opções. A sugestão começa somente após existir histórico mínimo e ganha uma indicação interna de confiança conforme surgem novas escolhas.

Os ciclos do produto são marcos de jornada e organização do programa, não prazos biológicos garantidos para memória muscular ou formação de hábito. A comunicação do app deve evitar afirmações como “21/30/90 dias garantem um hábito”. O objetivo é observar prática, retorno, disponibilidade e evolução individual ao longo do tempo.


## Behavior & Autonomy Engine

A jornada agora mantém comportamento e capacidade física em camadas separadas.

- `ProgramDayExecution` continua sendo a única fonte para conclusão da atividade planejada e para a memória funcional de exercícios.
- `ComplementaryActivity` registra caminhada, corrida, bicicleta, natação ou outra atividade como movimento adicional.
- Uma atividade complementar nunca altera `completedDays`, não libera progressão de exercício e não substitui a atividade planejada.
- `BehaviorAutonomySnapshot` descreve sinais observados como adaptação ao tempo disponível, retomada e movimento complementar. Os estágios não afirmam que um hábito foi formado e não dependem de um número fixo de dias.
- A tela `jornada/atividade-complementar` permite registro manual. O campo `source` já reserva `strava`, `health_connect` e `apple_health` para integrações futuras.
- A duração registrada é histórica, não uma meta de volume.

### Regra de produto

Disciplina no Corpo Leve significa manter relação com a prática: realizar a atividade planejada, adaptá-la quando necessário e retornar após interrupções. Não significa realizar esforço intenso todos os dias. Dias de recuperação continuam fazendo parte do programa.


## Modo Livre Assistido

O `Modo Livre Assistido` foi adicionado como uma camada complementar e separada do programa principal.

Regras atuais:
- só fica disponível quando existe uma `ProgramDayExecution` concluída no dia local atual;
- nunca altera `completedDays` nem substitui a atividade principal;
- considera nível calculado, equipamentos disponíveis, pontos de atenção, famílias já trabalhadas e esforço recente;
- exercícios fora do nível ou sem equipamento ficam bloqueados;
- famílias com feedback `difícil` ou `interrompido` no mesmo dia ficam como não recomendadas;
- mobilidade e aquecimento recebem prioridade;
- a primeira versão limita a janela a no máximo 2 exercícios e 10 minutos;
- a duração gravada é o tempo real entre `Iniciar prática livre` e `Concluir prática livre`;
- sessões livres alimentam somente o `Behavior & Autonomy Engine` e não liberam progressão física automática.

A intenção é desenvolver autonomia progressiva sem transformar liberdade em volume extra obrigatório. O usuário pode escolher, enquanto o Corpo Leve protege coerência, recuperação e segurança.


## Autonomia progressiva por ciclo

O Modo Livre Assistido agora usa `FreeModePolicy`, resolvida pelo ciclo atual do programa.

- Ciclo 1 — Fundamentos: orientação alta, até 2 exercícios / 10 min.
- Ciclo 2 — Consistência: orientação moderada, até 2 exercícios / 12 min e mais opções com orientação.
- Ciclo 3 — Evolução: até 3 exercícios / 15 min e intenção `montar_pratica`.
- Ciclo 4+ — Autonomia: orientação leve, até 3 exercícios / 15 min; o app interfere principalmente em conflitos de segurança, equipamento, esforço e recuperação.

A autonomia cresce pela quantidade de decisões que o usuário pode tomar, não por exigir mais volume. Em todos os ciclos:
- a atividade planejada do dia precisa estar concluída antes do Modo Livre;
- feedback `difícil` ou `interrompido` continua protegendo a família naquele dia;
- exercício incompatível com nível, equipamento ou ponto de atenção continua bloqueado;
- Modo Livre não altera progressão funcional automaticamente;
- o limite indicado é teto de referência, não meta a ser alcançada.

O storage do Modo Livre mantém compatibilidade de leitura com registros criados antes da política progressiva.
