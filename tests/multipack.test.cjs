'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const extraIds=['travel','phrasal','work','technology','pharma','soccer','sports'];
function between(a,b){
  const x=html.indexOf(a),y=html.indexOf(b,x);
  assert.ok(x>=0&&y>x,'Missing code section '+a);
  return html.slice(x,y);
}
const units=Array.from({length:100},(_,i)=>({id:i+1,term:'unit '+(i+1),meaning:'example',en:'An example.',es:'Un ejemplo.'}));
function setup(){
  let saves=0, allowReset=true;
  const confirmations=[];
  const ctx=vm.createContext({
    Date,Set,Math,JSON,Number,
    alert(){throw new Error('Unexpected alert during a valid switch');},
    confirm(message){confirmations.push(message);return allowReset;},
    render(){},
    save(){saves++;}
  });
  for(const id of extraIds){
    const script=fs.readFileSync(path.join(__dirname,'..','packs',id+'.js'),'utf8');
    new vm.Script(script);
    vm.runInContext(script,ctx,{filename:'packs/'+id+'.js'});
  }
  for(const id of ['conversation',...extraIds]){
    const script=fs.readFileSync(path.join(__dirname,'..','packs',id+'-extra.js'),'utf8');
    new vm.Script(script);
    vm.runInContext(script,ctx,{filename:'packs/'+id+'-extra.js'});
  }
  const definitions=
    'let PACK_SIZE=100;\nlet baseUnits='+JSON.stringify(units)+';\n'
    +'const STATE_SCHEMA_VERSION=6;\n'
    +between('const EVERYDAY_UNITS=baseUnits;','const READER_TEXTS = [')
    +between('function initialState(){','const SQLiteStore =')
    +'let state=null;\n'
    +between('function migrateState(x){','function save(){');
  vm.runInContext(definitions,ctx,{filename:'noma-pack-state.js'});
  return {ctx,eval(js){return vm.runInContext(js,ctx);},
    approveReset(value){allowReset=value;},
    get confirmations(){return confirmations;},
    get saves(){return saves;}};
}
test('Nine hundred contextual units and new content scripts parse',()=>{
  const js=between('  <script>','</script>').replace(/^\s*<script>/,'');
  new vm.Script(js);
  const f=setup();
  assert.equal(f.eval('CONVERSATION_UNITS.length'),100);
  assert.equal(f.eval('PACK_CATALOG.length'),9);
  assert.equal(f.eval("PACK_CATALOG.filter(p=>p.units).length"),9);
  for(const id of extraIds){
    assert.equal(f.eval('packDefinition('+JSON.stringify(id)+').units.length'),100);
    assert.equal(f.eval('new Set(packDefinition('+JSON.stringify(id)+').units.map(u=>u.term)).size'),100);
    assert.equal(f.eval('packDefinition('+JSON.stringify(id)+').units.every(u=>u.term&&u.meaning&&u.en&&u.es&&u.en.toLowerCase().includes(u.term.toLowerCase()))'),true);
  }
  assert.equal(f.eval("new Set(CONVERSATION_UNITS.map(u=>u.id)).size"),100);
  assert.equal(f.eval("new Set(CONVERSATION_UNITS.map(u=>u.term)).size"),100);
  assert.equal(f.eval("CONVERSATION_UNITS.every(u=>u.term&&u.meaning&&u.en&&u.es)"),true);
});

