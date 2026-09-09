# Motor de Programas — Ciclo 1

O Ciclo 1 transforma o `AssessmentProfile` em 21 dias de calistenia, com sessões curtas, recuperação ativa e três fases: adaptação (1–7), progressão (8–14) e consolidação (15–21).

## Componentes desta versão

- `cycle1Engine.ts`: gera os 21 dias e as prescrições.
- `workout/progressionEngine.ts`: organiza famílias de regressão/progressão e seleciona a variação compatível com o perfil.
- `workout/restEngine.ts`: calcula descanso por categoria, objetivo, nível, fase e necessidade de progressão conservadora.
- `workout/executionStorage.ts`: persiste as execuções reais dos dias do programa.
- `app/programa/dia/[day].tsx`: execução guiada com cronômetro por série, descanso e feedback de esforço.

## Princípios

O cronômetro mede a execução, mas não recompensa velocidade. Técnica, conclusão segura, esforço percebido e consistência têm prioridade. Dias de recuperação fazem parte do programa; disciplina não significa treinar intensamente todos os dias.

O feedback `leve | adequado | dificil | interrompido` foi estruturado para alimentar a adaptação. Uma progressão só deve ocorrer após histórico consistente; uma execução interrompida pode recomendar regressão temporária. Pontos de atenção informados pelo usuário reduzem volume e evitam progressão agressiva.

## Avatar animado por perfil

A camada visual agora resolve uma variante de avatar a partir da resposta opcional `PERF_004`:
- `feminino` -> avatar feminino
- `masculino` -> avatar masculino
- `nao_informar`/ausente -> avatar neutro

A variante visual **não participa do cálculo de nível, volume, descanso ou progressão**. A prescrição continua baseada em capacidade, objetivo, experiência, disponibilidade e pontos de atenção.

`ExerciseAvatar` usa animações leves nativas do React Native e presets por padrão de movimento, sem dependência adicional. Para produção, a mesma interface pode receber arquivos vetoriais/3D específicos por exercício mantendo o fallback atual.


## Motor adaptativo por histórico

`adaptiveProgramEngine.ts` aplica ajustes apenas em dias ainda não concluídos, usando execuções salvas do mesmo programa.

Regras conservadoras:
- `interrompido`: regressão de uma variação quando possível + redução de volume;
- dois feedbacks seguidos `dificil/interrompido`: regressão conservadora + redução de volume;
- `dificil`: mantém a família e reduz discretamente o volume;
- três feedbacks seguidos `leve/adequado`: avança uma variação quando houver próxima opção;
- dias de recuperação não são intensificados pelo histórico.

O feedback não aumenta dificuldade por gênero/sexo e não cria metas de velocidade.
