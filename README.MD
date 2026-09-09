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


## Arquitetura genérica de ciclos

A Jornada Corpo Leve agora possui um catálogo formal de ciclos separado dos geradores de treino:

- Ciclo 1 — Fundamentos — 21 dias — gerador disponível.
- Ciclo 2 — Consistência — 42 dias — definido na jornada, gerador específico ainda não implementado.
- Ciclo 3 — Evolução — 63 dias — definido na jornada, gerador específico ainda não implementado.
- Ciclo 4 — Autonomia — 84 dias — definido na jornada, gerador específico ainda não implementado.
- Jornada Contínua — sem prazo fixo.

`cycleCatalog.ts` descreve a experiência de cada etapa.
`journeyProgramEngine.ts` calcula ciclo atual, desbloqueios, conclusão e histórico entre ciclos.
`programResolver.ts` resolve o gerador disponível para cada ciclo.

Regra de arquitetura: ciclos futuros não reutilizam o Ciclo 1 apenas aumentando duração ou volume. Cada etapa deve receber seu próprio motor adaptativo antes de ser liberada.

A Home antiga baseada em "Desafio 21 Dias" foi substituída por uma visão da Jornada Corpo Leve. O texto não afirma formação de hábito por prazo fixo.

A tela de execução agora aceita `cycle` como parâmetro, usa o `program.durationDays` em vez de números fixos e direciona o último dia para uma tela genérica de fechamento de ciclo.

O fechamento segue:
Conquista → Reflexão → Reconhecimento da jornada → Próxima etapa.

O Modo Livre Assistido também consulta o estado genérico da jornada e herdará automaticamente a política do ciclo ativo quando os próximos geradores forem liberados.


## Journey Memory longitudinal

A memória da jornada agora existe acima dos ciclos e é reconstruída a partir dos registros brutos do usuário.

Fontes herdadas:
- execuções planejadas de todos os ciclos;
- histórico de exercícios, famílias, séries, tempo ativo e feedbacks;
- decisões de adaptação/progressão/regressão;
- disponibilidade escolhida e sessões adaptadas ao tempo;
- dias registrados sem disponibilidade;
- atividades complementares;
- sessões do Modo Livre Assistido;
- histórico por ciclo.

`longitudinalJourneyMemoryEngine.ts` produz `LongitudinalJourneyMemory`.
`journeyMemoryStorage.ts` reconstrói a memória a partir das fontes de verdade e mantém um snapshot derivado em `@corpo-leve/journey-memory-snapshot-v1`.

O snapshot não substitui os registros originais. Se houver divergência, a memória é reconstruída a partir dos dados brutos.

### Transição entre ciclos

`buildCycleTransitionContext()` transforma a memória longitudinal em contexto para o próximo ciclo:
- referências funcionais que devem ser preservadas;
- famílias que pedem observação;
- famílias com menor exposição histórica;
- janela de tempo mais frequente;
- sinais de Modo Livre e atividades complementares;
- regras que impedem confundir indisponibilidade com perda de capacidade.

O `programResolver` agora aceita `LongitudinalJourneyMemory` em seu contrato. O Ciclo 1 ainda ignora esse contexto, mas qualquer gerador futuro de Ciclo 2+ deve recebê-lo e interpretá-lo.

A Home, a tela de execução e o Modo Livre já passam a memória ao resolver. A tela de fechamento do ciclo mostra explicitamente o histórico herdado e os principais motivos que poderão orientar a próxima etapa.

Regra: ciclo novo é capítulo novo da mesma jornada, nunca um perfil zerado.


## Cycle 2 Engine — Consistência

O Ciclo 2 agora possui gerador próprio e usa `LongitudinalJourneyMemory` como entrada obrigatória.

Princípios implementados:
- duração estrutural de 42 dias;
- não reinicia referências funcionais do usuário;
- preserva a última variação conhecida quando ela continua compatível com nível, recursos e pontos de atenção;
- não progride automaticamente só porque o Ciclo 1 terminou;
- famílias com histórico mais difícil entram em modo de observação;
- famílias pouco expostas podem ganhar prioridade de presença sem aumentar volume total;
- a janela de tempo mais frequente da Journey Memory orienta `estimatedMinutes`, mas não vira meta;
- recuperação aparece de forma recorrente e nunca é usada para compensar sessões perdidas;
- atividades complementares e Modo Livre continuam sem substituir a atividade planejada;
- feedback e histórico funcional continuam sendo a base para adaptações posteriores.

Estrutura do Ciclo 2:
- Dias 1–14: preservar referências e estabilizar rotina;
- Dias 15–28: equilibrar famílias e manter continuidade;
- Dias 29–42: consolidar escolhas e preparar mais autonomia;
- marcos nos dias 7, 14, 21, 28, 35 e 42;
- dias de recuperação ativa distribuídos ao longo da etapa.

O `programResolver` agora resolve o Ciclo 2 quando existe Journey Memory.
O `cycleCatalog` marca Consistência como gerador disponível.
Home e Minha Jornada reconhecem o Ciclo 2 como etapa executável depois da conclusão do Ciclo 1.


## Cycle 3 Engine — Evolução

O Ciclo 3 agora possui gerador próprio e recebe a `LongitudinalJourneyMemory` como entrada obrigatória.

