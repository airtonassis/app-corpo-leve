const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const source = require('node:fs').readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
};
const { QUIZ_QUESTIONS } = require('../src/data/quizQuestions.ts');
const engine = require('../src/services/assessment/quizEngine.ts');
const { buildAssessmentProfile } = require('../src/services/assessment/profileEngine.ts');
const { recommendInitialProgram } = require('../src/services/assessment/recommendationEngine.ts');
const { exerciseVisualDemoCatalog } = require('../src/data/exercises/visualDemoCatalog.ts');
const { calisthenicsExercises } = require('../src/data/exercises/calisthenics.ts');

function response(q, overrides) {
  if (Object.hasOwn(overrides, q.id)) return overrides[q.id];
  if (q.category === 'seguranca' && q.options?.some(o => o.value === 'nao')) return 'nao';
  if (q.type === 'number') return q.id === 'PERF_001' ? 25 : q.id === 'FIT_003' ? 30 : 5;
  if (q.type === 'multi') return [q.options?.[0]?.value ?? 'nenhum'];
  if (q.type === 'boolean') return 'sim';
  return q.options?.[0]?.value ?? 'resposta';
}
function simulate(overrides) {
  let answers = {}, asked = [];
  for (let step = 0; step < 100; step++) {
    const q = engine.getNextQuestion(answers, asked);
    if (!q) break;
    assert(!asked.includes(q.id), `duplicate ${q.id}`);
    assert(engine.isQuestionEligible(q, answers));
    asked.push(q.id);
    answers = engine.pruneIneligibleAnswers({ ...answers, [q.id]: response(q, overrides) });
    if (engine.shouldCompleteQuiz(answers, asked)) break;
  }
  assert(asked.length >= engine.QUIZ_MIN, `below minimum: ${asked.length}`);
  assert(asked.length <= engine.QUIZ_MAX, `above maximum: ${asked.length}`);
  assert(engine.canCompleteQuiz(answers), 'required question pending');
  assert.equal(new Set(asked).size, asked.length);
  const profile = buildAssessmentProfile(answers);
  assert(profile.nivelCalculado && Number.isFinite(profile.scoreForca));
  assert(recommendInitialProgram(profile));
  return { asked, answers, profile };
}
assert.equal(QUIZ_QUESTIONS.length, 90);
assert.equal(new Set(QUIZ_QUESTIONS.map(q => q.id)).size, QUIZ_QUESTIONS.length);
assert.equal(calisthenicsExercises.length, 49);
for (const demo of Object.values(exerciseVisualDemoCatalog)) {
  assert(demo.reviewStatus === 'pending' || demo.reviewStatus === 'revision_required');
  assert(demo.frames.length >= 1 && demo.frames.length <= 4);
  assert(calisthenicsExercises.some(exercise => exercise.id === demo.exerciseId));
}
assert.equal(engine.getNextQuestion({}, [])?.id, 'PERF_001');
assert(!engine.getEligibleQuestions({ PERF_001: 15 }).some(q => ['PERF_002','PERF_003','PERF_004'].includes(q.id)));
assert(!engine.getEligibleQuestions({ PERF_001: 25 }).some(q => q.id === 'FIT_002'));
const safety = simulate({ SAFE_001: 'sim', SAFE_004: 'sim', SAFE_006: 'sim' });
for (const id of ['SAFE_002','SAFE_005','SAFE_010']) assert(safety.asked.includes(id));
const changed = engine.pruneIneligibleAnswers({ ...safety.answers, SAFE_001: 'nao', SAFE_004: 'nao', SAFE_006: 'nao' });
for (const id of ['SAFE_002','SAFE_005','SAFE_010']) assert(!Object.hasOwn(changed,id), `stale branch ${id}`);
assert(!engine.getNextQuestion(changed, safety.asked));
assert(engine.isQuestionEligible(QUIZ_QUESTIONS.find(q => q.id === 'SAFE_001'), changed));
const counts = [];
for (const age of [15, 25]) for (const experience of ['nenhuma','avancada'])
for (const risk of [false,true]) for (const minutes of ['10','40'])
for (const equipment of [['nenhum'],['barra','banco']]) for (const available of ['nao','sim']) {
  const { asked, answers, profile } = simulate({ PERF_001: age, PERF_008: experience, SAFE_001: risk ? 'sim' : 'nao', SAFE_004: risk ? 'sim' : 'nao', SAFE_006: risk ? 'sim' : 'nao', OBJ_006: minutes, PERF_010: equipment, FIT_001: available === 'sim' ? 25 : 0 });
  if (age < 18) assert(!Object.hasOwn(answers,'PERF_003'));
  if (experience === 'avancada' && available === 'sim') assert(['base','intermediario','avancado'].includes(profile.nivelCalculado));
  counts.push(asked.length);
}
counts.sort((a,b) => a-b);
const median = (counts[31]+counts[32])/2;
console.log(JSON.stringify({ scenarios: counts.length, min: counts[0], mean: counts.reduce((a,b)=>a+b,0)/counts.length, median, p95: counts[Math.ceil(counts.length*.95)-1], max: counts.at(-1), specificDemos: Object.keys(exerciseVisualDemoCatalog).length }, null, 2));
