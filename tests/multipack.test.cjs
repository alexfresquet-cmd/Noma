'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function between(a,b){
  const x=html.indexOf(a),y=html.indexOf(b,x);
  assert.ok(x>=0&&y>x,'Missing code section '+a);
  return html.slice(x,y);
}
const units=Array.from({length:100},(_,i)=>({id:i+1,term:'unit '+(i+1),meaning:'example',en:'An example.',es:'Un ejemplo.'}));
function setup(){
  let saves=0;
  const ctx=vm.createContext({
    Date,Set,Math,JSON,Number,
    alert(){throw new Error('Unexpected alert during a valid switch');},
    render(){},
    save(){saves++;}
  });
  const definitions=
    'let PACK_SIZE=100;\nlet baseUnits='+JSON.stringify(units)+';\n'
    +'const STATE_SCHEMA_VERSION=5;\n'
    +between('const EVERYDAY_UNITS=baseUnits;','const READER_TEXTS = [')
    +between('function initialState(){','const SQLiteStore =')
    +'let state=null;\n'
    +between('function migrateState(x){','function save(){');
  vm.runInContext(definitions,ctx,{filename:'noma-pack-state.js'});
  return {ctx,eval(js){return vm.runInContext(js,ctx);},get saves(){return saves;}};
}
test('Inline application and thirty curated conversation units parse',()=>{
  const js=between('  <script>','</script>');
  new vm.Script(js);
  const f=setup();
  assert.equal(f.eval('CONVERSATION_UNITS.length'),30);
  assert.equal(f.eval('PACK_CATALOG.length'),9);
  assert.equal(f.eval("PACK_CATALOG.filter(p=>p.units).length"),2);
  assert.equal(f.eval("new Set(CONVERSATION_UNITS.map(u=>u.id)).size"),30);
  assert.equal(f.eval("new Set(CONVERSATION_UNITS.map(u=>u.term)).size"),30);
  assert.equal(f.eval("CONVERSATION_UNITS.every(u=>u.term&&u.meaning&&u.en&&u.es)"),true);
});

test('Legacy 100-unit state with 23 learned words is preserved after roundtrip',()=>{
  const f=setup();
  f.eval("state=initialState();state.units.slice(0,23).forEach(u=>{u.recognition=1;u.status='learning'});state.sessionNumber=27;state.units[30].dueSession=31;state.wrongBook['31:word']={failures:3};");
  const before=f.eval("JSON.stringify({units:state.units,wrongBook:state.wrongBook,sessionNumber:state.sessionNumber})");
  f.eval("switchPack('conversation')");
  assert.equal(f.eval("state.activePackId"),'conversation');
  assert.equal(f.eval('state.units.length'),30);
  assert.equal(f.eval('PACK_SIZE'),30);
  f.eval("switchPack('everyday')");
  assert.equal(f.eval('state.units.length'),100);
  assert.equal(f.eval('PACK_SIZE'),100);
  assert.equal(f.eval("JSON.stringify({units:state.units,wrongBook:state.wrongBook,sessionNumber:state.sessionNumber})"),before);
});

test('Conversation changes survive a switch back to Everyday and another return',()=>{
  const f=setup();
  f.eval("state=initialState();switchPack('conversation');state.units[1].recognition=2;state.units[1].production=1;state.units[1].mistakes=3;state.units[1].dueSession=15;state.wrongBook['2:word']={failures:3};state.readerProgress.test={attempts:2};state.sessionNumber=12;");
  const saved=f.eval("JSON.stringify({units:state.units,wrongBook:state.wrongBook,readerProgress:state.readerProgress,sessionNumber:state.sessionNumber})");
  f.eval("switchPack('everyday');state.units[0].recognition=1;switchPack('conversation')");
  assert.equal(f.eval("JSON.stringify({units:state.units,wrongBook:state.wrongBook,readerProgress:state.readerProgress,sessionNumber:state.sessionNumber})"),saved);
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
  assert.equal(f.eval('validateBackup(JSON.parse('+JSON.stringify(modern)+')).units.length'),30);
  assert.equal(f.eval('validateBackup(JSON.parse('+JSON.stringify(modern)+')).packStates.everyday.units[0].recognition'),1);
});

test('Malformed inactive-pack data is rejected without mutating the current pack',()=>{
  const f=setup();
  vm.runInContext("const BACKUP_FORMAT='noma-backup';const BACKUP_VERSION=2;\n"+between('function validateBackup(payload){','async function importBackup(event){'),f.ctx);
  f.eval("state=initialState();switchPack('conversation')");
  assert.throws(()=>f.eval("validateBackup({format:'noma-backup',backupVersion:2,state:{...state,packStates:{everyday:{units:[{id:1}]}}}})"),/no es válido/);
  assert.equal(f.eval('state.activePackId'),'conversation');
});