test('Legacy 100-unit state with 23 learned words is preserved after roundtrip',()=>{
  const f=setup();
  f.eval("state=initialState();state.units.slice(0,23).forEach(u=>{u.recognition=1;u.status='learning'});state.sessionNumber=27;state.units[30].dueSession=31;state.wrongBook['31:word']={failures:3};");
  const before=f.eval("JSON.stringify({progress:state.units.map(u=>({id:u.id,recognition:u.recognition,production:u.production,dueSession:u.dueSession,mistakes:u.mistakes})),wrongBook:state.wrongBook,sessionNumber:state.sessionNumber})");
  f.eval("switchPack('conversation')");
  assert.equal(f.eval("state.activePackId"),'conversation');
  assert.equal(f.eval('state.units.length'),100);
  assert.equal(f.eval('PACK_SIZE'),100);
  f.eval("switchPack('everyday')");
  assert.equal(f.eval('state.units.length'),100);
  assert.equal(f.eval('PACK_SIZE'),100);
  assert.equal(f.eval("JSON.stringify({progress:state.units.map(u=>({id:u.id,recognition:u.recognition,production:u.production,dueSession:u.dueSession,mistakes:u.mistakes})),wrongBook:state.wrongBook,sessionNumber:state.sessionNumber})"),before);
});

test('Conversation changes survive a switch back to Everyday and another return',()=>{
  const f=setup();
  f.eval("state=initialState();switchPack('conversation');state.units[1].recognition=2;state.units[1].production=1;state.units[1].mistakes=3;state.units[1].dueSession=15;state.wrongBook['2:word']={failures:3};state.readerProgress.test={attempts:2};state.sessionNumber=12;");
  const saved=f.eval("JSON.stringify({progress:state.units.map(u=>({id:u.id,recognition:u.recognition,production:u.production,dueSession:u.dueSession,mistakes:u.mistakes})),wrongBook:state.wrongBook,readerProgress:state.readerProgress,sessionNumber:state.sessionNumber})");
  f.eval("switchPack('everyday');state.units[0].recognition=1;switchPack('conversation')");
  assert.equal(f.eval("JSON.stringify({progress:state.units.map(u=>({id:u.id,recognition:u.recognition,production:u.production,dueSession:u.dueSession,mistakes:u.mistakes})),wrongBook:state.wrongBook,readerProgress:state.readerProgress,sessionNumber:state.sessionNumber})"),saved);
});

test('Serialized SQLite state restores its active and inactive packs',()=>{
  const f=setup();
  f.eval("state=initialState();state.units[6].recognition=1;switchPack('conversation');state.units[4].production=1;");
  const snapshot=f.eval('JSON.stringify(state)');
  const reopened=setup();
  reopened.eval("const recovered=JSON.parse("+JSON.stringify(snapshot)+");selectPackContent(recovered.activePackId);state=migrateState(recovered);");
  assert.equal(reopened.eval('state.activePackId'),'conversation');
  assert.equal(reopened.eval('state.units[4].production'),1);
  reopened.eval("switchPack('everyday')");
  assert.equal(reopened.eval('state.units[6].recognition'),1);
});

test('Pack switching preserves global backup timestamps',()=>{
  const f=setup();
  f.eval("state=initialState();state.lastBackupAt=123450;state.lastBackupVerifiedAt=123450;switchPack('conversation');switchPack('everyday')");
  assert.equal(f.eval('state.lastBackupAt'),123450);
  assert.equal(f.eval('state.lastBackupVerifiedAt'),123450);
});

test('Backup v1 restores Everyday, and v2 includes all saved packs',()=>{
  const f=setup();
  vm.runInContext("const BACKUP_FORMAT='noma-backup';const BACKUP_VERSION=2;\n"+between('function validateBackup(payload){','async function importBackup(event){'),f.ctx);
  f.eval("state=initialState();state.units[0].recognition=1");
  const legacy=f.eval("JSON.stringify({format:'noma-backup',backupVersion:1,state:state})");
  assert.equal(f.eval('validateBackup(JSON.parse('+JSON.stringify(legacy)+')).units.length'),100);
  f.eval("switchPack('conversation');state.units[0].production=1");
  const modern=f.eval("JSON.stringify({format:'noma-backup',backupVersion:2,state:state})");
  assert.equal(f.eval('validateBackup(JSON.parse('+JSON.stringify(modern)+')).units.length'),100);
  assert.equal(f.eval('validateBackup(JSON.parse('+JSON.stringify(modern)+')).packStates.everyday.units[0].recognition'),1);
});

