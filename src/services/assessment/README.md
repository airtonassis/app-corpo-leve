# Avaliação Adaptativa — Força Leve V2

## Objetivo

O quiz não é uma lista fixa. O catálogo possui 90 perguntas e o motor escolhe apenas as perguntas elegíveis conforme idade, respostas anteriores, objetivo, experiência, equipamentos e pontos de atenção.

## Princípios

1. Perguntas `priority: 1` e `priority: 2` formam o núcleo da avaliação.
2. Perguntas condicionais usam `includeWhen`.
3. Perguntas `adultOnly` não aparecem para menores de 18 anos.
4. Campos antropométricos sensíveis são opcionais e marcados com `doNotScore`.
5. Respostas de bem-estar não geram diagnóstico psicológico nem "nota de saúde".
6. Dor, lesão, restrições e mal-estar influenciam `pontosAtencao` e devem limitar recomendações automáticas.
7. O motor de perfil é determinístico. Uma futura camada de IA pode interpretar e explicar o perfil, mas não deve substituir regras de segurança.

## Fluxo sugerido

1. `getNextQuestion()` escolhe a próxima pergunta elegível.
2. A tela salva a resposta em `QuizAnswerMap`.
3. As respostas podem ativar/desativar perguntas condicionais.
4. `canCompleteQuiz()` valida se todas as perguntas obrigatórias elegíveis foram respondidas.
5. `buildAssessmentProfile()` gera o perfil funcional.
6. `recommendInitialProgram()` aponta o programa inicial.

## Próxima implementação

Substituir `app/perfil/quiz.tsx` por um wizard que consuma `QUIZ_QUESTIONS` e `quizEngine.ts`, com persistência local da sessão.
