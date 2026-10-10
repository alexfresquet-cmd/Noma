// Noma offline app shell. User progress remains in local SQLite/IndexedDB.
const VERSION='0.20.2-beta.1';
const CACHE='noma-app-shell-'+VERSION;
const SHELL=[
  './', './index.html',
  './manifest.webmanifest?v='+VERSION,
  './icon-192.png?v='+VERSION, './icon-512.png?v='+VERSION,
  './diagnostico.html'
];
const SQLITE_ASSETS=[
  'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.min.js',
  'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.wasm'
];
const CACHEABLE=[...SHELL,...SQLITE_ASSETS];
const AUDIO_BASE=new URL('./audio/',self.registration.scope).pathname;
function isAudio(url){
  if(url.origin!==self.location.origin||!url.pathname.startsWith(AUDIO_BASE))return false;
  const parts=url.pathname.slice(AUDIO_BASE.length).split('/');
  const id=Number(parts[1]?.replace('.mp3',''));
  return parts.length===2 && ['listen','pronounce'].includes(parts[0])
    && parts[1]?.endsWith('.mp3') && Number.isInteger(id) && id>=1 && id<=100;
}
async function warmAudioCache(){
  const cache=await caches.open(CACHE);
  const paths=[];
  for(const folder of ['listen','pronounce']){
    for(let n=1;n<=100;n++)paths.push('./audio/'+folder+'/'+n+'.mp3');
  }
  let next=0;
  async function work(){
    while(next<paths.length){
      const path=paths[next++],url=asURL(path);
      if(await cache.match(url))continue;
      try{
        const response=await fetch(url,{cache:'reload'});
        if(response.ok&&response.type!=='opaque')await cache.put(url,response);
      }catch(e){/* Offline will retry missing clips on next online launch. */}
    }
  }
  await Promise.all(Array.from({length:4},()=>work()));
}
self.addEventListener('message',event=>{
  if(event.data?.type==='NOMA_CACHE_AUDIO')event.waitUntil(warmAudioCache());
});

const asURL=(path)=>new URL(path,self.registration.scope).href;
self.addEventListener('install',(event)=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Optional CDN resources must NEVER prevent the service worker from activating.
    // Cache individual files; diagnostics report which resources are unavailable.
    const results=await Promise.allSettled(CACHEABLE.map(async path=>{
      const request=new Request(asURL(path),{cache:'reload'});
      const response=await fetch(request);
      if(!response.ok)throw new Error(path+': HTTP '+response.status);
      await cache.put(request,response);
    }));
    for(let i=0;i<results.length;i++){
      if(results[i].status==='rejected')console.warn('[Noma offline] Could not precache',CACHEABLE[i],String(results[i].reason));
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const current=await caches.open(CACHE);
    // Keep an older working offline shell if this update could not cache the entry point.
    const hasShell=!!(await current.match(asURL('./index.html')));
    if(hasShell){
      for(const key of await caches.keys()){
        if(key.startsWith('noma-app-shell-')&&key!==CACHE) await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(SQLITE_ASSETS.includes(url.href)){
    event.respondWith((async()=>{
      const stored=await caches.match(request);
      if(stored)return stored;
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
      return response;
    })());
    return;
  }
  if(url.origin!==self.location.origin)return;
  if(isAudio(url)){
    event.respondWith((async()=>{
      const match=await caches.match(request);
      if(match)return match;
      const response=await fetch(request);
      if(response.ok&&response.type!=='opaque'){
        const cache=await caches.open(CACHE);
        await cache.put(request,response.clone());
      }
      return response;
    })());
    return;
  }
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        const shellRoot=new URL('./',self.registration.scope).pathname;
        const shellIndex=new URL('./index.html',self.registration.scope).pathname;
        if(response.ok&&!response.redirected&&(url.pathname===shellRoot||url.pathname===shellIndex)){
          const cache=await caches.open(CACHE);
          await cache.put(asURL('./index.html'),response.clone());
        }
        return response;
      }catch(e){
        return await caches.match(request) || await caches.match(asURL('./index.html'))
          || await caches.match(asURL('./')) || Response.error();
      }
    })());
    return;
  }
  if(SHELL.some(path=>asURL(path)===url.href)){
    event.respondWith((async()=>await caches.match(request)||await fetch(request))());
  }
});