test('Malformed inactive-pack data is rejected without mutating the current pack',()=>{
  const f=setup();
  vm.runInContext("const BACKUP_FORMAT='noma-backup';const BACKUP_VERSION=2;\n"+between('function validateBackup(payload){','async function importBackup(event){'),f.ctx);
  f.eval("state=initialState();switchPack('conversation')");
  assert.throws(()=>f.eval("validateBackup({format:'noma-backup',backupVersion:2,state:{...state,packStates:{everyday:{units:[{id:1}]}}}})"),/no es válido/);
  assert.equal(f.eval('state.activePackId'),'conversation');
});


test('Home renders ten-item conversation practice without showing wrong-pack audio',()=>{
  const f=setup();
  vm.runInContext(
    "const READER_TEXTS=[];"
    +"function escapeHtml(x){return x;}"
    +"function renderTop(){return '';}"
    +"function renderNav(){return '';}"
    +"function wordProgressCount(){return state.units.filter(u=>u.recognition>=1).length;}"
    +"function sentenceProgressCount(){return state.units.filter(u=>u.production>=1).length;}"
    +"function combinedProgressCount(){return state.units.filter(u=>u.recognition>=1&&u.production>=1).length;}"
    +"function modeProgressCount(mode){return mode==='word'?wordProgressCount():mode==='sentence'?sentenceProgressCount():combinedProgressCount();}"
    +"function modeLeftCount(){return PACK_SIZE-modeProgressCount(state.practiceMode);}"
    +"function knownCount(){return state.units.filter(u=>u.status==='known').length;}"
    +"function unstableCount(){return 0;}"
    +"function listenFirstStats(){return {pct:null};}"
    +"function pronounceFirstStats(){return {pct:null};}"
    +"function activeReaders(){return Array.from({length:10});}"
    +between('function home(){','function exercise(){'),
    f.ctx
  );
  f.eval("state=initialState();");
  const everyday=f.eval("home()");
  assert.match(everyday,/Empezar Listen Once/);
  f.eval("switchPack('conversation')");
  const conversation=f.eval("home()");
  assert.match(conversation,/Natural Conversations/);
  assert.match(conversation,/Hasta 10 ejercicios/);
  assert.doesNotMatch(conversation,/Empezar Listen Once/);
  assert.doesNotMatch(conversation,/Empezar Pronounce/);
  assert.match(conversation,/Abrir Tiny Reader/);
});
test('Pack catalog renders nine selectable packs and contextual reset actions',()=>{
  const f=setup();
  vm.runInContext(
    "function escapeHtml(x){return x;}"
    +"function renderTop(){return '';}"
    +"function renderNav(){return '';}"
    +"function wordProgressCount(){return 0;}"
    +"function sentenceProgressCount(){return 0;}"
    +"function combinedProgressCount(){return 0;}"
    +between('function pack(){','function readerText('),
    f.ctx
  );
  f.eval("state=initialState()");
  const catalogue=f.eval("pack()");
  assert.match(catalogue,/Travel &amp; Situations|Travel & Situations/);
  assert.match(catalogue,/MES, IT, AI &amp; Pharma|MES, IT, AI & Pharma/);
  assert.match(catalogue,/Sports General/);
  assert.match(catalogue,/Natural Conversations/);
  assert.equal((catalogue.match(/En preparación/g)||[]).length,0);
  assert.equal((catalogue.match(/Usar paquete/g)||[]).length,8);
  assert.equal((catalogue.match(/Reiniciar paquete/g)||[]).length,1);
  f.eval("switchPack('pharma')");
  const after=f.eval("pack()");
  assert.equal((after.match(/Usar paquete/g)||[]).length,8);
  assert.equal((after.match(/Reiniciar paquete/g)||[]).length,2);
});

