// Noma offline app shell. User progress remains in local SQLite/IndexedDB.
const VERSION='0.21.0-beta.1';
const CACHE='noma-app-shell-'+VERSION;
const SHELL=[
  './', './index.html',
  // Preserve the existing manifest URL so installed WebAPKs can track updates.
  './manifest.webmanifest?v=0.20.4-beta.1',
  './icon-192.png?v='+VERSION, './icon-512.png?v='+VERSION,
  './diagnostico.html', './app-mark.svg', './audio-prueba.html'
];
const SQLITE_ASSETS=[
  'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.min.js',
  'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.wasm'
];
// External SQLite resources are cached on first use, never as a condition for installation.
const CACHEABLE=[...SHELL];
const INSTALL_ASSET_PATHS=new Set(['./manifest.webmanifest','./icon-192.png','./icon-512.png']
  .map(path=>new URL(path,self.registration.scope).pathname));
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
      // One stalled asset must not leave the new Service Worker installing forever.
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),8000);
      let response;
      try{response=await fetch(request,{signal:controller.signal});}
      finally{clearTimeout(timer);}
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
  // Manifest and install icons must not remain locked to old cached designs.
  // Prefer a fresh response; fall back to caches only when offline.
  if(INSTALL_ASSET_PATHS.has(url.pathname)){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-cache'});
        if(response.ok){
          const cache=await caches.open(CACHE);
          await cache.put(request,response.clone());
        }
        return response;
      }catch(e){return await caches.match(request)||Response.error();}
    })());
    return;
  }
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
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),6500);
      try{
        const response=await fetch(request,{signal:controller.signal});
        const shellRoot=new URL('./',self.registration.scope).pathname;
        const shellIndex=new URL('./index.html',self.registration.scope).pathname;
        if(response.ok&&!response.redirected&&(url.pathname===shellRoot||url.pathname===shellIndex)){
          const cache=await caches.open(CACHE);
          await cache.put(asURL('./index.html'),response.clone());
        }
        return response;
      }catch(e){
        const backup=await caches.match(request)
          || await caches.match(asURL('./index.html'))
          || await caches.match(asURL('./'));
        if(backup)return backup;
        // A usable error is better than an indefinitely stalled Android splash.
        return new Response('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Noma · reconectar</title><body style="font:16px system-ui;background:#f5f3ee;color:#1f4d3b;padding:32px 18px"><h1>Noma no ha podido cargar</h1><p>Comprueba la conexión a Internet y vuelve a intentarlo. No se han borrado tus datos.</p><p><a href="./" style="color:#1f4d3b;font-weight:bold">Reintentar</a></p></body></html>',
          {status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
      }finally{
        clearTimeout(timer);
      }
    })());
    return;
  }
  if(SHELL.some(path=>asURL(path)===url.href)){
    event.respondWith((async()=>await caches.match(request)||await fetch(request))());
  }
});
