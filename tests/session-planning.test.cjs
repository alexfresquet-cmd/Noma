'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');

const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start = html.indexOf('function setPracticeMode(mode){');
const end = html.indexOf('function currentTask(){',start);
assert.ok(start>0 && end>start,'session planner section must exist');
const planner = html.slice(start,end);

function unit(id,overrides={}){
  return {
    id,status:'new',recognition:0,production:0,recall:0,
    dueSession:null,reviewKind:null,reviewMode:null,lastSeen:0,
    listenDueSession:null,listenAttempts:0,listenLastSeen:0,
    pronounceDueSession:null,pronounceAttempts:0,pronounceLastSeen:0,
    ...overrides
  };
}

function createState(mode,units){
  const state={practiceMode:mode,sessionNumber:0,units,session:null,screen:'home'};
  const sandbox={
    state,
    save(){},render(){},
    shuffleTasks:items=>[...items],
    leftCount:()=>0,
    progressSnapshot:()=>({word:0,sentence:0,combined:0}),
    requestAnimationFrame(){},
    window:{scrollTo(){}},
    Math,Date
  };
  vm.runInNewContext(planner,sandbox,{filename:'session-planner.js'});
  return {state,sandbox};
}

function checkSession(state,size,mode){
  assert.equal(state.session?.tasks.length,size);
  assert.equal(state.session?.mode,mode);
  const ids=state.session.tasks.map(t=>t.unitId);
  assert.equal(new Set(ids).size,ids.length,'one unit at most once per session');
}

test('Noma inline JavaScript parses',()=>{
  const open=html.indexOf('  <script>');
  const close=html.lastIndexOf('</script>');
  assert.ok(open>0 && close>open);
  new vm.Script(html.slice(open+'  <script>'.length,close),{filename:'noma-inline.js'});
});

test('Word with 100 fresh words plans 10 unique tasks',()=>{
  const {state,sandbox}=createState('word',Array.from({length:100},(_,i)=>unit(i+1)));
  sandbox.buildSession();
  checkSession(state,10,'word');
  assert.ok(state.session.tasks.every(t=>t.type==='word'));
});

test('Word with 23 completed and 77 scheduled for later still plans 10',()=>{
  const units=Array.from({length:100},(_,i)=>i<23
    ?unit(i+1,{status:'known',recognition:1,production:1,recall:1})
    :unit(i+1,{status:'unstable',recognition:0,reviewKind:'forget',reviewMode:'word',dueSession:999}));
  const original=JSON.stringify(units);
  const {state,sandbox}=createState('word',units);
  sandbox.buildSession();
  checkSession(state,10,'word');
  assert.equal(JSON.stringify(units),original,'planning does not change user progress or review schedules');
});

test('Word includes already-learned but unstable units if these are all remaining',()=>{
  const units=Array.from({length:100},(_,i)=>i<23
    ?unit(i+1,{status:'known',recognition:1,production:1,recall:1})
    :unit(i+1,{status:'unstable',recognition:1,reviewKind:'forget',reviewMode:'word',dueSession:999}));
  const {state,sandbox}=createState('word',units);
  sandbox.buildSession();
  checkSession(state,10,'word');
});

test('Word uses due recall first but continues with additional words',()=>{
  const units=Array.from({length:100},(_,i)=>i<2
    ?unit(i+1,{status:'unstable',recognition:0,reviewKind:'forget',reviewMode:'word',dueSession:1})
    :unit(i+1));
  const {state,sandbox}=createState('word',units);
  sandbox.buildSession();
  checkSession(state,10,'word');
  assert.equal(state.session.tasks.filter(t=>t.type==='recall').length,2);
});

test('Word near completion ends only when fewer than 10 need work',()=>{
  const units=Array.from({length:100},(_,i)=>i<98
    ?unit(i+1,{status:'known',recognition:1,production:1,recall:1})
    :unit(i+1));
  const {state,sandbox}=createState('word',units);
  sandbox.buildSession();
  checkSession(state,2,'word');
});

test('Sentence fills 10 even when incomplete units have deferred reviews',()=>{
  const units=Array.from({length:100},(_,i)=>i<23
    ?unit(i+1,{status:'known',recognition:1,production:1,recall:1})
    :unit(i+1,{status:'unstable',production:0,reviewMode:'sentence',reviewKind:'forget',dueSession:999}));
  const {state,sandbox}=createState('sentence',units);
  sandbox.buildSession();
  checkSession(state,10,'sentence');
});

test('Combined uses up to 10 unique pending units',()=>{
  const units=Array.from({length:100},(_,i)=>i<23
    ?unit(i+1,{status:'known',recognition:1,production:1,recall:1})
    :unit(i+1,{status:'unstable',recognition:0,production:0,reviewKind:'forget',reviewMode:'word',dueSession:999}));
  const {state,sandbox}=createState('mix',units);
  sandbox.buildSession();
  checkSession(state,10,'mix');
  assert.ok(state.session.tasks.some(t=>t.type==='word'));
  assert.ok(state.session.tasks.some(t=>t.type==='sentence'));
});

test('Listen Once fills 10 and does not repeat units with all reviews deferred',()=>{
  const units=Array.from({length:100},(_,i)=>unit(i+1,{listenDueSession:999,listenAttempts:1}));
  const {state,sandbox}=createState('mix',units);
  sandbox.buildListenSession();
  checkSession(state,10,'listen');
});

test('Pronounce fills 10 and does not repeat units with all reviews deferred',()=>{
  const units=Array.from({length:100},(_,i)=>unit(i+1,{pronounceDueSession:999,pronounceAttempts:1}));
  const {state,sandbox}=createState('mix',units);
  sandbox.buildPronounceSession();
  checkSession(state,10,'pronounce');
});

test('early finish remains available for each ten-item mode',()=>{
  assert.match(html,/!\['word','sentence','mix','listen','pronounce'\]\.includes\(s\.mode\)/);
  assert.match(html,/const canFinish=\['word','sentence','mix','listen','pronounce'\]\.includes\(s\.mode\)/);
});