test('All seven new packs switch and keep their own progress independently',()=>{
  const f=setup();
  f.eval("state=initialState();state.units[0].recognition=2;state.wrongBook['1:word']={failures:2}");
  for(const id of extraIds){
    f.eval('switchPack('+JSON.stringify(id)+')');
    assert.equal(f.eval('state.activePackId'),id);
    assert.equal(f.eval('state.units.length'),100);
    assert.equal(f.eval('state.units[0].recognition'),0);
    f.eval("state.units[0].recognition=1;state.units[0].production=1;state.wrongBook['1:word']={failures:3}");
  }
  f.eval("switchPack('everyday')");
  assert.equal(f.eval('state.units[0].recognition'),2);
  assert.equal(f.eval("state.wrongBook['1:word'].failures"),2);
  for(const id of extraIds){
    f.eval('switchPack('+JSON.stringify(id)+')');
    assert.equal(f.eval('state.units[0].recognition'),1);
    assert.equal(f.eval('state.units[0].production'),1);
    assert.equal(f.eval("state.wrongBook['1:word'].failures"),3);
  }
});

test('Resetting the active pack clears all its learning while preserving others',()=>{
  const f=setup();
  f.eval("state=initialState();state.units[0].recognition=2;state.sessionNumber=9;state.wrongBook['1:word']={failures:5}");
  f.eval("switchPack('pharma')");
  f.eval("state.units[0].recognition=3;state.units[0].production=2;state.units[0].mistakes=4;state.wrongBook['1:word']={failures:4};state.sessionNumber=17;state.readerProgress.demo={attempts:2};state.lastBackupAt=456;state.lastBackupVerifiedAt=456");
  assert.equal(f.eval("resetPack('pharma')"),true);
  assert.equal(f.eval('state.activePackId'),'pharma');
  assert.equal(f.eval('state.units.length'),100);
  assert.equal(f.eval('state.units[0].recognition'),0);
  assert.equal(f.eval('state.units[0].production'),0);
  assert.equal(f.eval('state.units[0].mistakes'),0);
  assert.equal(f.eval('state.sessionNumber'),0);
  assert.equal(f.eval('Object.keys(state.wrongBook).length'),0);
  assert.equal(f.eval('Object.keys(state.readerProgress).length'),0);
  assert.equal(f.eval('state.lastBackupAt'),456);
  assert.equal(f.eval('state.lastBackupVerifiedAt'),456);
  assert.match(f.confirmations[0],/MES, IT, AI & Pharma/);
  f.eval("switchPack('everyday')");
  assert.equal(f.eval('state.units[0].recognition'),2);
  assert.equal(f.eval("state.wrongBook['1:word'].failures"),5);
  assert.equal(f.eval('state.sessionNumber'),9);
});

test('Resetting an inactive pack removes only its snapshot',()=>{
  const f=setup();
  f.eval("state=initialState();state.units[0].recognition=1;switchPack('travel');state.units[0].recognition=2;state.wrongBook['1:word']={failures:7};switchPack('phrasal');state.units[0].production=1");
  assert.equal(f.eval("resetPack('travel')"),true);
  assert.equal(f.eval("Object.prototype.hasOwnProperty.call(state.packStates,'travel')"),false);
  assert.equal(f.eval('state.activePackId'),'phrasal');
  assert.equal(f.eval('state.units[0].production'),1);
  f.eval("switchPack('travel')");
  assert.equal(f.eval('state.activePackId'),'travel');
  assert.equal(f.eval('state.units[0].recognition'),0);
  assert.equal(f.eval('Object.keys(state.wrongBook).length'),0);
  f.eval("switchPack('everyday')");
  assert.equal(f.eval('state.units[0].recognition'),1);
});