Princípios implementados:
- duração estrutural de 63 dias;
- não aumenta duração ou volume automaticamente por mudança de ciclo;
- preserva referências funcionais herdadas no primeiro terço;
- famílias com histórico recente `difícil`/`interrompido` permanecem em observação;
- famílias com histórico recente estável podem receber, a partir da fase 2, a próxima variação compatível como opção inicial;
- progressão de variação não aumenta automaticamente sets ou duração;
- equipamento, nível e regiões/pontos de atenção continuam sendo filtros obrigatórios;
- famílias pouco expostas podem ganhar prioridade de presença, não volume;
- a janela recente de tempo orienta a sessão, limitada a 8–20 min como referência;
- autonomia entra como contexto de jornada, sem transformar Modo Livre ou atividades complementares em crédito de progressão;
- atividades complementares continuam sem substituir a atividade planejada.

Estrutura:
- Dias 1–21: preservar referências e confirmar estabilidade;
- Dias 22–42: explorar evolução compatível com feedback e histórico;
- Dias 43–63: consolidar decisões e preparar autonomia;
- marcos nos dias 7, 14, 21, 28, 35, 42, 49, 56 e 63;
- recuperação ativa distribuída ao longo do ciclo.

O `programResolver` agora resolve o Ciclo 3 quando existe Journey Memory.
O `cycleCatalog` marca Evolução como gerador disponível.
A política do Modo Livre para o Ciclo 3 já existente passa a ser usada quando esse ciclo estiver ativo.


## Cycle 4 Engine — Autonomia

O Ciclo 4 agora possui gerador próprio e recebe `LongitudinalJourneyMemory` como entrada obrigatória.

Princípios:
- 84 dias de estrutura de jornada, sem alegação de prazo biológico para formação de hábito;
- autonomia cresce pela capacidade de decidir, não por aumento automático de volume;
- o usuário pode trocar determinadas variações dentro da própria sessão planejada;
- cada escolha é limitada a exercícios compatíveis com nível, equipamento, regiões/pontos de atenção e histórico;
- famílias com sinal de observação não recebem alternativas livres de progressão;
- uma família estável pode oferecer a referência atual, uma regressão compatível e, quando apropriado, uma próxima variação;
- trocar exercício não altera automaticamente séries, duração ou descanso;
- disponibilidade real continua orientando duração de referência;
- atividades complementares e Modo Livre não substituem a atividade principal;
- recuperação permanece uma escolha válida de autonomia.

Estrutura:
- Dias 1–28: até 1 escolha autônoma por sessão;
- Dias 29–56: até 2 escolhas;
- Dias 57–84: até 3 escolhas;
- escolhas são apenas dentro de slots validados pelo motor;
- marcos semanais avaliam coerência das decisões e continuidade.

A tela de treino agora mostra um cartão `AUTONOMIA NA SESSÃO` quando o dia oferece alternativas seguras.


## Jornada Contínua

A Jornada Contínua agora possui motor e estado próprios. Ela não é um Ciclo 5 com prazo final.

### Blocos renováveis de registro
- Cada bloco possui 14 práticas apenas como unidade técnica de persistência.
- Os 14 registros não são um desafio, meta biológica ou prazo para formar hábito.
- Ao concluir a última prática, o estado avança para um novo bloco.
- Cada bloco recebe `programId` próprio (`cycle-5-continuous-bN-...`), impedindo sobrescrita de sessões anteriores.
- A contagem longitudinal usa `programId + day`, portanto práticas de blocos diferentes permanecem distintas.

### Foco contínuo
O usuário pode escolher:
- manter a prática atual;
- força;
- condicionamento;
- mobilidade;
- bem-estar.

Alterar o foco abre um novo bloco técnico para preservar imutabilidade do histórico anterior. A Journey Memory não é apagada e continua fornecendo referências funcionais, disponibilidade, feedbacks e sinais de autonomia.

### Motor
`continuousJourneyEngine.ts`:
- usa a última referência funcional compatível por família;
- mantém filtros de nível, equipamento e pontos/regiões de atenção;
- permite escolhas autônomas leves dentro de variações compatíveis;
- não aumenta automaticamente séries, duração ou intensidade;
- usa disponibilidade recente como referência de tempo;
- inclui recuperação ativa sem compensação;
- mantém atividades complementares e Modo Livre fora do crédito de progressão planejada.

### Interface
`app/jornada/continua.tsx` é o hub da etapa contínua:
- mostra o bloco técnico atual;
- permite redefinir foco;
- mostra indicadores da Journey Memory;
- inicia a próxima prática;
- explica explicitamente que os blocos não definem prazo final.

A Home abre o hub quando a Jornada Contínua é a etapa atual.
A tela de treino preserva o número do bloco nas rotas e cria o próximo bloco ao concluir a última prática.
Minha Jornada e Modo Livre também resolvem o programa contínuo ativo.

## Revisão de instruções dos exercícios — desenvolvimento

Esta versão adiciona instruções estruturadas para os 49 exercícios do catálogo: posição inicial, apoio, preparação, execução, retorno, respiração, pontos de atenção e checagem do ambiente. O avatar agora só é exibido como demonstração quando o movimento está explicitamente mapeado; demonstrações genéricas ou incompatíveis são ocultadas e sinalizadas como em revisão. Todos os exercícios permanecem com `professionalReview.status = pending` até revisão formal por Profissional de Educação Física.

Documento de apoio: `docs/technical/EXERCISE_CATALOG_REVIEW.md`.
