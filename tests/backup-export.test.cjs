'use strict';

const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const assert=require('node:assert/strict');

const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('let backupDialogFocusReturn=null;');
const end=html.indexOf('function validateBackup(payload){',start);
assert.ok(start>=0 && end>start,'Backup dialog and export functions are present');
const code=html.slice(start,end);

function fixture(){
  const elements=new Map();
  function el(id){
    if(!elements.has(id)){
      elements.set(id,{
        id,hidden:id==='backupDialog',isConnected:true,textContent:'',
        classList:{toggle(){}},focus(){}
      });
    }
    return elements.get(id);
  }
  const links=[];
  let clock=Date.parse('2026-10-12T19:50:00.000Z');
  let shouldThrow=false;
  let saved=0;
  const state={lastBackupAt:null};
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
    Date:Clock,document,state,Blob,JSON,
    URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}},
    setTimeout(){},
    backupPayload(){return {state:{lastBackupAt:null}};},
    setDataStatus(text){el('dataStatus').textContent=text;},
    save(){saved++;},
  };
  vm.runInNewContext(code,sandbox,{filename:'backup-export.js'});
  return {
    sandbox,state,links,el,
    advance(ms){clock+=ms;},
    blockDownload(){shouldThrow=true;},
    get saved(){return saved;}
  };
}

test('Export displays visible dialog with filename, not an unverified saved claim',()=>{
  const f=fixture();
  f.sandbox.exportBackup();
  assert.equal(f.links.length,1);
  assert.equal(f.el('backupDialog').hidden,false);
  assert.equal(f.el('backupDialogTitle').textContent,'Copia preparada');
  assert.equal(f.el('backupDialogFile').textContent,f.links[0]);
  assert.match(f.el('backupDialogMessage').textContent,/comprueba.*Descargas/i);
  assert.match(f.el('dataStatus').textContent,/Descarga solicitada/);
  assert.equal(f.saved,1);
  assert.ok(Number.isFinite(f.state.lastBackupAt));
  f.sandbox.closeBackupDialog();
  assert.equal(f.el('backupDialog').hidden,true);
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

test('Blocked download shows error and does not update backup timestamp',()=>{
  const f=fixture();
  f.blockDownload();
  f.sandbox.exportBackup();
  assert.equal(f.saved,0);
  assert.equal(f.state.lastBackupAt,null);
  assert.equal(f.el('backupDialog').hidden,false);
  assert.match(f.el('backupDialogTitle').textContent,/No se pudo/);
  assert.equal(f.el('backupDialogFile').hidden,true);
});