test('Cancel and invalid reset do not modify any state or persist it',()=>{
  const f=setup();
  f.eval("state=initialState();state.units[0].recognition=2");
  f.approveReset(false);
  const before=f.eval('JSON.stringify(state)');
  const saved=f.saves;
  assert.equal(f.eval("resetPack('everyday')"),false);
  assert.equal(f.eval("resetPack('travel')"),false);
  assert.equal(f.eval("resetPack('not_a_pack')"),false);
  assert.equal(f.eval('JSON.stringify(state)'),before);
  assert.equal(f.saves,saved);
});

test('Backup v2 recognizes new packs after switch and restore',()=>{
  const f=setup();
  vm.runInContext("const BACKUP_FORMAT='noma-backup';const BACKUP_VERSION=2;\n"+between('function validateBackup(payload){','async function importBackup(event){'),f.ctx);
  f.eval("state=initialState();switchPack('sports');state.units[4].recognition=2;switchPack('technology');state.units[6].production=1");
  const json=f.eval("JSON.stringify({format:'noma-backup',backupVersion:2,state:state})");
  const restored=f.eval('validateBackup(JSON.parse('+JSON.stringify(json)+'))');
  assert.equal(restored.activePackId,'technology');
  assert.equal(restored.packStates.sports.units[4].recognition,2);
  assert.equal(restored.packStates.everyday.units.length,100);
});

test('Old 30-unit progress migrates to 100 without resetting learned IDs, reviews or reading history',()=>{
  const f=setup();
  f.eval("state=initialState();switchPack('travel');state.units[2].recognition=2;state.units[2].production=1;state.units[2].mistakes=5;state.units[2].dueSession=29;state.readerProgress['travel-01']={attempts:2,bestScore:5,lastScore:4,lastRead:111};state.wrongBook['3:word']={failures:4};state.sessionNumber=12");
  const old=f.eval("JSON.stringify({...state,units:state.units.slice(0,30)})");
  assert.equal(f.eval("isStoredStateValid(JSON.parse("+JSON.stringify(old)+"))"),true);
  const z=setup();
  z.eval("selectPackContent('travel');state=migrateState(JSON.parse("+JSON.stringify(old)+"))");
  assert.equal(z.eval('state.units.length'),100);
  assert.equal(z.eval('state.units[2].recognition'),2);
  assert.equal(z.eval('state.units[2].production'),1);
  assert.equal(z.eval('state.units[2].mistakes'),5);
  assert.equal(z.eval('state.units[2].dueSession'),29);
  assert.equal(z.eval('state.units[30].recognition'),0);
  assert.equal(z.eval("state.readerProgress['travel-01'].attempts"),2);
  assert.equal(z.eval("state.wrongBook['3:word'].failures"),4);
  assert.equal(z.eval('state.sessionNumber'),12);
});

test('Inactive legacy 30-unit snapshots are still selectable after catalog expansion',()=>{
  const f=setup();
  f.eval("state=initialState();state.packStates.pharma={...packSnapshot(state),units:packDefinition('pharma').units.slice(0,30).map(u=>({...u,recognition:1,production:0,reviewMode:null,unstableModes:[]})),sessionNumber:7};");
  assert.equal(f.eval("isPackSnapshotValid('pharma',state.packStates.pharma)"),true);
  f.eval("switchPack('pharma')");
  assert.equal(f.eval('state.units.length'),100);
  assert.equal(f.eval('state.units[29].recognition'),1);
  assert.equal(f.eval('state.units[30].recognition'),0);
  assert.equal(f.eval('state.sessionNumber'),7);
});

test('Invalid pack identifiers and reordered or duplicate units are rejected',()=>{
  const f=setup();
  f.eval("state=initialState();switchPack('sports')");
  assert.equal(f.eval("isStoredStateValid({...state,units:[state.units[2],state.units[0]]})"),false);
  assert.equal(f.eval("isStoredStateValid({...state,units:[state.units[0],state.units[0]]})"),false);
  assert.equal(f.eval("isStoredStateValid({...state,units:[]})"),false);
});
