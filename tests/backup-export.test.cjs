'use strict';

const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const assert=require('node:assert/strict');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('let backupDialogFocusReturn=null;');
const end=html.indexOf('function validateBackup(payload){',start);
assert.ok(start>=0&&end>start,'Backup dialog and export functions are present');
const code=html.slice(start,end);

function fixture(preservedState=null){
  const elements=new Map();
  function el(id){
    if(!elements.has(id)){
      elements.set(id,{
        id,hidden:id==='backupDialog'||id==='backupDialogVerify',isConnected:true,textContent:'',
        classList:{toggle(){}},focus(){},
        click(){}
      });
    }
    return elements.get(id);
  }
  const links=[];
  let clock=Date.parse('2026-10-12T19:50:00.000Z');
  let shouldThrow=false;
  let saved=0;
  let currentBlob=null;
  const state=preservedState||{lastBackupAt:null,lastBackupVerifiedAt:null,units:Array.from({length:100},(_,i)=>({id:i+1}))};
  class Clock extends Date {
    constructor(...args){super(...(args.length?args:[clock]));}
    static now(){return clock;}
  }
  const document={
    activeElement:{isConnected:true,focus(){}},
    body:{appendChild(){}},
    getElementById:el,
    addEventListener(){},
    createElement(){
      const a={href:'',download:'',remove(){},
        click(){if(shouldThrow)throw new Error('download blocked');links.push(a.download);}};
      return a;
    }
  };
  const sandbox={
    Date:Clock,document,state,Blob,JSON,Number,
    URL:{createObjectURL(blob){currentBlob=blob;return 'blob:test';},revokeObjectURL(){}},
    setTimeout(){},
    backupPayload(){return {
      format:'noma-backup',backupVersion:1,appVersion:'test',
      createdAt:new Clock().toISOString(),
      state:JSON.parse(JSON.stringify(state))
    };},
    validateBackup(payload){
      if(payload.format!=='noma-backup'||payload.backupVersion!==1
        ||payload.state?.units?.length!==100)throw new Error('Not a valid backup');
    },
    setDataStatus(text){el('dataStatus').textContent=text;},
    save(){saved++;}
  };
  vm.runInNewContext(code,sandbox,{filename:'backup-export.js'});
  return {
    sandbox,state,links,el,
    advance(ms){clock+=ms;},
    blockDownload(){shouldThrow=true;},
    async exportedJson(){return currentBlob.text();},
    get saved(){return saved;}
  };
}
function chosenFile(name,text){
  return {name,size:Buffer.byteLength(text),text:async()=>text};
}
function pickerFile(file){
  return {target:{files:file?[file]:[],value:'previous'}};
}

test('Export explicitly says requested, shows filename and offers verification',()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  assert.equal(f.links.length,1);
  assert.equal(f.el('backupDialog').hidden,false);
  assert.equal(f.el('backupDialogTitle').textContent,'Descarga solicitada');
  assert.equal(f.el('backupDialogFile').textContent,f.links[0]);
  assert.equal(f.el('backupDialogVerify').hidden,false);
  assert.match(f.el('backupDialogMessage').textContent,/Verificar archivo descargado/);
  assert.match(f.el('dataStatus').textContent,/pendiente de verificar/);
  assert.equal(f.saved,1);
  assert.ok(Number.isFinite(f.state.lastBackupAt));
  assert.equal(f.state.lastBackupVerifiedAt,null);
});

test('Exports on the same day have distinct filenames',()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  f.advance(2000);
  f.sandbox.exportBackup();
  assert.equal(f.links.length,2);
  assert.notEqual(f.links[0],f.links[1]);
  assert.ok(f.links.every(name=>/^noma-backup-2026-10-12_[\d-]+\.json$/.test(name)));
});

test('Reopening downloaded JSON verifies exact original export without importing',async()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  const json=await f.exportedJson();
  const event=pickerFile(chosenFile(f.links[0],json));
  const priorUnit=JSON.stringify(f.state.units);
  await f.sandbox.verifyExportedBackup(event);
  assert.equal(f.el('backupDialogTitle').textContent,'Copia verificada');
  assert.equal(f.el('backupDialogVerify').hidden,true);
  assert.equal(f.state.lastBackupVerifiedAt,f.state.lastBackupAt);
  assert.equal(JSON.stringify(f.state.units),priorUnit,'verification must never import or modify learning');
  assert.match(f.el('dataStatus').textContent,/Copia verificada/);
  assert.equal(event.target.value,'');
});

test('A previous valid JSON is not passed off as the most recent export',async()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  const older=await f.exportedJson();
  const olderName=f.links[0];
  f.advance(3000);
  f.sandbox.exportBackup();
  await f.sandbox.verifyExportedBackup(pickerFile(chosenFile(olderName,older)));
  assert.equal(f.el('backupDialogTitle').textContent,'Copia anterior válida');
  assert.equal(f.state.lastBackupVerifiedAt,null);
});

test('A damaged JSON is not shown as verified',async()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  await f.sandbox.verifyExportedBackup(pickerFile(chosenFile(f.links[0],'{bad json')));
  assert.equal(f.el('backupDialogTitle').textContent,'No se ha podido verificar');
  assert.equal(f.state.lastBackupVerifiedAt,null);
});

test('Verification remains possible after app restart by matching export timestamp',async()=>{
  const first=fixture();
  first.sandbox.exportBackup();
  const json=await first.exportedJson();
  const copy=JSON.parse(JSON.stringify(first.state));
  const reopened=fixture(copy);
  await reopened.sandbox.verifyExportedBackup(pickerFile(chosenFile(first.links[0],json)));
  assert.equal(reopened.el('backupDialogTitle').textContent,'Copia verificada');
  assert.equal(reopened.state.lastBackupVerifiedAt,reopened.state.lastBackupAt);
});

test('Blocked download shows error and does not update export timestamp',()=>{
  const f=fixture();
  f.blockDownload();
  f.sandbox.exportBackup();
  assert.equal(f.saved,0);
  assert.equal(f.state.lastBackupAt,null);
  assert.equal(f.el('backupDialog').hidden,false);
  assert.match(f.el('backupDialogTitle').textContent,/No se pudo/);
  assert.equal(f.el('backupDialogVerify').hidden,true);
});

test('Canceling file selection leaves data unchanged',async()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  const before=f.saved;
  await f.sandbox.verifyExportedBackup(pickerFile(null));
  assert.equal(f.saved,before);
  assert.equal(f.state.lastBackupVerifiedAt,null);
});
