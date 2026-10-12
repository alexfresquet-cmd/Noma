'use strict';

const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const assert=require('node:assert/strict');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

function between(start,end){
  const a=html.indexOf(start),b=html.indexOf(end,a);
  assert.ok(a>=0&&b>a,'Missing code segment '+start);
  return html.slice(a,b);
}

function fixture(overrides={}){
  const unit={
    id:1,status:'known',recognition:1,production:1,recall:1,
    mistakes:0,unstableModes:[],due:false,dueSession:null,
    reviewMode:null,reviewKind:null,lastSeen:0,lastSessionSeen:null,
    ...overrides
  };
  const state={units:[unit],sessionNumber:10,practiceMode:'word'};
  const sandbox={state,Date,Math};
  vm.runInNewContext(
    between('function skillUnstable(u,mode){','function textForgetCount(){')
    +between('function maybeKnown(u){','function scheduleListenReview(u, delay){')
    ,sandbox,{filename:'noma-progress.js'});
  const counts=()=>[
    sandbox.wordProgressCount(),
    sandbox.sentenceProgressCount(),
    sandbox.combinedProgressCount()
  ];
  return {unit,state,counts,sandbox};
}

test('Word failure only subtracts Word and Combined',()=>{
  const f=fixture();
  assert.deepEqual(f.counts(),[1,1,1]);
  f.sandbox.markFailure(f.unit,'word');
  assert.deepEqual(f.counts(),[0,1,0]);
  assert.equal(f.unit.reviewMode,'word');
});

test('Word recall restores Word without adding new Sentence points',()=>{
  const f=fixture();
  f.sandbox.markFailure(f.unit,'word');
  const sentenceBefore=f.sandbox.sentenceProgressCount();
  f.sandbox.markSuccess(f.unit,'recall','word');
  assert.deepEqual(f.counts(),[1,1,1]);
  assert.equal(f.sandbox.sentenceProgressCount(),sentenceBefore);
});

test('Sentence failure and recovery never alter Word count',()=>{
  const f=fixture();
  f.sandbox.markFailure(f.unit,'sentence');
  assert.deepEqual(f.counts(),[1,0,0]);
  f.sandbox.markSuccess(f.unit,'recall','sentence');
  assert.deepEqual(f.counts(),[1,1,1]);
});

test('An outstanding Sentence failure survives successful Word recall',()=>{
  const f=fixture();
  f.sandbox.markFailure(f.unit,'word');
  f.sandbox.markFailure(f.unit,'sentence');
  assert.deepEqual(f.counts(),[0,0,0]);
  f.sandbox.markSuccess(f.unit,'recall','word');
  assert.deepEqual(f.counts(),[1,0,0]);
  assert.equal(f.unit.status,'unstable');
  assert.equal(f.unit.reviewMode,'sentence');
  assert.ok(f.unit.dueSession>f.state.sessionNumber);
  f.sandbox.markSuccess(f.unit,'recall','sentence');
  assert.deepEqual(f.counts(),[1,1,1]);
});

test('Legacy unstable state maps to its recorded review mode without resetting scores',()=>{
  const segment=between('function migrateState(x){','function save(){');
  const sandbox={baseUnits:[{id:1,term:'test',meaning:'prueba',en:'A test.',es:'Una prueba.'}],Number,Set};
  vm.runInNewContext(segment,sandbox);
  const migrated=sandbox.migrateState({
    units:[{id:1,status:'unstable',recognition:1,production:1,recall:0,reviewMode:'word',due:true}],
    sessionNumber:8,screen:'home'
  });
  const u=migrated.units[0];
  assert.deepEqual(Array.from(u.unstableModes),['word']);
  assert.equal(u.recognition,1);
  assert.equal(u.production,1);
  assert.equal(u.dueSession,9);
  assert.equal(u.reviewMode,'word');
});

test('All existing instability flags survive app restart and migration',()=>{
  const segment=between('function migrateState(x){','function save(){');
  const sandbox={baseUnits:[{id:1}],Number,Set};
  vm.runInNewContext(segment,sandbox);
  const migrated=sandbox.migrateState({
    units:[{id:1,status:'unstable',unstableModes:['word','sentence'],recognition:1,production:1,due:true,reviewMode:'sentence'}],
    sessionNumber:8,screen:'home'
  });
  assert.deepEqual(Array.from(migrated.units[0].unstableModes),['word','sentence']);
});
