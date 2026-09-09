# Corpo Leve — Matriz de revisão do catálogo de exercícios

**Versão:** 1.0.0-development  
**Status:** conteúdo técnico de desenvolvimento; revisão profissional pendente.

## Objetivo

Esta matriz acompanha a implementação do catálogo de exercícios e serve como roteiro para a futura revisão por Profissional de Educação Física. A existência de instruções e animações no aplicativo não significa validação profissional.

## Campos implementados por exercício

- posição inicial e descrição da postura;
- apoio/equipamento;
- preparação;
- execução;
- retorno;
- respiração;
- pontos de atenção;
- checagem do ambiente quando aplicável;
- status de correspondência visual;
- status de validação profissional e versão.

## Regra visual

O app só apresenta o avatar como demonstração quando `visualGuide.status = mapped`. Para `reference_only` e `hidden`, a animação é substituída por uma mensagem de demonstração visual em revisão, evitando ensinar um movimento incompatível. `mapped` significa apenas que existe um mapeamento visual específico ou suficientemente correspondente na versão de desenvolvimento; não significa aprovação profissional.

## Catálogo

| ID | Exercício | Demonstração visual | Revisão profissional |
|---|---|---|---|
| `warm-march` | Marcha no lugar | Mapeado no app | Pendente |
| `warm-shoulder` | Mobilidade de ombros | Referência geral oculta no app | Pendente |
| `warm-hip` | Mobilidade de quadril | Mapeado no app | Pendente |
| `push-wall` | Flexão na parede | Mapeado no app | Pendente |
| `push-incline` | Flexão inclinada | Mapeado no app | Pendente |
| `push-knee` | Flexão com joelhos apoiados | Mapeado no app | Pendente |
| `push-standard` | Flexão convencional | Mapeado no app | Pendente |
| `squat-chair` | Sentar e levantar da cadeira | Mapeado no app | Pendente |
| `squat-body` | Agachamento livre | Mapeado no app | Pendente |
| `split-supported` | Afundo com apoio | Mapeado no app | Pendente |
| `lunge-reverse` | Afundo reverso | Mapeado no app | Pendente |
| `calf-raise` | Elevação de panturrilhas | Referência geral oculta no app | Pendente |
| `glute-bridge` | Ponte de glúteos | Mapeado no app | Pendente |
| `core-deadbug` | Dead bug adaptado | Mapeado no app | Pendente |
| `plank-high` | Prancha alta | Mapeado no app | Pendente |
| `plank-knee` | Prancha com joelhos apoiados | Mapeado no app | Pendente |
| `bird-dog` | Bird dog | Mapeado no app | Pendente |
| `row-bar-supported` | Remada australiana com apoio baixo | Mapeado no app | Pendente |
| `pullup-assisted` | Barra fixa assistida | Mapeado no app | Pendente |
| `pullup` | Barra fixa | Mapeado no app | Pendente |
| `cardio-step` | Passos laterais | Mapeado no app | Pendente |
| `cardio-march-fast` | Marcha acelerada | Mapeado no app | Pendente |
| `mountain-slow` | Escalador lento | Referência geral oculta no app | Pendente |
| `mob-catcow` | Mobilidade de coluna em quatro apoios | Mapeado no app | Pendente |
| `mob-ankle` | Mobilidade de tornozelo | Mapeado no app | Pendente |
| `mob-thoracic` | Rotação torácica suave | Oculto até revisão | Pendente |
| `mob-hip-flexor` | Mobilidade suave de quadril | Oculto até revisão | Pendente |
| `push-incline-high` | Flexão inclinada alta | Mapeado no app | Pendente |
| `push-decline-light` | Flexão com pés elevados leve | Referência geral oculta no app | Pendente |
| `squat-partial` | Agachamento parcial | Mapeado no app | Pendente |
| `squat-tempo` | Agachamento controlado | Mapeado no app | Pendente |
| `split-static-supported` | Afundo estático com apoio | Mapeado no app | Pendente |
| `step-up-low` | Subida em degrau baixo | Oculto até revisão | Pendente |
| `step-up-controlled` | Subida em degrau controlada | Oculto até revisão | Pendente |
| `core-deadbug-full` | Dead bug alternado | Mapeado no app | Pendente |
| `plank-wall` | Prancha na parede | Mapeado no app | Pendente |
| `plank-forearm` | Prancha de antebraços | Mapeado no app | Pendente |
| `side-plank-knee` | Prancha lateral com joelho apoiado | Mapeado no app | Pendente |
| `side-plank` | Prancha lateral | Mapeado no app | Pendente |
| `scapular-row` | Retração escapular em barra baixa | Referência geral oculta no app | Pendente |
| `row-bar-high` | Remada australiana alta | Mapeado no app | Pendente |
| `pullup-negative` | Descida controlada na barra | Referência geral oculta no app | Pendente |
| `cardio-step-touch` | Step touch leve | Mapeado no app | Pendente |
| `cardio-knee-lift` | Marcha com elevação de joelhos | Mapeado no app | Pendente |
| `cardio-shadow` | Deslocamento leve sem impacto | Referência geral oculta no app | Pendente |
| `mob-shoulder-wall` | Mobilidade de ombros na parede | Mapeado no app | Pendente |
| `mob-hip-90-90` | Mobilidade de quadril sentada | Oculto até revisão | Pendente |
| `mob-hamstring-dynamic` | Mobilidade dinâmica posterior | Referência geral oculta no app | Pendente |
| `mob-wrist` | Mobilidade de punhos | Referência geral oculta no app | Pendente |

## Critérios sugeridos para a revisão profissional

Para cada exercício, revisar nomenclatura, posição inicial, apoios, sequência do movimento, amplitude proposta, respiração, pontos de atenção, coerência com os níveis em que o exercício é disponibilizado, coerência das progressões/regressões, prescrição por tempo/repetições, descanso e correspondência do avatar. Após a revisão, atualizar `professionalReview.status` para `approved` ou `revision_required`, registrando versão, data e identificação profissional conforme a governança do projeto.
