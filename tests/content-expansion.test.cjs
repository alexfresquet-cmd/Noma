'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=['everyday','conversation','travel','phrasal','work','technology','pharma','soccer','sports'];
const newer=ids.filter(x=>x!=='everyday');

function runFile(ctx,pathInRepo){
  const code=fs.readFileSync(path.join(root,pathInRepo),'utf8');
  new vm.Script(code,{filename:pathInRepo});
  vm.runInContext(code,ctx,{filename:pathInRepo});
}
function getContent(){
  const ctx=vm.createContext({Math,Number,Set,JSON,Date});
  runFile(ctx,'readers/builder.js');
  for(const id of ids)runFile(ctx,'readers/'+id+'.js');
  for(const id of newer)runFile(ctx,'packs/'+id+'-extra.js');
  for(const id of newer.filter(x=>x!=='conversation'))runFile(ctx,'packs/'+id+'.js');
  return ctx;
}

test('All 17 theme content files load before inline application',()=>{
  const scripts=[...html.matchAll(/<script src="\.\/(packs|readers)\/([^"]+)"><\/script>/g)].map(x=>x[1]+'/'+x[2]);
  const expected=[
    ...newer.filter(x=>x!=='conversation').map(id=>'packs/'+id+'.js'),
    ...newer.map(id=>'packs/'+id+'-extra.js'),
    'readers/builder.js',
    ...ids.map(id=>'readers/'+id+'.js')
  ];
  for(const pathInRepo of expected){
    assert.equal(scripts.filter(x=>x===pathInRepo).length,1,'missing '+pathInRepo);
    assert.ok(fs.existsSync(path.join(root,pathInRepo)),'file not found '+pathInRepo);
  }
  assert.ok(scripts.indexOf('readers/builder.js')<scripts.indexOf('readers/everyday.js'));
});

test('Every theme has one hundred stable unique entries after original thirty',()=>{
  const ctx=getContent();
  for(const id of newer){
    const ext=vm.runInContext('globalThis.NOMA_UNIT_EXTENSIONS['+JSON.stringify(id)+']',ctx);
    assert.equal(ext.length,70,id);
    assert.deepEqual(Array.from(ext,u=>u.id),Array.from({length:70},(_,i)=>i+31),id);
    assert.equal(new Set(ext.map(u=>u.term.toLowerCase())).size,70,id);
    for(const u of ext){
      assert.ok(u.term&&u.meaning&&u.en&&u.es,id+' '+u.id+' missing copy');
      assert.ok(u.en.toLowerCase().includes(u.term.toLowerCase()),id+' '+u.id+' cannot build cloze');
      assert.ok(u.en.length>=13&&u.es.length>=13,id+' '+u.id+' unusable example');
    }
  }
  const allFiles=fs.readdirSync(path.join(root,'packs'));
  assert.ok(allFiles.length>=15);
});

test('Each of nine themes has exactly ten readable stories and six valid questions',()=>{
  const ctx=getContent();
  const original=html.slice(html.indexOf('const READER_TEXTS = ['),html.indexOf('function initialState(){'));
  vm.runInContext(original,ctx);
  assert.equal(vm.runInContext('READER_TEXTS.length',ctx),8);
  for(const id of ids){
    const stories=vm.runInContext('globalThis.NOMA_PACK_READERS['+JSON.stringify(id)+']',ctx);
    assert.equal(stories.length,id==='everyday'?2:10,id);
    assert.equal(new Set(stories.map(r=>r.id)).size,stories.length,id);
    for(const story of stories){
      assert.ok(story.title&&story.description&&story.paragraphs.length>=4,id+' '+story.id);
      const realWords=story.paragraphs.join(' ').trim().split(/\s+/).length;
      assert.equal(story.words,realWords,id+' '+story.id);
      assert.ok(story.words>=160&&story.words<=320,id+' '+story.id+' '+story.words+' words');
      assert.equal(story.questions.length,6,id+' '+story.id);
      for(const question of story.questions){
        assert.ok(question.q && question.options.length===3,id+' '+story.id);
        assert.ok(Number.isInteger(question.correct)&&question.correct>=0&&question.correct<=2);
        assert.equal(new Set(question.options.map(x=>x.toLowerCase())).size,3,id+' '+story.id);
        assert.ok(question.options[question.correct].length>1);
      }
    }
  }
});

test('Offline shell precaches the expanded content and reader libraries',()=>{
  const sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
  assert.match(sw,/const VERSION='0\.23\.0-beta\.1'/);
  assert.match(sw,/packs\/.*-extra\.js/);
  assert.match(sw,/readers\/builder\.js/);
  assert.match(sw,/readers\/.*\.js/);
});

test('All reader IDs are unique when combined with the eight original everyday readings',()=>{
  const ctx=getContent();
  const original=html.slice(html.indexOf('const READER_TEXTS = ['),html.indexOf('function initialState(){'));
  vm.runInContext(original,ctx);
  const idsAll=vm.runInContext("READER_TEXTS.map(x=>x.id).concat(Object.values(globalThis.NOMA_PACK_READERS).flat().map(x=>x.id))",ctx);
  assert.equal(idsAll.length,90);
  assert.equal(new Set(idsAll).size,90);
});
